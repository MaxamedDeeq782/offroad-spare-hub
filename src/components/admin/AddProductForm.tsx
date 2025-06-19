
import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useIsMobile } from '@/hooks/use-mobile';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useState } from 'react';
import BrandSelector from './BrandSelector';
import ImageUploader from './ImageUploader';
import { useImageUpload } from '@/hooks/useImageUpload';
import { submitProduct } from '@/utils/productSubmission';

interface FormData {
  productName: string;
  price: string;
  selectedBrand: string;
}

const AddProductForm: React.FC = () => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset
  } = useForm<FormData>({
    defaultValues: {
      productName: '',
      price: '',
      selectedBrand: ''
    }
  });

  const {
    uploadedImage,
    imagePreview,
    handleImageChange,
    uploadImage,
    resetImage
  } = useImageUpload();

  const selectedBrand = watch('selectedBrand');

  const onSubmit = async (data: FormData) => {
    console.log('=== FORM SUBMISSION STARTED ===');
    console.log('Form data:', data);
    
    setLoading(true);

    try {
      // Upload image if provided
      console.log('Starting image upload...');
      const imageUrl = await uploadImage();
      console.log('Image upload result:', imageUrl);
      
      // Submit the product
      console.log('Starting product submission...');
      await submitProduct({
        productName: data.productName,
        price: data.price,
        selectedBrand: data.selectedBrand,
        imageUrl
      });
      
      console.log('Product submitted successfully, resetting form...');
      reset();
      resetImage();
      
      console.log('Navigating to admin page...');
      navigate('/admin');
      
    } catch (error) {
      console.error('=== FORM SUBMISSION ERROR ===');
      console.error('Error details:', error);
      
      if (error instanceof Error) {
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

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Add New Product</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <Label htmlFor="product-name">Product Name *</Label>
            <Input 
              id="product-name"
              {...register('productName', { 
                required: 'Product name is required',
                minLength: { value: 3, message: 'Product name must be at least 3 characters' }
              })}
              placeholder="Enter product name (e.g., Toyota Hilux Brake Pads)"
              maxLength={255}
              className="mt-1"
            />
            {errors.productName && (
              <p className="text-sm text-red-500 mt-1">{errors.productName.message}</p>
            )}
            <p className="text-sm text-muted-foreground mt-1">
              Include vehicle model in the name for better organization
            </p>
          </div>

          <div>
            <Label htmlFor="price">Price ($) *</Label>
            <Input 
              id="price"
              type="number" 
              step="0.01" 
              min="0.01"
              {...register('price', { 
                required: 'Price is required',
                min: { value: 0.01, message: 'Price must be greater than 0' }
              })}
              placeholder="0.00"
              className="mt-1"
            />
            {errors.price && (
              <p className="text-sm text-red-500 mt-1">{errors.price.message}</p>
            )}
          </div>

          <BrandSelector 
            selectedBrand={selectedBrand}
            setSelectedBrand={(value) => setValue('selectedBrand', value)}
            isMobile={isMobile}
            required={true}
          />
          {errors.selectedBrand && (
            <p className="text-sm text-red-500 mt-1">{errors.selectedBrand.message}</p>
          )}

          <ImageUploader 
            handleImageChange={handleImageChange}
            imagePreview={imagePreview}
          />

          <div className="flex justify-end flex-wrap gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate('/admin')}
              className={isMobile ? "w-full" : ""}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className={isMobile ? "w-full" : ""}
            >
              {loading ? 'Adding Product...' : 'Add Product'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default AddProductForm;
