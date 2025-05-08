
import React from 'react';
import { Button } from "@/components/ui/button";
import { useCart } from '@/contexts/CartContext';
import { supabase } from "@/integrations/supabase/client";
import { toast } from 'sonner';

interface CheckoutButtonProps {
  isSubmitting: boolean;
  paymentMethod: string;
  userId?: string;
}

const CheckoutButton: React.FC<CheckoutButtonProps> = ({ isSubmitting, paymentMethod, userId }) => {
  const { cart } = useCart();

  const handleStripeCheckout = async () => {
    try {
      toast.info("Preparing your Stripe checkout...");
      
      // Transform cart items for the stripe checkout
      const cartItems = cart.map(item => ({
        productId: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        imageUrl: item.imageUrl,
      }));
      
      // Call the Supabase Edge Function to create a Stripe checkout session
      const { data, error } = await supabase.functions.invoke("create-stripe-checkout", {
        body: { cartItems, userId }
      });
      
      if (error) {
        console.error("Error from Edge Function:", error);
        throw new Error(error.message || "Failed to create checkout session");
      }
      
      if (data?.url) {
        // If it's a test URL, show a message
        if (data.isTestMode) {
          toast.info("Using Stripe test mode - use test card 4242 4242 4242 4242");
        }
        
        // Redirect to Stripe Checkout
        window.location.href = data.url;
      } else {
        // For development mode, simulate checkout behavior
        toast.success("Development mode active - redirecting to simulated checkout...");
        setTimeout(() => {
          window.location.href = `/order-confirmation?session_id=fallback_session_${Date.now()}`;
        }, 1500);
      }
    } catch (error) {
      console.error("Error creating checkout:", error);
      toast.error("Failed to create checkout session. Using development mode for demonstration.");
      
      // In case of error, fall back to dev mode behavior for demo purposes
      setTimeout(() => {
        window.location.href = `/order-confirmation?session_id=fallback_session_${Date.now()}`;
      }, 1500);
    }
  };

  const handleClick = () => {
    if (paymentMethod === 'stripe') {
      handleStripeCheckout();
    }
    // For credit_card, the form submission will handle it
  };

  const buttonText = isSubmitting 
    ? 'Processing...' 
    : paymentMethod === 'credit_card' 
      ? 'Complete Order' 
      : 'Pay with Stripe (Test Mode)';

  return (
    <Button
      type={paymentMethod === 'credit_card' ? 'submit' : 'button'}
      disabled={isSubmitting}
      className="w-full py-3"
      onClick={paymentMethod === 'stripe' ? handleClick : undefined}
    >
      {buttonText}
    </Button>
  );
};

export default CheckoutButton;
