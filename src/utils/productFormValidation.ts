
import { toast } from 'sonner';

export interface ProductFormData {
  productName: string;
  price: string;
  selectedBrand: string;
}

export const validateProductForm = (formData: ProductFormData): boolean => {
  const { productName, price, selectedBrand } = formData;

  console.log('Validating form data:', formData);

  if (!productName.trim()) {
    toast.error('Please enter a product name');
    return false;
  }

  if (productName.trim().length < 3) {
    toast.error('Product name must be at least 3 characters long');
    return false;
  }

  if (!price.trim()) {
    toast.error('Please enter a price');
    return false;
  }

  const priceNum = parseFloat(price);
  if (isNaN(priceNum) || priceNum <= 0) {
    toast.error('Please enter a valid price greater than 0');
    return false;
  }

  if (!selectedBrand || selectedBrand === '') {
    toast.error('Please select a brand');
    return false;
  }

  const brandId = parseInt(selectedBrand);
  if (isNaN(brandId) || brandId <= 0) {
    toast.error('Please select a valid brand');
    return false;
  }

  console.log('Form validation passed');
  return true;
};

export const createProductData = (formData: ProductFormData, imageUrl: string | null) => {
  const productData = {
    name: formData.productName.trim(),
    price: parseFloat(formData.price),
    brand_id: parseInt(formData.selectedBrand),
    image_url: imageUrl
  };
  
  console.log('Created product data:', productData);
  return productData;
};
