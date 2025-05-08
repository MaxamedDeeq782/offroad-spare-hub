
import React from 'react';
import { CartItem } from '../../contexts/CartContext';

interface OrderSummaryProps {
  cart: CartItem[];
  getCartTotal: () => number;
}

const OrderSummary: React.FC<OrderSummaryProps> = ({ cart, getCartTotal }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow dark:bg-gray-800">
      <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
      
      <div className="border-b pb-4 mb-4 border-gray-200 dark:border-gray-700">
        {cart.map((item) => (
          <div key={item.id} className="flex justify-between items-center mb-2">
            <div>
              <span className="font-medium">{item.name}</span>
              <span className="text-gray-500 text-sm block dark:text-gray-400">Qty: {item.quantity}</span>
            </div>
            <span>${(item.price * item.quantity).toFixed(2)}</span>
          </div>
        ))}
      </div>
      
      <div className="space-y-3">
        <div className="flex justify-between font-semibold">
          <span>Total</span>
          <span>${getCartTotal().toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;
