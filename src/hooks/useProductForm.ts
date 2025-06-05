
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { validateProductForm, createProductData, ProductFormData } from '@/utils/productFormValidation';
import { sanitizeText } from '@/utils/sanitization';

export const useProductForm = () => {
  const [productName, setProductName] = useState('');
  const [price, setPrice] = useState('');
  const [selectedBrand, setSelectedBrand] = useState<string>('');
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const resetForm = () => {
    setProductName('');
    setPrice('');
    setSelectedBrand('');
    setUploadedImage(null);
    setImagePreview(null);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file');
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image file must be less than 5MB');
        return;
      }
      
      setUploadedImage(file);
      
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!uploadedImage) return null;

    console.log('Uploading image:', uploadedImage.name);
    
    try {
      const fileExt = uploadedImage.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `product-images/${fileName}`;
      
      console.log('Uploading file to path:', filePath);
      
      // First check if the bucket exists, if not create it
      const { data: buckets } = await supabase.storage.listBuckets();
      const productsBucket = buckets?.find(bucket => bucket.name === 'products');
      
      if (!productsBucket) {
        console.log('Products bucket not found, will continue without image upload');
        return null;
      }
      
      const { error: uploadError } = await supabase.storage
        .from('products')
        .upload(filePath, uploadedImage);
      
      if (uploadError) {
        console.error('Image upload error:', uploadError);
        console.log('Continuing without image upload');
        return null;
      }

      console.log('Image uploaded successfully');
      
      const { data: publicUrl } = supabase.storage
        .from('products')
        .getPublicUrl(filePath);
        
      console.log('Image URL:', publicUrl.publicUrl);
      return publicUrl.publicUrl;
    } catch (error) {
      console.error('Image upload failed:', error);
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Form submission started');
    console.log('Form data:', { productName, price, selectedBrand });
    
    const sanitizedFormData: ProductFormData = {
      productName: sanitizeText(productName),
      price: sanitizeText(price),
      selectedBrand
    };
    
    if (!validateProductForm(sanitizedFormData)) {
      console.log('Form validation failed');
      return;
    }

    setLoading(true);

    try {
      // Check authentication
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        console.error('Auth error:', authError);
        toast.error('Authentication error. Please try logging in again.');
        setLoading(false);
        return;
      }
      
      if (!user) {
        console.log('No user found');
        toast.error('You must be logged in to add products');
        navigate('/login');
        setLoading(false);
        return;
      }

      console.log('Current user:', user.email);

      // Upload image if provided
      const imageUrl = await uploadImage();
      const productData = createProductData(sanitizedFormData, imageUrl);
      
      console.log('Inserting product into database:', productData);
      
      // Insert product
      const { data, error } = await supabase
        .from('products')
        .insert(productData)
        .select()
        .single();
      
      if (error) {
        console.error('Product creation error:', error);
        
        if (error.code === 'PGRST301') {
          toast.error('Access denied. You need admin privileges to add products.');
        } else if (error.code === '23505') {
          toast.error('A product with this name already exists');
        } else if (error.message.includes('permission denied')) {
          toast.error('Permission denied. Please check your admin access.');
        } else {
          toast.error(`Failed to add product: ${error.message}`);
        }
      } else {
        console.log('Product added successfully:', data);
        toast.success('Product added successfully!');
        resetForm();
        navigate('/admin');
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      toast.error('An unexpected error occurred while adding the product');
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
