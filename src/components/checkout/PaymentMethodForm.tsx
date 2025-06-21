
import React from 'react';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

interface PaymentMethodFormProps {
  paymentMethod: string;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

const PaymentMethodForm: React.FC<PaymentMethodFormProps> = ({ 
  paymentMethod, 
  handleChange
}) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow mt-6 dark:bg-gray-800">
      <h2 className="text-xl font-semibold mb-6">Payment Method</h2>
      
      <div className="space-y-4">
        <div className="flex items-center space-x-2 rounded-md border p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
          <input
            type="radio"
            id="credit_card"
            name="paymentMethod"
            value="credit_card"
            checked={paymentMethod === 'credit_card'}
            onChange={handleChange}
            className="h-4 w-4 text-primary"
          />
          <Label htmlFor="credit_card" className="flex flex-1 cursor-pointer items-center justify-between dark:text-gray-300">
            <div className="flex items-center gap-2">
              Credit Card
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 ml-2 text-gray-600">
                <path d="M4 4C2.89543 4 2 4.89543 2 6V18C2 19.1046 2.89543 20 4 20H20C21.1046 20 22 19.1046 22 18V6C22 4.89543 21.1046 4 20 4H4ZM4 6H20V10H4V6ZM4 12H6V14H4V12ZM8 12H10V14H8V12ZM4 16H12V18H4V16Z"></path>
              </svg>
            </div>
          </Label>
        </div>
        
        <div className="flex items-center space-x-2 rounded-md border p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
          <input
            type="radio"
            id="paypal"
            name="paymentMethod"
            value="paypal"
            checked={paymentMethod === 'paypal'}
            onChange={handleChange}
            className="h-4 w-4 text-primary"
          />
          <Label htmlFor="paypal" className="flex flex-1 cursor-pointer items-center justify-between dark:text-gray-300">
            <div className="flex items-center gap-2">
              PayPal
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#0070ba">
                <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.435-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 0 0-.607-.541c-.013.076-.026.175-.041.26-.93 5.34-4.829 7.174-9.604 7.174h-1.875c-.615 0-1.14.447-1.232 1.055l-.69 4.37-.197 1.252a.641.641 0 0 0 .633.74h4.25c.46 0 .852-.335.926-.787l.04-.207.754-4.773.049-.267c.074-.452.466-.787.926-.787h.584c3.784 0 6.749-1.54 7.61-5.995.36-1.855.174-3.407-.695-4.570z"/>
              </svg>
              <Badge variant="outline" className="ml-2 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                Sandbox Mode
              </Badge>
            </div>
          </Label>
        </div>
      </div>
      
      {paymentMethod === 'paypal' && (
        <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-700 rounded text-sm">
          <p className="font-medium">PayPal Sandbox Info:</p>
          <ul className="list-disc ml-5 mt-1 space-y-1">
            <li>Use PayPal sandbox test accounts</li>
            <li>Test payments will not be charged</li>
            <li>Use test PayPal accounts for testing</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default PaymentMethodForm;
