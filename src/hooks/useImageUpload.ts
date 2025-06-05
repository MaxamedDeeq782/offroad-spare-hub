
import { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export const useImageUpload = () => {
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

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

  const resetImage = () => {
    setUploadedImage(null);
    setImagePreview(null);
  };

  return {
    uploadedImage,
    imagePreview,
    handleImageChange,
    uploadImage,
    resetImage
  };
};
