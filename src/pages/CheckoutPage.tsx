
import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { addOrder } from '../models/Order';
import { toast } from 'sonner';
import PaymentMethodForm from '../components/checkout/PaymentMethodForm';
import OrderSummary from '../components/checkout/OrderSummary';
import CheckoutButton from '../components/checkout/CheckoutButton';

const CheckoutPage: React.FC = () => {
  const { user } = useAuth();
  const { cart, getCartTotal, clearCart } = useCart();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    paymentMethod: 'paypal'
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  
  // Field validation state
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  
  // Redirect if cart is empty
  if (cart.length === 0) {
    return <Navigate to="/cart" />;
  }

  // Redirect if not logged in
  if (!user) {
    toast.error("You need to login or create an account to checkout");
    return <Navigate to="/login" state={{ from: "/checkout" }} />;
  }
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when field is changed
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Create an order in your database
  const createOrder = async (paypalOrderId?: string) => {
    try {
      console.log("=== CREATING ORDER FROM CHECKOUT ===");
      console.log("User ID:", user.id);
      console.log("Cart items:", cart);
      
      if (!user.id) {
        throw new Error('No user ID available for order creation');
      }

      if (cart.length === 0) {
        throw new Error('Cart is empty - cannot create order');
      }
      
      // Create a new order without shipping information (PayPal handles this)
      const orderData = {
        userId: user.id,
        items: cart.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price
        })),
        total: getCartTotal(),
        status: 'approved' as const,
        paypalOrderId
      };
      
      console.log("Order data prepared:", orderData);
      
      // Add order to Supabase
      const newOrder = await addOrder(orderData);
      
      if (newOrder) {
        console.log("✓ Order created successfully:", newOrder.id);
        
        // Clear cart after successful order creation
        console.log("Clearing cart...");
        await clearCart();
        console.log("✓ Cart cleared");
        
        // Navigate to order confirmation
        navigate('/order-confirmation', { state: { orderId: newOrder.id } });
        
        toast.success("Order created successfully!");
        return newOrder;
      } else {
        throw new Error("Order creation returned null");
      }
    } catch (error) {
      console.error('=== ERROR IN CHECKOUT ORDER CREATION ===');
      console.error('Error details:', error);
      
      let errorMessage = "An error occurred while processing your order";
      
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
      throw error; // Re-throw to handle in calling function
    } finally {
      setPaymentProcessing(false);
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log("=== FORM SUBMIT STARTED ===");
    console.log("Payment method:", formData.paymentMethod);
    
    setIsSubmitting(true);
    
    try {
      if (formData.paymentMethod === 'credit_card') {
        console.log("Processing credit card payment...");
        setPaymentProcessing(true);
        toast.success("Credit card payment processed successfully");
        await createOrder();
      }
      // For PayPal, the checkout is handled by the CheckoutButton
    } catch (error) {
      console.error('Error during checkout:', error);
      // Error already handled in createOrder function
    } finally {
      setIsSubmitting(false);
      setPaymentProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sticky Notice Box */}
      <div className="sticky top-0 z-50 bg-blue-50 border-b border-blue-200 px-4 py-3 dark:bg-blue-900/20 dark:border-blue-800">
        <div className="container mx-auto max-w-7xl">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                Haddi ad isticmaalyso sahal ama edahab inan wax ku gadatid laso xarir numberkan 0906252544
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 md:py-8 max-w-7xl">
        <h1 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8">Checkout</h1>
        
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
          {/* Form Section - Takes 2 columns on xl screens */}
          <div className="xl:col-span-2 order-2 xl:order-1">
            <form onSubmit={handleSubmit} className="space-y-6">
              <PaymentMethodForm 
                paymentMethod={formData.paymentMethod} 
                handleChange={handleChange}
              />
              
              {/* Mobile Checkout Button */}
              <div className="xl:hidden">
                <CheckoutButton 
                  isSubmitting={isSubmitting || paymentProcessing} 
                  paymentMethod={formData.paymentMethod}
                  userId={user.id}
                  formData={formData}
                  createOrder={createOrder}
                />
              </div>
            </form>
          </div>
          
          {/* Order Summary Section - Takes 1 column on xl screens */}
          <div className="xl:col-span-1 order-1 xl:order-2">
            <div className="sticky top-4">
              <OrderSummary 
                cart={cart} 
                getCartTotal={getCartTotal} 
              />
              
              {/* Desktop Checkout Button */}
              <div className="hidden xl:block mt-6">
                <CheckoutButton 
                  isSubmitting={isSubmitting || paymentProcessing} 
                  paymentMethod={formData.paymentMethod}
                  userId={user.id}
                  formData={formData}
                  createOrder={createOrder}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
