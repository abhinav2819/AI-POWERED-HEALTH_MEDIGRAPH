# MEDIGRAPH - AI-Powered Health Platform

A comprehensive health tracking and management platform built with React frontend and dual backend architecture (Spring Boot + FastAPI).

## 🌟 Features

### Core Health Features (Spring Boot Backend)
- **Authentication**: Email/Password and Google OAuth login
- **User Profile Management**: Complete health profile with age, height, weight
- **Health Metrics Tracking**: 
  - Steps, Heart Rate, Sleep, Calories
  - Manual entry and external source integration (Google Fit, Fitbit, Apple Health)
- **Analytics**: BMI calculation, Progress tracking
- **Goals Management**: Set and track daily health goals
- **Admin Panel**: User management, system analytics, audit logs

### Enhanced Features (FastAPI Backend)
- **AI Health Coach**: Conversational AI assistant powered by Gemini Flash
- **WhatsApp Integration**: Send personalized health reports via WhatsApp (Meta Cloud API)
- **E-commerce Store**: Health products with Razorpay payment integration
  - UPI, Credit Cards, Debit Cards, Net Banking support
- **Customer Support**: FAQ, contact forms, live chat

## 🏗️ Architecture

### Frontend (React)
- **Framework**: React 19 with React Router
- **UI Library**: Shadcn UI with Tailwind CSS
- **Design**: Organic & Earthy theme (Sage Green #8A9A5B, Terracotta #E2725B)
- **Charts**: Recharts for data visualization

### Backend Services
1. **Spring Boot Backend** (`http://localhost:8080/api/health/v1`) - Core health data
2. **FastAPI Backend** (`/api`) - AI services, WhatsApp, Payments

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and Yarn
- Python 3.11+
- MongoDB
- Spring Boot backend running on `http://localhost:8080`

### Setup
1. Configure environment variables in `/app/backend/.env` and `/app/frontend/.env`
2. Install dependencies: `yarn install` (frontend) and `pip install -r requirements.txt` (backend)
3. Start services: `sudo supervisorctl restart frontend backend`

## 🔑 Required API Credentials

1. **Google OAuth** - https://console.cloud.google.com/apis/credentials
2. **Razorpay** - https://dashboard.razorpay.com/
3. **WhatsApp Cloud API** - https://developers.facebook.com/apps/
4. **AI Health Coach** - ✅ Already configured (Emergent LLM Key)

See `/app/memory/test_credentials.md` for details.

## 📱 Pages
- `/login` `/signup` - Authentication
- `/dashboard` - Main health dashboard
- `/health-analysis` - Analytics with charts
- `/metrics/add` - Add health metrics
- `/ai-coach` - AI chatbot
- `/store` - Health products store
- `/support` - Customer support
- `/profile` - User settings

## 🎨 Design System
- **Colors**: Sage Green (#8A9A5B), Terracotta (#E2725B), Warm Sand (#FDFDF9)
- **Typography**: Outfit (headings), Manrope (body)
- **Components**: Shadcn UI with custom styling

## 📊 Spring Boot Backend API
Base URL: `http://localhost:8080/api/health/v1`

See API_DOCUMENTATION.md for complete endpoint reference.

---

Built for better health management 🌱
