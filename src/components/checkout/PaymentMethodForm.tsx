
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
            id="stripe"
            name="paymentMethod"
            value="stripe"
            checked={paymentMethod === 'stripe'}
            onChange={handleChange}
            className="h-4 w-4 text-primary"
          />
          <Label htmlFor="stripe" className="flex flex-1 cursor-pointer items-center justify-between dark:text-gray-300">
            <div className="flex items-center gap-2">
              Stripe
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#6772E5">
                <path d="M13.479 9.883c-1.626-.604-2.512-.931-2.512-1.618 0-.646.646-1.033 1.701-1.033 2.12 0 4.32.913 5.87 1.756V4.908c-1.23-.763-3.041-1.255-5.870-1.255-2.076 0-3.809.522-4.962 1.469-1.211.989-1.837 2.394-1.837 4.051 0 3.047 1.899 4.316 4.962 5.376 2.384.799 2.982 1.374 2.982 2.24 0 .869-.76 1.374-2.036 1.374-1.758 0-4.259-.904-6.103-2.119v4.125c1.555.97 3.93 1.618 6.103 1.618 2.15 0 3.96-.523 5.15-1.506 1.282-1.052 1.95-2.618 1.95-4.441 0-3.116-1.899-4.317-5.397-5.376l-.001-.001z"/>
              </svg>
              <Badge variant="outline" className="ml-2 bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                Test Mode
              </Badge>
            </div>
          </Label>
        </div>
      </div>
      
      {paymentMethod === 'stripe' && (
        <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-700 rounded text-sm">
          <p className="font-medium">Test Mode Info:</p>
          <ul className="list-disc ml-5 mt-1 space-y-1">
            <li>Use test card: 4242 4242 4242 4242</li>
            <li>Any future date for expiry</li>
            <li>Any 3 digits for CVC</li>
            <li>Any name and postal code</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default PaymentMethodForm;
