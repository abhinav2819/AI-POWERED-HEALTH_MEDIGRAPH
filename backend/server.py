from fastapi import FastAPI, APIRouter, HTTPException, Request, BackgroundTasks, Header
from fastapi.responses import StreamingResponse, PlainTextResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone
import httpx
import razorpay
from emergentintegrations.llm.chat import LlmChat, UserMessage, TextDelta, StreamDone
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app
app = FastAPI(title="MEDIGRAPH Backend Services")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Environment variables
EMERGENT_LLM_KEY = os.getenv("EMERGENT_LLM_KEY")
WHATSAPP_TOKEN = os.getenv("WHATSAPP_ACCESS_TOKEN")
WHATSAPP_PHONE_NUMBER_ID = os.getenv("WHATSAPP_PHONE_NUMBER_ID")
WHATSAPP_VERIFY_TOKEN = os.getenv("WHATSAPP_VERIFY_TOKEN")
GRAPH_API_VERSION = os.getenv("GRAPH_API_VERSION", "v21.0")
RAZORPAY_KEY_ID = os.getenv("RAZORPAY_KEY_ID")
RAZORPAY_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET")
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
SPRING_BOOT_URL = os.getenv("SPRING_BOOT_BACKEND_URL", "http://localhost:8080/api/health/v1")

# Razorpay client
razorpay_client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET)) if RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET else None

# WhatsApp Cloud API base URL
WHATSAPP_BASE_URL = f"https://graph.facebook.com/{GRAPH_API_VERSION}/{WHATSAPP_PHONE_NUMBER_ID}"

# Models
class ChatMessage(BaseModel):
    message: str
    session_id: str

class WhatsAppReportRequest(BaseModel):
    phone_number: str
    user_name: str
    report_summary: str
    metrics: Optional[Dict[str, Any]] = None

class PaymentOrderRequest(BaseModel):
    amount: int  # in paise
    currency: str = "INR"
    receipt: str
    notes: Optional[Dict[str, str]] = None

