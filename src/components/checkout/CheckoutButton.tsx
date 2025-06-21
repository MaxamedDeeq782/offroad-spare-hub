
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
  createOrder: (paypalOrderId?: string) => Promise<Order | null>;
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

  const handlePayPalCheckout = async () => {
    try {
      console.log("=== PAYPAL CHECKOUT STARTED ===");
      
      if (!userId) {
        toast.error("You must be logged in to checkout");
        return;
      }

      if (cart.length === 0) {
        toast.error("Your cart is empty");
        return;
      }

      toast.info("Preparing your PayPal checkout...");
      
      // Transform cart items for PayPal checkout
      const cartItems = cart.map(item => ({
        productId: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        imageUrl: item.imageUrl,
      }));
      
      console.log("Cart items for PayPal:", cartItems);
      
      // Call the Supabase Edge Function to create a PayPal order
      const { data, error } = await supabase.functions.invoke("create-paypal-order", {
        body: { 
          cartItems, 
          userId
        }
      });
      
      if (error) {
        console.error("Error from PayPal Edge Function:", error);
        throw new Error(error.message || "Failed to create PayPal order");
      }
      
      console.log("PayPal order response:", data);
      
      if (data?.approvalUrl) {
        // If it's a test/sandbox mode, show a message
        if (data.isTestMode) {
          toast.info("Using PayPal Sandbox mode for testing");
        }
        
        console.log("Redirecting to PayPal checkout:", data.approvalUrl);
        // Redirect to PayPal checkout
        window.location.href = data.approvalUrl;
      } else {
        console.error("No approval URL received from PayPal");
        toast.error("No checkout URL received from PayPal");
      }
    } catch (error) {
      console.error("=== PAYPAL CHECKOUT ERROR ===");
      console.error("Error details:", error);
      
      let errorMessage = "Failed to create PayPal checkout session. Please try again later.";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    }
  };

  const handleClick = async () => {
    if (paymentMethod === 'paypal') {
      await handlePayPalCheckout();
    }
    // For credit_card, the form submission will handle it
  };

  const buttonText = isSubmitting 
    ? 'Processing...' 
    : paymentMethod === 'credit_card' 
      ? 'Complete Order' 
      : 'Pay with PayPal';

  return (
    <Button
      type={paymentMethod === 'credit_card' ? 'submit' : 'button'}
      disabled={isSubmitting}
      className="w-full py-3"
      onClick={paymentMethod === 'paypal' ? handleClick : undefined}
    >
      {buttonText}
    </Button>
  );
};

export default CheckoutButton;
