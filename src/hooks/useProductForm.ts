
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useProductFormState } from './useProductFormState';
import { useImageUpload } from './useImageUpload';
import { submitProduct } from '@/utils/productSubmission';

export const useProductForm = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  const {
    productName,
    setProductName,
    price,
    setPrice,
    selectedBrand,
    setSelectedBrand,
    resetFormState
  } = useProductFormState();

  const {
    uploadedImage,
    imagePreview,
    handleImageChange,
    uploadImage,
    resetImage
  } = useImageUpload();

  const resetForm = () => {
    resetFormState();
    resetImage();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setLoading(true);

    try {
      // Upload image if provided
      const imageUrl = await uploadImage();
      
      // Submit the product
      await submitProduct({
        productName,
        price,
        selectedBrand,
        imageUrl
      });
      
      resetForm();
      navigate('/admin');
    } catch (error) {
      console.error('=== UNEXPECTED ERROR ===');
      console.error('Unexpected error:', error);
      if (error instanceof Error && !error.message.includes('No brand selected') && !error.message.includes('Form validation failed') && !error.message.includes('Authentication error') && !error.message.includes('No user found')) {
        toast.error('An unexpected error occurred while adding the product');
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    productName,
    setProductName,
    price,
    setPrice,
    selectedBrand,
    setSelectedBrand,
    uploadedImage,
    imagePreview,
    loading,
    handleImageChange,
    handleSubmit,
    navigate
  };
};
