
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useIsMobile } from '@/hooks/use-mobile';
import { useProductForm } from '@/hooks/useProductForm';
import ProductFormFields from './ProductFormFields';

const AddProductForm: React.FC = () => {
  const isMobile = useIsMobile();
  const {
    productName,
    setProductName,
    price,
    setPrice,
    selectedBrand,
    setSelectedBrand,
    imagePreview,
    loading,
    handleImageChange,
    handleSubmit,
    navigate
  } = useProductForm();

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Add New Product</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <ProductFormFields
            productName={productName}
            setProductName={setProductName}
            price={price}
            setPrice={setPrice}
            selectedBrand={selectedBrand}
            setSelectedBrand={setSelectedBrand}
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
