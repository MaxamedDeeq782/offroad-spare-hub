
import React from 'react';
import { Button } from "@/components/ui/button";
import { useCart } from '@/contexts/CartContext';
import { supabase } from "@/integrations/supabase/client";
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { Order } from '@/models/Order';

interface CheckoutButtonProps {
  isSubmitting: boolean;
  paymentMethod: string;
  userId?: string;
  formData: any;
  createOrder: (stripeSessionId?: string) => Promise<Order | null>;
}

const CheckoutButton: React.FC<CheckoutButtonProps> = ({ 
  isSubmitting, 
  paymentMethod, 
  userId,
  formData,
  createOrder 
}) => {
  const { cart } = useCart();
  const navigate = useNavigate();

  const handleStripeCheckout = async () => {
    try {
      console.log("=== STRIPE CHECKOUT STARTED ===");
      
      if (!userId) {
        toast.error("You must be logged in to checkout");
        return;
      }

      if (cart.length === 0) {
        toast.error("Your cart is empty");
        return;
      }

      toast.info("Preparing your Stripe checkout...");
      
      // Transform cart items for the stripe checkout
      const cartItems = cart.map(item => ({
        productId: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        imageUrl: item.imageUrl,
      }));
      
      console.log("Cart items for Stripe:", cartItems);
      
      // Call the Supabase Edge Function to create a Stripe checkout session
      const { data, error } = await supabase.functions.invoke("create-stripe-checkout", {
        body: { 
          cartItems, 
          userId
        }
      });
      
      if (error) {
        console.error("Error from Stripe Edge Function:", error);
        throw new Error(error.message || "Failed to create checkout session");
      }
      
      console.log("Stripe checkout response:", data);
      
      if (data?.url) {
        // If it's a test URL, show a message
        if (data.isTestMode) {
          toast.info("Using Stripe test mode - use test card 4242 4242 4242 4242");
        }
        
        console.log("Redirecting to Stripe checkout:", data.url);
        // Redirect directly to Stripe checkout
        window.location.href = data.url;
      } else {
        console.error("No checkout URL received from Stripe");
        toast.error("No checkout URL received from Stripe");
      }
    } catch (error) {
      console.error("=== STRIPE CHECKOUT ERROR ===");
      console.error("Error details:", error);
      
      let errorMessage = "Failed to create checkout session. Please try again later.";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    }
  };

  const handleClick = async () => {
    if (paymentMethod === 'stripe') {
      await handleStripeCheckout();
    }
    // For credit_card, the form submission will handle it
  };

  const buttonText = isSubmitting 
    ? 'Processing...' 
    : paymentMethod === 'credit_card' 
      ? 'Complete Order' 
      : 'Pay with Stripe';

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
