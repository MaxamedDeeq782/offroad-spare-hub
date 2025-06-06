
import { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export const useImageUpload = () => {
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      console.log('Image selected:', file.name, file.size, file.type);
      
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
    if (!uploadedImage) {
      console.log('No image to upload');
      return null;
    }

    console.log('=== STARTING IMAGE UPLOAD ===');
    console.log('Uploading image:', uploadedImage.name);
    
    try {
      const fileExt = uploadedImage.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `product-images/${fileName}`;
      
      console.log('Uploading file to path:', filePath);
      
      // First check if the bucket exists
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
      
      if (bucketsError) {
        console.error('Error listing buckets:', bucketsError);
        toast.error('Storage not available. Continuing without image.');
        return null;
      }
      
      console.log('Available buckets:', buckets);
      const productsBucket = buckets?.find(bucket => bucket.name === 'products');
      
      if (!productsBucket) {
        console.log('Products bucket not found, available buckets:', buckets?.map(b => b.name));
        toast.error('Products storage bucket not found. Continuing without image.');
        return null;
      }
      
      console.log('Products bucket found, proceeding with upload...');
      
      const { error: uploadError } = await supabase.storage
        .from('products')
        .upload(filePath, uploadedImage);
      
      if (uploadError) {
        console.error('Image upload error:', uploadError);
        toast.error(`Image upload failed: ${uploadError.message}. Continuing without image.`);
        return null;
      }

      console.log('Image uploaded successfully to:', filePath);
      
      const { data: publicUrl } = supabase.storage
        .from('products')
        .getPublicUrl(filePath);
        
      console.log('Public image URL:', publicUrl.publicUrl);
      toast.success('Image uploaded successfully!');
      return publicUrl.publicUrl;
    } catch (error) {
      console.error('Unexpected image upload error:', error);
      toast.error('Image upload failed. Continuing without image.');
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
