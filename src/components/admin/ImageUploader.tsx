
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface ImageUploaderProps {
  handleImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  imagePreview: string | null;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ handleImageChange, imagePreview }) => {
  return (
    <div>
      <Label htmlFor="product-image">Product Image (Optional)</Label>
      <Input 
        id="product-image"
        type="file" 
        accept="image/*"
        onChange={handleImageChange}
      />
      {imagePreview && (
        <div className="mt-2">
          <p className="text-sm mb-1">Image Preview:</p>
          <img 
            src={imagePreview} 
            alt="Preview" 
            className="max-w-full h-auto max-h-32 rounded" 
          />
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
