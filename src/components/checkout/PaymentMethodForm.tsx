
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
          <label htmlFor="credit_card" className="flex items-center dark:text-gray-300">
            Credit Card
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 ml-2 text-gray-600">
              <path d="M4 4C2.89543 4 2 4.89543 2 6V18C2 19.1046 2.89543 20 4 20H20C21.1046 20 22 19.1046 22 18V6C22 4.89543 21.1046 4 20 4H4ZM4 6H20V10H4V6ZM4 12H6V14H4V12ZM8 12H10V14H8V12ZM4 16H12V18H4V16Z"></path>
            </svg>
          </label>
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
          <label htmlFor="paypal" className="flex items-center dark:text-gray-300">
            PayPal
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#0070ba" className="w-6 h-6 ml-2">
              <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm12.144-14.7c-.003 2.068-1.28 5.717-5.685 5.717h-2.19c-.524 0-.97.382-1.05.9L9.158 21.337H4.55a.641.641 0 0 1-.633-.74L7.025.902C7.108.382 7.555 0 8.08 0h7.46c2.57 0 4.148.543 5.26 1.81.962 1.148 1.006 2.92.42 4.827z"></path>
            </svg>
          </label>
        </div>
      </div>
    </div>
  );
};

export default PaymentMethodForm;
