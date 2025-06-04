import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import { Minus, Plus, Trash2 } from 'lucide-react';

const CartPage: React.FC = () => {
  const { cart, updateQuantity, removeFromCart, clearCart, getCartTotal } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleCheckout = () => {
    if (!user) {
      toast.error("Please login or create an account to checkout");
      navigate('/login', { state: { from: '/checkout' } });
    } else {
      navigate('/checkout');
    }
  };

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity > 0) {
      updateQuantity(itemId, newQuantity);
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Shopping Cart</h1>
        <div className="bg-white p-8 rounded-lg shadow text-center dark:bg-gray-800">
          <p className="text-xl mb-6">Please log in to view your cart</p>
          <Link to="/login" className="btn btn-primary px-6 py-2">
            Login
          </Link>
        </div>
      </div>
    );
  };

  if (cart.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Shopping Cart</h1>
        <div className="bg-white p-8 rounded-lg shadow text-center dark:bg-gray-800">
          <p className="text-xl mb-6">Your cart is empty</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-6 md:py-8 max-w-7xl">
        <h1 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8">Shopping Cart</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Cart Items Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow dark:bg-gray-800">
              <div className="p-4 md:p-6">
                <div className="space-y-4">
                  {cart.map((item) => (
                    <div key={item.id} className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-b-0 last:pb-0">
                      <div className="flex flex-col sm:flex-row gap-4">
                        {/* Product Image and Info */}
                        <div className="flex items-start gap-4 flex-1 min-w-0">
                          <div className="h-20 w-20 md:h-24 md:w-24 bg-gray-200 rounded flex-shrink-0 overflow-hidden">
                            {item.imageUrl ? (
                              <img 
                                src={item.imageUrl} 
                                alt={item.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center text-xs text-gray-500">
                                No Image
                              </div>
                            )}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-sm md:text-base text-gray-900 dark:text-gray-100 line-clamp-2">
                              {item.name}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                              ${item.price.toFixed(2)} each
                            </p>
                          </div>
                        </div>
                        
                        {/* Quantity Controls and Price */}
                        <div className="flex items-center justify-between sm:flex-col sm:items-end gap-4">
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
                          
                          <div className="flex items-center gap-3">
                            <span className="font-semibold text-sm md:text-base">
                              ${(item.price * item.quantity).toFixed(2)}
                            </span>
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFromCart(item.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950 h-8 w-8 p-0"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Cart Actions */}
            <div className="mt-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <button 
                onClick={() => clearCart()}
                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 font-medium"
              >
                Clear Cart
              </button>
              
              <Link to="/products" className="text-primary hover:text-primary-dark font-medium">
                Continue Shopping
              </Link>
            </div>
          </div>
          
          {/* Order Summary Section */}
          <div className="lg:col-span-1">
            <div className="sticky top-4">
              <div className="bg-white p-4 md:p-6 rounded-lg shadow dark:bg-gray-800">
                <h2 className="text-lg md:text-xl font-semibold mb-4">Order Summary</h2>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between items-center text-sm">
                    <span>Subtotal ({cart.length} {cart.length === 1 ? 'item' : 'items'})</span>
                    <span>${getCartTotal().toFixed(2)}</span>
                  </div>
                  
                  <div className="border-t pt-3 border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between font-semibold text-base md:text-lg">
                      <span>Total</span>
                      <span>${getCartTotal().toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                
                <button 
                  onClick={handleCheckout}
                  className="w-full btn btn-primary py-3 font-medium"
                  disabled={!user}
                >
                  Proceed to Checkout
                </button>
                
                {!user && (
                  <p className="text-sm text-red-500 mt-2 text-center">
                    Please log in to proceed to checkout
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
