
import React from 'react';

interface CheckoutButtonProps {
  isSubmitting: boolean;
}

const CheckoutButton: React.FC<CheckoutButtonProps> = ({ isSubmitting }) => {
  return (
    <button
      type="submit"
      disabled={isSubmitting}
      className="w-full btn btn-primary py-3"
    >
      {isSubmitting ? 'Processing...' : 'Complete Order'}
    </button>
  );
};

export default CheckoutButton;
