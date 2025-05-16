
import React from 'react';
import { Button } from "@/components/ui/button";
import { useCart } from '@/contexts/CartContext';
import { supabase } from "@/integrations/supabase/client";
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface CheckoutButtonProps {
  isSubmitting: boolean;
  paymentMethod: string;
  userId?: string;
  formData: any;
  createOrder: () => Promise<void>;
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
      toast.info("Preparing your Stripe checkout...");
      
      // Transform cart items for the stripe checkout
      const cartItems = cart.map(item => ({
        productId: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        imageUrl: item.imageUrl,
      }));
      
      // Validate form fields before proceeding with Stripe checkout
      if (!formData.firstName || !formData.lastName || !formData.email || 
          !formData.address || !formData.city || !formData.state || !formData.zipCode) {
        toast.error("Please fill in all required fields");
        return;
      }
      
      // Call the Supabase Edge Function to create a Stripe checkout session
      const { data, error } = await supabase.functions.invoke("create-stripe-checkout", {
        body: { 
          cartItems, 
          userId,
          customerInfo: {
            name: `${formData.firstName} ${formData.lastName}`,
            email: formData.email,
            address: {
              line1: formData.address,
              city: formData.city,
              state: formData.state,
              postal_code: formData.zipCode,
              country: 'US'
            }
          }
        }
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
        
        // Create local order before redirecting
        await createOrder();
        
        // For development/testing environment, redirect to the simulated Stripe checkout
        if (process.env.NODE_ENV === 'development' || window.location.hostname.includes('lovableproject.com')) {
          navigate('/simulated-stripe-checkout');
        } else {
          // In production, redirect to the actual Stripe checkout URL
          // Open Stripe checkout in a new tab instead of redirecting
          window.open(data.url, '_blank');
        }
      } else {
        toast.error("No checkout URL received from Stripe");
      }
    } catch (error) {
      console.error("Error creating checkout:", error);
      toast.error("Failed to create checkout session. Please try again later.");
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
