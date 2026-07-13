import React, { useState, useEffect, useCallback } from 'react';
import { productsApi, paymentApi } from '@/api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { STORE } from '@/constants/testIds';
import { ShoppingBag, ShoppingCart, X } from 'lucide-react';
import { toast } from 'sonner';
import { formatCurrency } from '@/utils/helpers';

const RAZORPAY_KEY_ID = process.env.REACT_APP_RAZORPAY_KEY_ID;

const Store = () => {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchProducts = useCallback(async () => {
    try {
      const response = await productsApi.getAll();
      setProducts(response.data.products || []);
    } catch (error) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const addToCart = (product) => {
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      setCart(cart.map(item =>
        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
    toast.success(`${product.name} added to cart`);
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.id !== productId));
  };

  const getTotalAmount = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    if (!RAZORPAY_KEY_ID || RAZORPAY_KEY_ID === 'your-razorpay-key-id') {
      toast.error('Payment gateway not configured');
      return;
    }

    try {
      const orderResponse = await paymentApi.createOrder({
        amount: getTotalAmount(),
        currency: 'INR',
        receipt: `receipt_${Date.now()}`,
        notes: {
          items: cart.map(item => `${item.name} x${item.quantity}`).join(', ')
        }
      });

      const options = {
        key: RAZORPAY_KEY_ID,
        amount: orderResponse.data.amount,
        currency: orderResponse.data.currency,
        order_id: orderResponse.data.id,
        name: 'MEDIGRAPH Store',
        description: 'Health Products',
        handler: async (response) => {
          try {
            await paymentApi.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });
            toast.success('Payment successful! Order placed.');
            setCart([]);
            setShowCart(false);
          } catch (error) {
            toast.error('Payment verification failed');
          }
        },
        prefill: {
          name: 'Customer Name',
          email: 'customer@example.com'
        },
        theme: {
          color: '#8A9A5B'
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      toast.error('Failed to initiate payment');
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFDF9] p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-outfit font-semibold text-[#1A1F16] tracking-tight">
              Health Store
            </h1>
            <p className="text-base text-[#666] mt-2">Premium health products for your wellness journey</p>
          </div>
          <Button
            data-testid={STORE.cartIcon}
            onClick={() => setShowCart(!showCart)}
            className="rounded-full bg-[#8A9A5B] hover:bg-[#7a8a4b] text-white relative"
          >
            <ShoppingCart className="w-5 h-5 mr-2" />
            Cart ({cart.length})
            {cart.length > 0 && (
              <span className="absolute -top-2 -right-2 w-6 h-6 bg-[#E2725B] rounded-full text-xs flex items-center justify-center">
                {cart.length}
              </span>
            )}
          </Button>
        </div>

        {/* Cart Sidebar */}
        {showCart && (
          <Card className="fixed right-6 top-24 w-96 max-h-[600px] overflow-y-auto p-6 border-[#E5E7E1] rounded-2xl z-50 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-[#1A1F16]">Your Cart</h2>
              <button onClick={() => setShowCart(false)}>
                <X className="w-5 h-5 text-[#666]" />
              </button>
            </div>
            {cart.length === 0 ? (
              <p className="text-center text-[#666] py-8">Your cart is empty</p>
            ) : (
              <div className="space-y-4">
                {cart.map(item => (
                  <div key={item.id} className="flex gap-3 items-start border-b border-[#E5E7E1] pb-3">
                    <img src={item.image_url} alt={item.name} className="w-16 h-16 object-cover rounded-lg" />
                    <div className="flex-1">
                      <p className="font-medium text-[#1A1F16] text-sm">{item.name}</p>
                      <p className="text-xs text-[#666]">Qty: {item.quantity}</p>
                      <p className="text-sm font-semibold text-[#8A9A5B] mt-1">
                        {formatCurrency(item.price * item.quantity)}
                      </p>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-[#E2725B] hover:text-[#d26650]"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <div className="pt-4 border-t border-[#E5E7E1]">
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-semibold text-[#1A1F16]">Total:</span>
                    <span className="text-xl font-bold text-[#8A9A5B]">{formatCurrency(getTotalAmount())}</span>
                  </div>
                  <Button
                    data-testid={STORE.checkoutBtn}
                    onClick={handleCheckout}
                    className="w-full rounded-full bg-[#8A9A5B] hover:bg-[#7a8a4b] text-white h-12"
                  >
                    Checkout
                  </Button>
                </div>
              </div>
            )}
          </Card>
        )}

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" data-testid={STORE.productGrid}>
          {products.map((product) => (
            <Card
              key={product.id}
              data-testid={`${STORE.productCard}-${product.id}`}
              className="p-4 border-[#E5E7E1] rounded-2xl hover:shadow-lg transition-all duration-200 hover:-translate-y-1"
            >
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-48 object-cover rounded-xl mb-4"
              />
              <h3 className="font-semibold text-[#1A1F16] mb-1">{product.name}</h3>
              <p className="text-sm text-[#666] mb-3 line-clamp-2">{product.description}</p>
              <div className="flex justify-between items-center">
                <span className="text-xl font-bold text-[#8A9A5B]">{formatCurrency(product.price)}</span>
                <Button
                  data-testid={`${STORE.addToCartBtn}-${product.id}`}
                  onClick={() => addToCart(product)}
                  size="sm"
                  className="rounded-full bg-[#8A9A5B] hover:bg-[#7a8a4b] text-white"
                >
                  Add
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Store;