
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { addOrder } from '../models/Order';
import { toast } from 'sonner';
import ShippingForm from '../components/checkout/ShippingForm';
import PaymentMethodForm from '../components/checkout/PaymentMethodForm';
import OrderSummary from '../components/checkout/OrderSummary';
import CheckoutButton from '../components/checkout/CheckoutButton';

// You should get this from an environment variable in a real application
const PAYPAL_CLIENT_ID = "YOUR_PAYPAL_CLIENT_ID_HERE";

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
  
  // Update the PayPal total amount element whenever the cart changes
  useEffect(() => {
    const amountElement = document.getElementById("paypal-total-amount");
    if (amountElement) {
      amountElement.setAttribute("data-amount", getCartTotal().toFixed(2));
    }
  }, [cart, getCartTotal]);

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

  // Process the PayPal payment after approval
  const handlePayPalApprove = useCallback(async (paypalData: any) => {
    setPaymentProcessing(true);
    toast.info("Processing your PayPal payment...");
    
    try {
      console.log("PayPal transaction approved:", paypalData);
      
      // Here you would typically validate the payment with your backend
      // For now, we'll just simulate a successful payment
      toast.success("Payment confirmed via PayPal");
      
      // After payment is confirmed, create the order
      await createOrder();
    } catch (error) {
      console.error("Error processing PayPal payment:", error);
      toast.error("Failed to process payment. Please try again.");
      setPaymentProcessing(false);
    }
  }, []);

  // Create an order in your database
  const createOrder = async () => {
    try {
      // Create a new order 
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
      setPaymentProcessing(false);
      setIsSubmitting(false);
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
      if (formData.paymentMethod === 'credit_card') {
        // Credit card payment processing would go here
        toast.success("Credit card payment processed successfully");
        await createOrder();
      } else {
        // For PayPal, the payment is processed when the PayPal button is clicked
        // The order is created in the handlePayPalApprove callback
        // So we don't need to do anything here for PayPal
        setIsSubmitting(false);
        toast.info("Please complete your payment using the PayPal button");
      }
    } catch (error) {
      console.error('Error during checkout:', error);
      toast.error("An error occurred while processing your order");
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
              onPayPalApprove={handlePayPalApprove}
              clientId={PAYPAL_CLIENT_ID}
            />
            
            <div className="mt-8">
              {formData.paymentMethod === 'credit_card' && (
                <CheckoutButton isSubmitting={isSubmitting || paymentProcessing} />
              )}
              
              {formData.paymentMethod === 'paypal' && (
                <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                  <p>Please use the PayPal button above to complete your purchase securely.</p>
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
