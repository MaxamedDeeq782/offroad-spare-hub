
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
    
    console.log('=== FORM SUBMISSION STARTED ===');
    console.log('Form values:', { productName, price, selectedBrand });
    
    // Basic client-side validation
    if (!productName.trim()) {
      toast.error('Please enter a product name');
      return;
    }
    
    if (!price.trim()) {
      toast.error('Please enter a price');
      return;
    }
    
    if (!selectedBrand) {
      toast.error('Please select a brand');
      return;
    }
    
    setLoading(true);

    try {
      console.log('Starting image upload...');
      // Upload image if provided
      const imageUrl = await uploadImage();
      console.log('Image upload result:', imageUrl);
      
      console.log('Starting product submission...');
      // Submit the product
      await submitProduct({
        productName,
        price,
        selectedBrand,
        imageUrl
      });
      
      console.log('Product submitted successfully, resetting form...');
      resetForm();
      
      console.log('Navigating to admin page...');
      navigate('/admin');
      
    } catch (error) {
      console.error('=== FORM SUBMISSION ERROR ===');
      console.error('Error type:', typeof error);
      console.error('Error details:', error);
      
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        
        // Only show generic error for unexpected errors
        if (!error.message.includes('No brand selected') && 
            !error.message.includes('Form validation failed') && 
            !error.message.includes('Authentication error') && 
            !error.message.includes('No user found')) {
          toast.error('An unexpected error occurred while adding the product. Check console for details.');
        }
      } else {
        toast.error('An unknown error occurred while adding the product');
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
