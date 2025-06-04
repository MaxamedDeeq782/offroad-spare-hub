
import React, { useEffect, useState } from 'react';
import { Link, useLocation, useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from "@/components/ui/button";
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
  
  useEffect(() => {
    console.log("Order confirmation page loaded");
    console.log("Session ID:", sessionId);
    console.log("Order ID:", orderId);
    console.log("User:", user);
    console.log("Location state:", location.state);
    
    // Simple timeout to show loading state briefly, then show success
    const timer = setTimeout(() => {
      setLoading(false);
      clearCart(); // Clear the cart on successful order
      toast.success("Your order has been confirmed!");
    }, 1000);

    return () => clearTimeout(timer);
  }, [sessionId, orderId, user, clearCart]);

  // If no session ID or order ID, redirect to home
  if (!sessionId && !orderId) {
    console.error("No session ID or order ID found");
    toast.error("No order information found");
    navigate('/');
    return null;
  }

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
            
            {orderId && (
              <p className="text-xl mb-4">
                Your order number is <span className="font-semibold">#{orderId}</span>
              </p>
            )}
            
            <p className="text-gray-600 mb-8 dark:text-gray-400">
              Your payment has been processed successfully. We'll send you a confirmation email shortly with your order details.
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
