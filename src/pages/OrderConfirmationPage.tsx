import React, { useEffect, useState } from 'react';
import { Link, useLocation, useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from "@/components/ui/button";
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { addOrder } from '@/models/Order';
import { supabase } from '@/integrations/supabase/client';
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
  const [orderDetails, setOrderDetails] = useState<any>(null);
  
  // Get order ID from location state if it exists (for credit card payments)
  const existingOrderId = location.state?.orderId;
  
  useEffect(() => {
    const handleOrderConfirmation = async () => {
      console.log("Order confirmation page loaded");
      console.log("Session ID:", sessionId);
      console.log("Existing Order ID:", existingOrderId);
      console.log("User:", user);
      console.log("Cart:", cart);
      
      // If we have an existing order ID (from credit card payment), clear cart and show confirmation
      if (existingOrderId) {
        console.log("Order already exists with ID:", existingOrderId);
        setOrderCreated(true);
        setOrderDetails({ id: existingOrderId, total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0) });
        
        // Clear cart for credit card payments
        if (user && cart.length > 0) {
          console.log("Clearing cart for credit card payment...");
          await clearCart();
        }
        
        setLoading(false);
        return;
      }
      
      // If no session ID, redirect to home
      if (!sessionId) {
        console.error("No session ID found");
        toast.error("No order information found");
        navigate('/');
        return;
      }

      try {
        // Verify the payment with Stripe
        console.log("Verifying payment with Stripe...");
        const { data: verificationData, error: verificationError } = await supabase.functions.invoke("verify-stripe-session", {
          body: { sessionId }
        });

        if (verificationError) {
          console.error("Error verifying payment:", verificationError);
          toast.error("Payment verification failed");
          navigate('/');
          return;
        }

        if (!verificationData.success) {
          console.error("Payment verification failed:", verificationData.error);
          toast.error("Payment was not successful");
          navigate('/');
          return;
        }

        console.log("Payment verified successfully:", verificationData);

        // Extract order information from verified session
        const { line_items, amount_total, shipping, customer_email } = verificationData;
        
        // Use cart items if available, otherwise fall back to line items
        let orderItems;
        let orderTotal;
        
        if (user && cart.length > 0) {
          // Use cart items if user is logged in and cart exists
          orderItems = cart.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          }));
          orderTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        } else {
          // Fall back to line items from Stripe
          orderItems = line_items.map((item: any) => ({
            productId: typeof item.price?.product === 'string' ? item.price.product : item.price?.product?.id || 'unknown',
            quantity: item.quantity,
            price: (item.amount_total || 0) / 100, // Convert from cents to dollars
          }));
          orderTotal = (amount_total || 0) / 100; // Convert from cents to dollars
        }

        // Create order in database with verified payment status
        const orderData = {
          userId: user?.id || 'guest',
          items: orderItems,
          total: orderTotal,
          status: 'approved' as const, // Set as approved since payment was verified
          stripeSessionId: sessionId,
          shipping: shipping ? {
            name: shipping.name,
            email: shipping.email || customer_email,
            address: shipping.address?.line1,
            city: shipping.address?.city,
            state: shipping.address?.state,
            zipCode: shipping.address?.postal_code,
          } : undefined
        };

        console.log("Creating order with verified data:", orderData);
        const createdOrder = await addOrder(orderData);
        
        if (createdOrder) {
          console.log("Order created successfully:", createdOrder.id);
          setOrderCreated(true);
          setOrderDetails(createdOrder);
          
          // Clear cart after successful order creation for Stripe payments
          if (user && cart.length > 0) {
            console.log("Clearing cart after successful Stripe payment...");
            await clearCart();
            console.log("Cart cleared successfully");
          }
          
          toast.success("Your order has been confirmed and payment verified!");
        } else {
          console.error("Failed to create order");
          toast.error("Order creation failed, but payment was successful. Please contact support.");
        }
      } catch (error) {
        console.error("Error in payment verification and order creation:", error);
        toast.error("An error occurred while processing your order. Please contact support.");
      } finally {
        setLoading(false);
      }
    };

    // Small delay to show loading state, then handle order confirmation
    const timer = setTimeout(() => {
      handleOrderConfirmation();
    }, 1000);

    return () => clearTimeout(timer);
  }, [sessionId, existingOrderId, user, cart, navigate, clearCart]);

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-2xl mx-auto text-center">
        {loading ? (
          <div className="flex flex-col items-center justify-center">
            <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
            <p className="text-xl">Processing your order...</p>
            <p className="text-sm text-gray-500 mt-2">Please wait while we confirm your payment</p>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <svg className="h-20 w-20 text-green-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            
            <h1 className="text-3xl font-bold mb-4">Order Confirmed!</h1>
            
            {orderDetails && (
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 mb-6">
                <p className="text-xl mb-2">
                  Order ID: <span className="font-semibold">#{orderDetails.id.substring(0, 8)}</span>
                </p>
                <p className="text-lg mb-2">
                  Total: <span className="font-semibold">${orderDetails.total.toFixed(2)}</span>
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Status: <span className="font-semibold text-green-600">Approved</span>
                </p>
              </div>
            )}
            
            <p className="text-gray-600 mb-8 dark:text-gray-400">
              Your payment has been successfully processed and your order has been created. 
              You can view your order details in your account.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button asChild>
                <Link to="/orders" className="px-6 py-3">
                  View My Orders
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/products" className="px-6 py-3">
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
