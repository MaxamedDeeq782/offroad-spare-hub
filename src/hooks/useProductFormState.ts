
import { useState } from 'react';

export const useProductFormState = () => {
  const [productName, setProductName] = useState('');
  const [price, setPrice] = useState('');
  const [selectedBrand, setSelectedBrand] = useState<string>('');

  const resetFormState = () => {
    setProductName('');
    setPrice('');
    setSelectedBrand('');
  };

  return {
    productName,
    setProductName,
    price,
    setPrice,
    selectedBrand,
    setSelectedBrand,
    resetFormState
  };
};
