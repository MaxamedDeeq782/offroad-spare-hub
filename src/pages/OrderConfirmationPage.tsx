
import React, { useEffect, useState } from 'react';
import { Link, useLocation, Navigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface LocationState {
  orderId?: string;
}

const OrderConfirmationPage: React.FC = () => {
  const location = useLocation();
  const state = location.state as LocationState;
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [orderId, setOrderId] = useState<string | null>(state?.orderId || null);
  const [loading, setLoading] = useState<boolean>(!!sessionId && !orderId);
  
  useEffect(() => {
    // If we have a session_id from Stripe but no orderId yet, fetch the order
    const fetchOrderFromSession = async () => {
      if (!sessionId || orderId) return;
      
      try {
        setLoading(true);
        
        // Check if it's a development mock session
        if (sessionId.startsWith('dev_') || sessionId.startsWith('mock_') || sessionId.startsWith('fallback_')) {
          // For development mode, just create a fake order ID
          setOrderId(`dev-${Date.now()}`);
          toast.success("Development mode: Order confirmed");
          setLoading(false);
          return;
        }
        
        // Query to find the order with this session ID
        const { data, error } = await supabase
          .from('orders')
          .select('id')
          .eq('stripe_session_id', sessionId)
          .limit(1)
          .single();
        
        if (error) {
          console.error('Error fetching order:', error);
          // In development, create a fake order anyway
          if (process.env.NODE_ENV === 'development' || window.location.hostname.includes('localhost')) {
            setOrderId(`dev-${Date.now()}`);
            return;
          }
          throw error;
        }
        
        if (data) {
          setOrderId(data.id);
        } else {
          toast.error("Could not find your order. Please contact support.");
        }
      } catch (error) {
        console.error('Error fetching order:', error);
        toast.error('Error retrieving order details');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderFromSession();
  }, [sessionId, orderId]);

  // If no order ID is passed and we're not loading, redirect to homepage
  if (!orderId && !loading) {
    return <Navigate to="/" />;
  }
  
  // Show loading state while fetching order details
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-xl">Loading your order details...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-2xl mx-auto text-center">
        <div className="mb-8">
          <svg className="h-20 w-20 text-green-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        
        <h1 className="text-3xl font-bold mb-4">Order Placed Successfully!</h1>
        
        <p className="text-xl mb-8">
          Thank you for your order. Your order number is <span className="font-semibold">{orderId}</span>
        </p>
        
        <p className="text-gray-600 mb-8 dark:text-gray-400">
          We've sent a confirmation email with your order details. You can also view your order status
          in your account.
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link to="/orders" className="btn btn-primary px-6 py-3">
            View My Orders
          </Link>
          <Link to="/" className="btn btn-secondary px-6 py-3">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;
