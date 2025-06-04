
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
  const [orderDetails, setOrderDetails] = useState(null);
  
  useEffect(() => {
    console.log("Order confirmation page loaded");
    console.log("Session ID:", sessionId);
    console.log("Order ID:", orderId);
    console.log("User:", user);
    
    if (!sessionId && !orderId) {
      console.error("No session ID or order ID found");
      toast.error("No order information found");
      navigate('/');
      return;
    }
    
    // If we have a session ID from Stripe, verify the order
    if (sessionId) {
      console.log("Verifying order with session ID:", sessionId);
      verifyOrder();
    } else if (orderId) {
      // If we already have an order ID (from direct checkout), just show the success
      console.log("Order ID found, showing success");
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
    console.log("Starting order verification process");
    
    try {
      if (!sessionId) {
        console.error("No session ID provided for verification");
        return;
      }
      
      // Check if an order already exists with this session ID
      console.log("Checking for existing order with session ID:", sessionId);
      const { data: existingOrderData, error: existingOrderError } = await supabase
        .from('orders')
        .select('*')
        .eq('stripe_session_id', sessionId)
        .maybeSingle();

      if (existingOrderError) {
        console.error("Error checking existing order:", existingOrderError);
      } else if (existingOrderData) {
        console.log("Found existing order:", existingOrderData);
        setOrderVerified(true);
        setOrderDetails(existingOrderData);
        toast.success("Your order has been confirmed!");
        clearCart();
        setLoading(false);
        return;
      }
      
      // If order doesn't exist, fetch session from Stripe via edge function
      console.log("Fetching session from Stripe for session ID:", sessionId);
      const response = await supabase.functions.invoke("verify-stripe-session", {
        body: { sessionId }
      });
      
      console.log("Edge function response:", response);
      
      const stripeData = response.data;
      const stripeError = response.error;

      if (stripeError) {
        console.error("Edge function error:", stripeError);
        toast.error("Could not verify your payment. Please contact support.");
        setLoading(false);
        return;
      }

      if (!stripeData?.success) {
        console.error("Stripe verification failed:", stripeData?.error);
        toast.error(stripeData?.error || "Could not verify your payment. Please contact support.");
        setLoading(false);
        return;
      }
      
      console.log("Stripe data received:", stripeData);
      
      // Create the order in our database
      const userId = user?.id;
      
      if (!userId) {
        console.error("User not authenticated");
        toast.error("User not authenticated. Cannot create order.");
        setLoading(false);
        return;
      }

      // Extract shipping information from Stripe data
      const shippingInfo = stripeData.shipping || {};
      console.log("Shipping info:", shippingInfo);
      
      const orderData = {
        user_id: userId,
        total: stripeData.amount_total / 100, // Convert from cents to dollars
        status: 'pending',
        stripe_session_id: sessionId,
        shipping_name: shippingInfo.name,
        shipping_address: shippingInfo.address,
        shipping_city: shippingInfo.city,
        shipping_state: shippingInfo.state,
        shipping_zip: shippingInfo.zipCode,
        shipping_email: shippingInfo.email || stripeData.customer_email
      };
      
      console.log("Creating order with data:", orderData);
      
      const { data: createdOrderData, error: orderError } = await supabase
        .from('orders')
        .insert(orderData)
        .select()
        .single();

      if (orderError) {
        console.error("Error creating order:", orderError);
        toast.error("Could not create your order. Please check your orders page.");
        setLoading(false);
        return;
      }
      
      console.log("Order created successfully:", createdOrderData);
      setOrderDetails(createdOrderData);
      
      // Insert order items based on the line items from Stripe
      if (stripeData.line_items && stripeData.line_items.length > 0) {
        console.log("Creating order items:", stripeData.line_items);
        
        const orderItems = stripeData.line_items.map(item => ({
          order_id: createdOrderData.id,
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
        } else {
          console.log("Order items created successfully");
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
            <p className="text-sm text-gray-500 mt-2">Please wait while we confirm your payment</p>
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
              <p className="text-xl mb-4">
                Your order number is <span className="font-semibold">#{orderId}</span>
              </p>
            )}
            
            {orderDetails && (
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Order Total: <span className="font-semibold">${orderDetails.total}</span>
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Status: <span className="font-semibold capitalize">{orderDetails.status}</span>
                </p>
              </div>
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
            
            <p className="text-gray-600 mb-4 dark:text-gray-400">
              We couldn't verify your order. Please check your orders page or contact customer support.
            </p>
            
            {sessionId && (
              <p className="text-sm text-gray-500 mb-8">
                Session ID: {sessionId}
              </p>
            )}
            
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
