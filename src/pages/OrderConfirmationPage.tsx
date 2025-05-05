
import React from 'react';
import { Link, useLocation, Navigate } from 'react-router-dom';

interface LocationState {
  orderId?: string;
}

const OrderConfirmationPage: React.FC = () => {
  const location = useLocation();
  const state = location.state as LocationState;
  
  // If no order ID is passed, redirect to homepage
  if (!state || !state.orderId) {
    return <Navigate to="/" />;
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-2xl mx-auto text-center">
        <div className="mb-8">
          <svg className="h-20 w-20 text-green-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        
        <h1 className="text-3xl font-bold mb-4">Order Placed Successfully!</h1>
        
        <p className="text-xl mb-8">
          Thank you for your order. Your order number is <span className="font-semibold">{state.orderId}</span>
        </p>
        
        <p className="text-gray-600 mb-8">
          We've sent a confirmation email with your order details. You can also view your order status
          in your account.
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link to="/orders" className="btn btn-primary px-6 py-3">
            View My Orders
          </Link>
          <Link to="/" className="btn btn-secondary px-6 py-3">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;