class VerifyPaymentRequest(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str

class Product(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str
    price: int  # in paise
    image_url: str
    category: str
    stock: int = 100

class GoogleAuthRequest(BaseModel):
    credential: str

# Google OAuth Authentication
@api_router.post("/auth/google")
async def google_auth(auth_request: GoogleAuthRequest):
    """
    Authenticate user with Google OAuth
    """
    if not GOOGLE_CLIENT_ID:
        raise HTTPException(status_code=500, detail="Google OAuth not configured")
    
    try:
        # Verify the Google ID token
        idinfo = id_token.verify_oauth2_token(
            auth_request.credential,
            google_requests.Request(),
            GOOGLE_CLIENT_ID
        )
        
        # Get user info from token
        email = idinfo.get('email')
        name = idinfo.get('name')
        picture = idinfo.get('picture')
        google_id = idinfo.get('sub')
        
        if not email:
            raise HTTPException(status_code=400, detail="Email not provided by Google")
        
        # Forward to Spring Boot backend for actual authentication
        async with httpx.AsyncClient(timeout=10.0) as client:
            try:
                # Try to login first
                login_response = await client.post(
                    f"{SPRING_BOOT_URL}/auth/login",
                    json={"username": email, "password": google_id}
                )
                
                if login_response.status_code == 200:
                    return login_response.json()
            except httpx.HTTPError:
                pass
            
            # If login fails, try to signup
            try:
                signup_response = await client.post(
                    f"{SPRING_BOOT_URL}/auth/signup",
                    json={"username": email, "password": google_id}
                )
                
                if signup_response.status_code in [200, 201]:
                    # After signup, login
                    login_response = await client.post(
                        f"{SPRING_BOOT_URL}/auth/login",
                        json={"username": email, "password": google_id}
                    )
                    
                    if login_response.status_code == 200:
                        result = login_response.json()
                        result['isNewUser'] = True
                        result['name'] = name
                        result['picture'] = picture
                        return result
            except Exception as e:
                logging.error(f"Signup failed: {str(e)}")
        
        raise HTTPException(status_code=500, detail="Failed to authenticate with backend")
        
    except ValueError as e:
        raise HTTPException(status_code=401, detail=f"Invalid Google token: {str(e)}")
    except Exception as e:
        logging.error(f"Google auth error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Authentication failed: {str(e)}")

# AI Health Coach Endpoints
@api_router.post("/ai-coach/chat")
async def ai_coach_chat(chat_msg: ChatMessage):
    """
    AI Health Coach powered by Gemini Flash
    """
    if not EMERGENT_LLM_KEY:
        raise HTTPException(status_code=500, detail="AI service not configured")
    
    try:
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=chat_msg.session_id,
            system_message="You are a friendly and knowledgeable AI health coach assistant. Help users with health advice, answer their questions about fitness, nutrition, and wellness. Be supportive and encouraging. Keep responses concise and actionable."
        ).with_model("gemini", "gemini-3-flash-preview")
        
        user_message = UserMessage(text=chat_msg.message)
        
        async def generate():
            async for event in chat.stream_message(user_message):
                if isinstance(event, TextDelta):
                    yield f"data: {event.content}\n\n"
                elif isinstance(event, StreamDone):
                    yield "data: [DONE]\n\n"
                    break
        
        return StreamingResponse(
            generate(),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "X-Accel-Buffering": "no"
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI service error: {str(e)}")

@api_router.get("/ai-coach/history/{session_id}")
async def get_chat_history(session_id: str):
    """
    Get chat history for a session
    """
    messages = await db.chat_messages.find(
        {"session_id": session_id},
        {"_id": 0}
    ).sort("timestamp", 1).to_list(100)
    return {"messages": messages}

# WhatsApp Integration Endpoints
@api_router.post("/whatsapp/send-report")
async def send_whatsapp_report(report: WhatsAppReportRequest, background_tasks: BackgroundTasks):
    """
    Send health report to user via WhatsApp
    """
    if not WHATSAPP_TOKEN or not WHATSAPP_PHONE_NUMBER_ID:
        raise HTTPException(status_code=500, detail="WhatsApp service not configured")
    
    async def send_message():
        try:
            metrics_text = ""
            if report.metrics:
                metrics_text = " | ".join([f"{k}: {v}" for k, v in report.metrics.items()])
            
            message_body = f"Hello {report.user_name},\n\nYour Health Report:\n{report.report_summary}\n\n{metrics_text}\n\nStay healthy! 🌱"
            
            payload = {
                "messaging_product": "whatsapp",
                "to": report.phone_number,
                "type": "text",
                "text": {
                    "preview_url": False,
                    "body": message_body
                }
            }
            
            headers = {
                "Authorization": f"Bearer {WHATSAPP_TOKEN}",
                "Content-Type": "application/json"
            }
            
            async with httpx.AsyncClient(timeout=10.0) as http_client:
                response = await http_client.post(
                    f"{WHATSAPP_BASE_URL}/messages",
                    headers=headers,
                    json=payload
                )
                
                if response.status_code >= 400:
                    logging.error(f"WhatsApp API error: {response.text}")
                else:
                    # Log successful send
                    log_doc = {
                        "phone_number": report.phone_number,
                        "user_name": report.user_name,
                        "message_id": response.json().get("messages", [{}])[0].get("id"),
                        "timestamp": datetime.now(timezone.utc).isoformat(),
                        "status": "sent"
                    }
                    await db.whatsapp_logs.insert_one(log_doc)
        except Exception as e:
            logging.error(f"Failed to send WhatsApp message: {str(e)}")
    
    background_tasks.add_task(send_message)
    return {"status": "queued", "message": "Report will be sent to WhatsApp"}

@api_router.get("/whatsapp/webhook")
async def whatsapp_webhook_verify(request: Request):
    """
    WhatsApp webhook verification
    """
    mode = request.query_params.get("hub.mode")
    token = request.query_params.get("hub.verify_token")
    challenge = request.query_params.get("hub.challenge")
    
    if mode == "subscribe" and token == WHATSAPP_VERIFY_TOKEN:
        return PlainTextResponse(content=challenge or "")
    raise HTTPException(status_code=403, detail="Verification failed")

@api_router.post("/whatsapp/webhook")
async def whatsapp_webhook_receive(payload: dict):
    """
    Receive WhatsApp webhook events
    """
    # Log webhook for debugging
    await db.whatsapp_webhooks.insert_one({
        "payload": payload,
        "timestamp": datetime.now(timezone.utc).isoformat()
    })
    return {"status": "ok"}

# Payment/Razorpay Endpoints
@api_router.post("/payments/create-order")
async def create_payment_order(order_req: PaymentOrderRequest):
    """
    Create Razorpay order for checkout
    """
    if not razorpay_client:
        raise HTTPException(status_code=500, detail="Payment service not configured")
    
    try:
        order_data = {
            "amount": order_req.amount,
            "currency": order_req.currency,
            "receipt": order_req.receipt[:40],  # Max 40 characters
            "payment_capture": 1
        }
        
        if order_req.notes:
            order_data["notes"] = order_req.notes
        
        razorpay_order = razorpay_client.order.create(order_data)
        
        # Store order in database
        await db.payment_orders.insert_one({
            "order_id": razorpay_order["id"],
            "amount": order_req.amount,
            "currency": order_req.currency,
            "status": "created",
            "created_at": datetime.now(timezone.utc).isoformat()
        })
        
        return razorpay_order
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Payment order creation failed: {str(e)}")

@api_router.post("/payments/verify")
async def verify_payment(verify_req: VerifyPaymentRequest):
    """
    Verify Razorpay payment signature
    """
    if not razorpay_client:
        raise HTTPException(status_code=500, detail="Payment service not configured")
    
    try:
        params_dict = {
            "razorpay_order_id": verify_req.razorpay_order_id,
            "razorpay_payment_id": verify_req.razorpay_payment_id,
            "razorpay_signature": verify_req.razorpay_signature
        }
        
        razorpay_client.utility.verify_payment_signature(params_dict)
        
        # Update order status
        await db.payment_orders.update_one(
            {"order_id": verify_req.razorpay_order_id},
            {"$set": {
                "status": "paid",
                "payment_id": verify_req.razorpay_payment_id,
                "paid_at": datetime.now(timezone.utc).isoformat()
            }}
        )
        
        return {"status": "success", "verified": True}
    except Exception as e:
        return {"status": "failed", "verified": False, "error": str(e)}

# Product/Store Endpoints
@api_router.get("/products")
async def get_products():
    """
    Get all products from store
    """
    products = await db.products.find({}, {"_id": 0}).to_list(100)
    
    # If no products, seed with sample data
    if not products:
        sample_products = [
            {
                "id": str(uuid.uuid4()),
                "name": "Multivitamin Supplement",
                "description": "Complete daily multivitamin for optimal health",
                "price": 149900,  # ₹1499
                "image_url": "https://images.unsplash.com/photo-1550572017-edd951b55104?w=400",
                "category": "Supplements",
                "stock": 100
            },
            {
                "id": str(uuid.uuid4()),
                "name": "Protein Powder",
                "description": "Premium whey protein for muscle recovery",
                "price": 249900,  # ₹2499
                "image_url": "https://images.unsplash.com/photo-1579722821273-0f6c7d502383?w=400",
                "category": "Supplements",
                "stock": 50
            },
            {
                "id": str(uuid.uuid4()),
                "name": "Fitness Tracker Band",
                "description": "Track your steps, heart rate, and sleep",
                "price": 499900,  # ₹4999
                "image_url": "https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=400",
                "category": "Devices",
                "stock": 30
            },
            {
                "id": str(uuid.uuid4()),
                "name": "Yoga Mat Premium",
                "description": "Non-slip eco-friendly yoga mat",
                "price": 199900,  # ₹1999
                "image_url": "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400",
                "category": "Fitness",
                "stock": 75
            }
        ]
        await db.products.insert_many(sample_products)
        products = sample_products
    
    return {"products": products}

@api_router.get("/products/{product_id}")
async def get_product(product_id: str):
    """
    Get single product by ID
    """
    product = await db.products.find_one({"id": product_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

# Health check
@api_router.get("/health")
async def health_check():
    return {"status": "healthy", "service": "MEDIGRAPH Backend"}

# Include router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()