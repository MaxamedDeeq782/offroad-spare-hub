
import React from 'react';
import { Button } from "@/components/ui/button";

interface CheckoutButtonProps {
  isSubmitting: boolean;
  paymentMethod?: string;
}

const CheckoutButton: React.FC<CheckoutButtonProps> = ({ isSubmitting, paymentMethod = 'credit_card' }) => {
  return (
    <Button
      type="submit"
      disabled={isSubmitting}
      className="w-full py-3"
    >
      {isSubmitting ? 'Processing...' : paymentMethod === 'credit_card' ? 'Complete Order' : 'Continue'}
    </Button>
  );
};

export default CheckoutButton;
