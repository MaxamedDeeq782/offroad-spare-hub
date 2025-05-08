
import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { addOrder } from '../models/Order';
import { toast } from 'sonner';
import ShippingForm from '../components/checkout/ShippingForm';
import PaymentMethodForm from '../components/checkout/PaymentMethodForm';
import OrderSummary from '../components/checkout/OrderSummary';
import CheckoutButton from '../components/checkout/CheckoutButton';

const CheckoutPage: React.FC = () => {
  const { user } = useAuth();
  const { cart, getCartTotal, clearCart } = useCart();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    firstName: user?.user_metadata?.name?.split(' ')[0] || '',
    lastName: user?.user_metadata?.name?.split(' ')[1] || '',
    email: user?.email || '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    paymentMethod: 'credit_card'
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);

  // Redirect if cart is empty
  if (cart.length === 0) {
    return <Navigate to="/cart" />;
  }

  // Redirect if not logged in - new requirement
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
  };

  // Function to simulate PayPal payment process
  const processPayPalPayment = async () => {
    setPaymentProcessing(true);
    
    try {
      // This would be replaced with actual PayPal SDK integration
      toast.info("Redirecting to PayPal...");
      
      // Simulate a delay for the PayPal process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate success
      toast.success("Payment received via PayPal");
      return true;
    } catch (error) {
      console.error("PayPal payment error:", error);
      toast.error("PayPal payment failed. Please try again.");
      return false;
    } finally {
      setPaymentProcessing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic form validation
    if (!formData.firstName || !formData.lastName || !formData.email || 
        !formData.address || !formData.city || !formData.state || !formData.zipCode) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Process payment based on selected method
      let paymentSuccessful = true;
      
      if (formData.paymentMethod === 'paypal') {
        paymentSuccessful = await processPayPalPayment();
        if (!paymentSuccessful) {
          setIsSubmitting(false);
          return;
        }
      } else {
        // Credit card payment processing would go here
        toast.success("Credit card payment processed successfully");
      }
      
      // Create a new order - now we always have user.id
      const orderData = {
        userId: user.id,
        items: cart.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price
        })),
        total: getCartTotal(),
        status: 'pending' as const
      };
      
      // Add order to Supabase
      const newOrder = await addOrder(orderData);
      
      if (newOrder) {
        // Clear cart
        clearCart();
        
        // Navigate to order confirmation
        navigate('/order-confirmation', { state: { orderId: newOrder.id } });
      } else {
        toast.error("Failed to create order. Please try again.");
      }
    } catch (error) {
      console.error('Error creating order:', error);
      toast.error("An error occurred while processing your order");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>
      
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-2/3">
          <form onSubmit={handleSubmit}>
            <ShippingForm 
              formData={formData} 
              handleChange={handleChange} 
              isSubmitting={isSubmitting}
            />
            
            <PaymentMethodForm 
              paymentMethod={formData.paymentMethod} 
              handleChange={handleChange} 
            />
            
            <div className="mt-8">
              <CheckoutButton isSubmitting={isSubmitting || paymentProcessing} />
              
              {formData.paymentMethod === 'paypal' && (
                <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                  <p>By clicking "Complete Order", you'll be redirected to PayPal to complete your purchase securely.</p>
                </div>
              )}
            </div>
          </form>
        </div>
        
        <div className="lg:w-1/3">
          <OrderSummary 
            cart={cart} 
            getCartTotal={getCartTotal} 
          />
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
