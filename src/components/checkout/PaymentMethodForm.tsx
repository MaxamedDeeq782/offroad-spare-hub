
import React from 'react';

interface PaymentMethodFormProps {
  paymentMethod: string;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

const PaymentMethodForm: React.FC<PaymentMethodFormProps> = ({ paymentMethod, handleChange }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow mt-6 dark:bg-gray-800">
      <h2 className="text-xl font-semibold mb-6">Payment Method</h2>
      
      <div className="mb-6">
        <div className="flex items-center mb-4">
          <input
            type="radio"
            id="credit_card"
            name="paymentMethod"
            value="credit_card"
            checked={paymentMethod === 'credit_card'}
            onChange={handleChange}
            className="mr-2"
          />
          <label htmlFor="credit_card" className="dark:text-gray-300">Credit Card</label>
        </div>
        
        <div className="flex items-center">
          <input
            type="radio"
            id="paypal"
            name="paymentMethod"
            value="paypal"
            checked={paymentMethod === 'paypal'}
            onChange={handleChange}
            className="mr-2"
          />
          <label htmlFor="paypal" className="dark:text-gray-300">PayPal</label>
        </div>
      </div>
    </div>
  );
};

export default PaymentMethodForm;
