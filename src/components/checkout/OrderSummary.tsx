
import React from 'react';
import { CartItem } from '../../contexts/CartContext';
import { Button } from '../ui/button';
import { Minus, Plus } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';

interface OrderSummaryProps {
  cart: CartItem[];
  getCartTotal: () => number;
}

const OrderSummary: React.FC<OrderSummaryProps> = ({ cart, getCartTotal }) => {
  const { updateQuantity } = useCart();

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity > 0) {
      updateQuantity(itemId, newQuantity);
    }
  };

  return (
    <div className="bg-white p-4 md:p-6 rounded-lg shadow dark:bg-gray-800 h-fit">
      <h2 className="text-lg md:text-xl font-semibold mb-4">Order Summary</h2>
      
      <div className="border-b pb-4 mb-4 border-gray-200 dark:border-gray-700 space-y-4">
        {cart.map((item) => (
          <div key={item.id} className="space-y-2">
            <div className="flex justify-between items-start gap-2">
              <div className="flex-1 min-w-0">
                <span className="font-medium text-sm md:text-base block truncate">{item.name}</span>
                <span className="text-gray-500 text-xs md:text-sm dark:text-gray-400">
                  ${item.price.toFixed(2)} each
                </span>
              </div>
              <span className="font-medium text-sm md:text-base whitespace-nowrap">
                ${(item.price * item.quantity).toFixed(2)}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                  disabled={item.quantity <= 1}
                  className="h-8 w-8 p-0"
                >
                  <Minus className="h-3 w-3" />
                </Button>
                
                <span className="text-sm font-medium w-8 text-center">
                  {item.quantity}
                </span>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                  className="h-8 w-8 p-0"
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
              
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Qty: {item.quantity}
              </span>
            </div>
          </div>
        ))}
      </div>
      
      <div className="space-y-3">
        <div className="flex justify-between font-semibold text-base md:text-lg">
          <span>Total</span>
          <span>${getCartTotal().toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;
