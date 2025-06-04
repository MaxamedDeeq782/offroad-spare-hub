
import React, { useEffect, useState } from 'react';
import { Link, useLocation, useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from "@/components/ui/button";
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { addOrder } from '@/models/Order';
import { Loader2 } from 'lucide-react';

const OrderConfirmationPage: React.FC = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cart, clearCart } = useCart();
  const sessionId = searchParams.get('session_id');
  const [loading, setLoading] = useState(true);
  const [orderCreated, setOrderCreated] = useState(false);
  
  useEffect(() => {
    const createOrderFromCart = async () => {
      console.log("Order confirmation page loaded");
      console.log("Session ID:", sessionId);
      console.log("User:", user);
      console.log("Cart:", cart);
      
      // If no session ID, redirect to home
      if (!sessionId) {
        console.error("No session ID found");
        toast.error("No order information found");
        navigate('/');
        return;
      }

      // If no user or empty cart, we can't create an order
      if (!user || cart.length === 0) {
        console.log("No user or empty cart, showing success anyway");
        setLoading(false);
        return;
      }

      try {
        // Calculate total from cart
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        // Create order in database
        const orderData = {
          userId: user.id,
          items: cart.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          })),
          total: total,
          status: 'approved' as const, // Since payment already succeeded via Stripe
          stripeSessionId: sessionId,
        };

        console.log("Creating order with data:", orderData);
        const createdOrder = await addOrder(orderData);
        
        if (createdOrder) {
          console.log("Order created successfully:", createdOrder.id);
          setOrderCreated(true);
          clearCart(); // Clear cart only after successful order creation
          toast.success("Your order has been confirmed!");
        } else {
          console.error("Failed to create order");
          toast.error("Order confirmation failed, but payment was successful. Please contact support.");
        }
      } catch (error) {
        console.error("Error creating order:", error);
        toast.error("Order confirmation failed, but payment was successful. Please contact support.");
      } finally {
        setLoading(false);
      }
    };

    // Small delay to show loading state, then create order
    const timer = setTimeout(() => {
      createOrderFromCart();
    }, 1000);

    return () => clearTimeout(timer);
  }, [sessionId, user, cart, navigate, clearCart]);

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-2xl mx-auto text-center">
        {loading ? (
          <div className="flex flex-col items-center justify-center">
            <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
            <p className="text-xl">Processing your order...</p>
            <p className="text-sm text-gray-500 mt-2">Almost done!</p>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <svg className="h-20 w-20 text-green-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            
            <h1 className="text-3xl font-bold mb-4">Thank You For Your Order!</h1>
            
            {sessionId && (
              <p className="text-xl mb-4">
                Your order number is <span className="font-semibold">#{sessionId.substring(0, 8)}</span>
              </p>
            )}
            
            <p className="text-gray-600 mb-8 dark:text-gray-400">
              Your payment has been processed successfully. 
              {orderCreated ? " Your order has been created and " : " "}
              We'll send you a confirmation email shortly.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button asChild>
                <Link to="/orders" className="px-6 py-3">
                  View My Orders
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/" className="px-6 py-3">
                  Continue Shopping
                </Link>
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default OrderConfirmationPage;
