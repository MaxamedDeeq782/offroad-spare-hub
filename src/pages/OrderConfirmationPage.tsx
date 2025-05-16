
import React, { useEffect, useState } from 'react';
import { Link, useLocation, useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from "@/components/ui/button";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { Loader2 } from 'lucide-react';

const OrderConfirmationPage: React.FC = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { clearCart } = useCart();
  const sessionId = searchParams.get('session_id');
  const orderId = location.state?.orderId || sessionId?.substring(0, 8);
  const [loading, setLoading] = useState(true);
  const [orderVerified, setOrderVerified] = useState(false);
  
  useEffect(() => {
    if (!user && !sessionId) {
      toast.error("No order information found");
      navigate('/');
      return;
    }
    
    // If we have a session ID from Stripe, verify the order
    if (sessionId) {
      verifyOrder();
    } else if (orderId) {
      // If we already have an order ID (from direct checkout), just show the success
      setOrderVerified(true);
      setLoading(false);
      clearCart(); // Clear the cart on successful order
    } else {
      setLoading(false);
      toast.error("No order information found");
    }
  }, [sessionId, orderId, user]);
  
  const verifyOrder = async () => {
    setLoading(true);
    try {
      if (!sessionId) return;
      
      // Check if an order already exists with this session ID
      const { data: existingOrderData, error: existingOrderError } = await supabase
        .from('orders')
        .select('*')
        .eq('stripe_session_id', sessionId)
        .maybeSingle();

      if (!existingOrderError && existingOrderData) {
        // Order exists, show success
        setOrderVerified(true);
        toast.success("Your order has been confirmed!");
        clearCart(); // Clear the cart on successful order verification
        setLoading(false);
        return;
      }
      
      // If order doesn't exist, fetch session from Stripe via edge function
      const response = await supabase.functions.invoke("verify-stripe-session", {
        body: { sessionId }
      });
      
      const stripeData = response.data;
      const stripeError = response.error;

      if (stripeError || !stripeData?.success) {
        console.error("Error verifying Stripe session:", stripeError || stripeData?.error);
        toast.error("Could not verify your payment. Please contact support.");
        setLoading(false);
        return;
      }
      
      // Create the order in our database
      const userId = user?.id;
      
      if (!userId) {
        toast.error("User not authenticated. Cannot create order.");
        setLoading(false);
        return;
      }

      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: userId,
          total: stripeData.amount_total / 100, // Convert from cents to dollars
          status: 'pending',
          stripe_session_id: sessionId
        })
        .select()
        .single();

      if (orderError) {
        console.error("Error creating order:", orderError);
        toast.error("Could not create your order. Please check your orders page.");
        setLoading(false);
        return;
      }
      
      // Insert order items based on the line items from Stripe
      if (stripeData.line_items && stripeData.line_items.length > 0) {
        const orderItems = stripeData.line_items.map(item => ({
          order_id: orderData.id,
          product_id: item.price.product.id,
          quantity: item.quantity,
          price: (item.amount_total / 100) / item.quantity // Convert from cents to dollars and get price per item
        }));

        const { error: itemsError } = await supabase
          .from('order_items')
          .insert(orderItems);

        if (itemsError) {
          console.error("Error creating order items:", itemsError);
          toast.error("Your order was created but some details might be missing.");
        }
      }
      
      setOrderVerified(true);
      clearCart(); // Clear the cart on successful order
      toast.success("Your order has been confirmed!");
    } catch (error) {
      console.error("Error in order verification:", error);
      toast.error("An unexpected error occurred. Please check your orders page.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-2xl mx-auto text-center">
        {loading ? (
          <div className="flex flex-col items-center justify-center">
            <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
            <p className="text-xl">Verifying your order...</p>
          </div>
        ) : orderVerified ? (
          <>
            <div className="mb-8">
              <svg className="h-20 w-20 text-green-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            
            <h1 className="text-3xl font-bold mb-4">Thank You For Your Order!</h1>
            
            {orderId && (
              <p className="text-xl mb-8">
                Your order number is <span className="font-semibold">{orderId}</span>
              </p>
            )}
            
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
          </>
        ) : (
          <>
            <div className="mb-8">
              <svg className="h-20 w-20 text-yellow-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            
            <h1 className="text-3xl font-bold mb-4">Order Verification Failed</h1>
            
            <p className="text-gray-600 mb-8 dark:text-gray-400">
              We couldn't verify your order. Please check your orders page or contact customer support.
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
