
import { toast } from 'sonner';

export interface ProductFormData {
  productName: string;
  price: string;
  selectedBrand: string;
}

export const validateProductForm = (formData: ProductFormData): boolean => {
  const { productName, price, selectedBrand } = formData;

  if (!productName.trim()) {
    toast.error('Please enter a product name');
    return false;
  }

  if (!price.trim()) {
    toast.error('Please enter a price');
    return false;
  }

  if (!selectedBrand) {
    toast.error('Please select a brand');
    return false;
  }

  const priceNum = parseFloat(price);
  if (isNaN(priceNum) || priceNum <= 0) {
    toast.error('Please enter a valid price');
    return false;
  }

  return true;
};

export const createProductData = (formData: ProductFormData, imageUrl: string | null) => {
  return {
    name: formData.productName.trim(),
    price: parseFloat(formData.price),
    brand_id: parseInt(formData.selectedBrand),
    image_url: imageUrl
  };
};
