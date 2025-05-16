
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
    paymentMethod: 'stripe' // Default to Stripe instead of credit_card
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

  // Validate form fields
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    // Required fields
    if (!formData.firstName) errors.firstName = "First name is required";
    if (!formData.lastName) errors.lastName = "Last name is required";
    if (!formData.email) errors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = "Email is invalid";
    if (!formData.address) errors.address = "Address is required";
    if (!formData.city) errors.city = "City is required";
    if (!formData.state) errors.state = "State is required";
    if (!formData.zipCode) errors.zipCode = "ZIP code is required";
    else if (!/^\d{5}(-\d{4})?$/.test(formData.zipCode)) errors.zipCode = "ZIP code is invalid";
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Create an order in your database
  const createOrder = async (stripeSessionId?: string) => {
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
        status: 'pending' as const,
        stripeSessionId
      };
      
      console.log("Creating order with data:", orderData);
      
      // Add order to Supabase
      const newOrder = await addOrder(orderData);
      
      if (newOrder) {
        console.log("Order created successfully:", newOrder);
        
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
    
    // Validate form
    if (!validateForm()) {
      toast.error("Please fill in all required fields correctly");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      if (formData.paymentMethod === 'credit_card') {
        // Credit card payment processing would go here
        setPaymentProcessing(true);
        toast.success("Credit card payment processed successfully");
        await createOrder();
      }
      // For Stripe, the checkout is handled by the CheckoutButton
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
              fieldErrors={fieldErrors}
            />
            
            <PaymentMethodForm 
              paymentMethod={formData.paymentMethod} 
              handleChange={handleChange}
            />
            
            <div className="mt-8">
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
