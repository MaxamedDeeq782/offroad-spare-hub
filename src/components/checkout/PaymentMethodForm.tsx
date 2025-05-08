
import React, { useEffect } from 'react';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useScript } from "../../hooks/useScript";

interface PaymentMethodFormProps {
  paymentMethod: string;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onPayPalApprove?: (data: any) => void;
  clientId?: string;
}

const PAYPAL_SCRIPT_URL = "https://www.paypal.com/sdk/js";

const PaymentMethodForm: React.FC<PaymentMethodFormProps> = ({ 
  paymentMethod, 
  handleChange, 
  onPayPalApprove,
  clientId = "test" // Use your actual client ID in production
}) => {
  const { status: paypalStatus } = useScript(
    `${PAYPAL_SCRIPT_URL}?client-id=${clientId}&currency=USD`
  );

  useEffect(() => {
    // Initialize PayPal buttons when the script is loaded and payment method is PayPal
    if (paypalStatus === "ready" && paymentMethod === "paypal" && window.paypal) {
      try {
        // Clear the container first
        const container = document.getElementById("paypal-button-container");
        if (container) container.innerHTML = "";
        
        // @ts-ignore - PayPal is loaded via script
        window.paypal.Buttons({
          style: {
            layout: 'vertical',
            color: 'blue',
            shape: 'rect',
            label: 'paypal'
          },
          createOrder: (data: any, actions: any) => {
            // This will be called when the button is clicked
            return actions.order.create({
              purchase_units: [{
                amount: {
                  currency_code: "USD",
                  // The value should be passed from the parent component
                  // This is just a placeholder
                  value: document.getElementById("paypal-total-amount")?.getAttribute("data-amount") || "0.00"
                }
              }]
            });
          },
          onApprove: (data: any, actions: any) => {
            // This is called when the customer approves the payment
            return actions.order.capture().then(function(details: any) {
              if (onPayPalApprove) {
                onPayPalApprove({
                  orderID: data.orderID,
                  payerID: data.payerID,
                  details
                });
              }
            });
          },
          onError: (err: any) => {
            console.error("PayPal error:", err);
            // You could add error handling UI here
          }
        }).render("#paypal-button-container");
      } catch (error) {
        console.error("Error rendering PayPal buttons:", error);
      }
    }
  }, [paypalStatus, paymentMethod, onPayPalApprove, clientId]);

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

      {paymentMethod === 'paypal' && (
        <div className="mt-4">
          <div 
            id="paypal-total-amount" 
            data-amount="0.00"
            className="hidden"
          ></div>
          <div 
            id="paypal-button-container" 
            className="mt-4"
          >
            {paypalStatus === "loading" && (
              <div className="text-center py-4">
                <p>Loading PayPal buttons...</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentMethodForm;
