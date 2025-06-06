
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { validateProductForm, ProductFormData } from '@/utils/productFormValidation';
import { sanitizeText } from '@/utils/sanitization';

interface ProductSubmissionData {
  productName: string;
  price: string;
  selectedBrand: string;
  imageUrl?: string | null;
}

export const submitProduct = async (data: ProductSubmissionData) => {
  console.log('=== PRODUCT SUBMISSION STARTED ===');
  console.log('Form data:', { productName: data.productName, price: data.price, selectedBrand: data.selectedBrand });
  
  // Validate brand selection first
  if (!data.selectedBrand || data.selectedBrand === '' || data.selectedBrand === '0') {
    console.error('No brand selected');
    toast.error('Please select a brand from the dropdown');
    throw new Error('No brand selected');
  }

  const brandId = parseInt(data.selectedBrand);
  if (isNaN(brandId) || brandId <= 0) {
    console.error('Invalid brand ID:', data.selectedBrand);
    toast.error('Invalid brand selection. Please select a valid brand.');
    throw new Error('Invalid brand ID');
  }

  console.log('✓ Brand validation passed. Brand ID:', brandId);
  
  const sanitizedFormData: ProductFormData = {
    productName: sanitizeText(data.productName),
    price: sanitizeText(data.price),
    selectedBrand: data.selectedBrand
  };
  
  if (!validateProductForm(sanitizedFormData)) {
    console.log('Form validation failed');
    throw new Error('Form validation failed');
  }

  console.log('✓ Form validation passed');

  // Check authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError) {
    console.error('Auth error:', authError);
    toast.error('Authentication error. Please try logging in again.');
    throw new Error('Authentication error');
  }
  
  if (!user) {
    console.log('No user found');
    toast.error('You must be logged in to add products');
    throw new Error('No user found');
  }

  console.log('✓ User authenticated:', user.email);

  // Create the product data with explicit brand_id
  const productData = {
    name: sanitizedFormData.productName.trim(),
    price: parseFloat(sanitizedFormData.price),
    brand_id: brandId,
    image_url: data.imageUrl
  };
  
  console.log('=== INSERTING PRODUCT ===');
  console.log('Product data to insert:', productData);
  console.log('Brand ID being set:', productData.brand_id);
  
  // Insert product with better error handling
  const { data: insertedData, error } = await supabase
    .from('products')
    .insert(productData)
    .select('*, brands(name)')
    .single();
  
  if (error) {
    console.error('=== PRODUCT INSERTION ERROR ===');
    console.error('Error details:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    
    // More specific error handling
    if (error.code === '42501' || error.message.includes('permission denied')) {
      toast.error('Permission denied. You need admin privileges to add products.');
    } else if (error.code === '23505') {
      toast.error('A product with this name already exists');
    } else if (error.code === '23503' && error.message.includes('brand_id')) {
      toast.error('Invalid brand selected. Please select a valid brand.');
    } else if (error.code === '42P01') {
      toast.error('Database table not found. Please contact support.');
    } else {
      toast.error(`Failed to add product: ${error.message}`);
    }
    throw error;
  }

  console.log('=== PRODUCT INSERTED SUCCESSFULLY ===');
  console.log('Inserted product:', insertedData);
  
  // Show success message
  const brandName = insertedData.brands?.name || `Brand ID ${insertedData.brand_id}`;
  toast.success(`Product "${insertedData.name}" added successfully to ${brandName}!`);
  
  return insertedData;
};
