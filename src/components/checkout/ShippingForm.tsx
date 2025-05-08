
import React from 'react';

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  paymentMethod: string;
}

interface ShippingFormProps {
  formData: FormData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  isSubmitting: boolean;
}

const ShippingForm: React.FC<ShippingFormProps> = ({ formData, handleChange, isSubmitting }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow dark:bg-gray-800">
      <h2 className="text-xl font-semibold mb-6">Shipping Information</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            First Name
          </label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            className="w-full border rounded-md px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            required
          />
        </div>
        
        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Last Name
          </label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            className="w-full border rounded-md px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            required
          />
        </div>
      </div>
      
      <div className="mb-6">
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Email
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className="w-full border rounded-md px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          required
        />
      </div>
      
      <div className="mb-6">
        <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Address
        </label>
        <input
          type="text"
          id="address"
          name="address"
          value={formData.address}
          onChange={handleChange}
          className="w-full border rounded-md px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          required
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div>
          <label htmlFor="city" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            City
          </label>
          <input
            type="text"
            id="city"
            name="city"
            value={formData.city}
            onChange={handleChange}
            className="w-full border rounded-md px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            required
          />
        </div>
        
        <div>
          <label htmlFor="state" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            State
          </label>
          <input
            type="text"
            id="state"
            name="state"
            value={formData.state}
            onChange={handleChange}
            className="w-full border rounded-md px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            required
          />
        </div>
        
        <div>
          <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            ZIP Code
          </label>
          <input
            type="text"
            id="zipCode"
            name="zipCode"
            value={formData.zipCode}
            onChange={handleChange}
            className="w-full border rounded-md px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            required
          />
        </div>
      </div>
    </div>
  );
};

export default ShippingForm;
