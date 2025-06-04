
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useIsMobile } from '@/hooks/use-mobile';
import BrandSelector from './BrandSelector';
import ImageUploader from './ImageUploader';

interface ProductFormFieldsProps {
  productName: string;
  setProductName: (value: string) => void;
  price: string;
  setPrice: (value: string) => void;
  selectedBrand: string;
  setSelectedBrand: (value: string) => void;
  handleImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  imagePreview: string | null;
}

const ProductFormFields: React.FC<ProductFormFieldsProps> = ({
  productName,
  setProductName,
  price,
  setPrice,
  selectedBrand,
  setSelectedBrand,
  handleImageChange,
  imagePreview
}) => {
  const isMobile = useIsMobile();

  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="product-name">Product Name *</Label>
        <Input 
          id="product-name"
          value={productName}
          onChange={(e) => setProductName(e.target.value)}
          placeholder="Enter product name"
          required
          maxLength={255}
        />
      </div>

      <div>
        <Label htmlFor="price">Price ($) *</Label>
        <Input 
          id="price"
          type="number" 
          step="0.01" 
          min="0"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="0.00"
          required
        />
      </div>

      <BrandSelector 
        selectedBrand={selectedBrand}
        setSelectedBrand={setSelectedBrand}
        isMobile={isMobile}
        required={true}
      />

      <ImageUploader 
        handleImageChange={handleImageChange}
        imagePreview={imagePreview}
      />
    </div>
  );
};

export default ProductFormFields;
