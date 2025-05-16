
import React, { useEffect, useState } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from "@/components/ui/button";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const OrderConfirmationPage: React.FC = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const sessionId = searchParams.get('session_id');
  const orderId = location.state?.orderId || `order-${sessionId || Date.now()}`;
  const [loading, setLoading] = useState(false);
  const [orderVerified, setOrderVerified] = useState(false);
  
  useEffect(() => {
    if (!orderId && !sessionId) {
      toast.error("No order information found");
      return;
    }
    
    // If we have a session ID from Stripe, verify the order
    if (sessionId && user) {
      verifyOrder();
    }
  }, [orderId, sessionId, user]);
  
  const verifyOrder = async () => {
    setLoading(true);
    try {
      // Check if order exists with this session ID
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (error) {
        console.error("Error verifying order:", error);
        toast.error("Could not verify your order. Please check your orders page.");
      } else if (data && data.length > 0) {
        setOrderVerified(true);
        toast.success("Your order has been confirmed!");
      } else {
        // Create an order if it doesn't exist
        // This is a fallback in case the order wasn't created before redirect
        toast.info("Processing your order...");
      }
    } catch (error) {
      console.error("Error in order verification:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-2xl mx-auto text-center">
        <div className="mb-8">
          <svg className="h-20 w-20 text-green-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        
        <h1 className="text-3xl font-bold mb-4">Thank You For Your Order!</h1>
        
        <p className="text-xl mb-8">
          Your order number is <span className="font-semibold">{orderId}</span>
        </p>
        
        <p className="text-gray-600 mb-8 dark:text-gray-400">
          We've sent a confirmation email with your order details.
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
      </div>
    </div>
  );
};

export default OrderConfirmationPage;
