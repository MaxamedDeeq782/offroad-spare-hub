
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ProductSubmissionData {
  productName: string;
  price: string;
  selectedBrand: string;
  imageUrl?: string | null;
}

export const submitProduct = async (data: ProductSubmissionData) => {
  console.log('=== PRODUCT SUBMISSION STARTED ===');
  console.log('Form data received:', { 
    productName: data.productName, 
    price: data.price, 
    selectedBrand: data.selectedBrand,
    imageUrl: data.imageUrl 
  });
  
  // Validate required fields
  if (!data.productName?.trim()) {
    console.error('❌ Validation failed: Product name is empty');
    toast.error('Please enter a product name');
    throw new Error('Product name is required');
  }

  if (!data.price?.trim()) {
    console.error('❌ Validation failed: Price is empty');
    toast.error('Please enter a price');
    throw new Error('Price is required');
  }

  if (!data.selectedBrand || data.selectedBrand === '' || data.selectedBrand === '0') {
    console.error('❌ Validation failed: No brand selected');
    console.error('Selected brand value:', data.selectedBrand);
    toast.error('Please select a brand from the dropdown');
    throw new Error('No brand selected');
  }

  const brandId = parseInt(data.selectedBrand);
  if (isNaN(brandId) || brandId <= 0) {
    console.error('❌ Validation failed: Invalid brand ID:', data.selectedBrand);
    toast.error('Invalid brand selection. Please select a valid brand.');
    throw new Error('Invalid brand ID');
  }

  console.log('✅ Brand validation passed. Brand ID:', brandId);

  // Validate price
  const priceNum = parseFloat(data.price);
  if (isNaN(priceNum) || priceNum <= 0) {
    console.error('❌ Validation failed: Invalid price:', data.price);
    toast.error('Please enter a valid price greater than 0');
    throw new Error('Invalid price');
  }

  console.log('✅ All form validation passed');

  // Check authentication
  console.log('🔐 Checking authentication...');
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError) {
    console.error('❌ Auth error:', authError);
    toast.error('Authentication error. Please try logging in again.');
    throw new Error('Authentication error');
  }
  
  if (!user) {
    console.error('❌ No user found');
    toast.error('You must be logged in to add products');
    throw new Error('No user found');
  }

  console.log('✅ User authenticated:', user.email);

  // Verify the brand exists in the database before inserting
  console.log('🔍 Verifying brand exists in database...');
  const { data: brandData, error: brandError } = await supabase
    .from('brands')
    .select('id, name')
    .eq('id', brandId)
    .single();

  if (brandError || !brandData) {
    console.error('❌ Brand verification failed:', brandError);
    toast.error('Selected brand does not exist. Please refresh and try again.');
    throw new Error('Brand does not exist');
  }

  console.log('✅ Brand verified:', brandData);

  // Create the product data
  const productData = {
    name: data.productName.trim(),
    price: priceNum,
    brand_id: brandId,
    image_url: data.imageUrl
  };
  
  console.log('=== ATTEMPTING DATABASE INSERT ===');
  console.log('Product data to insert:', productData);
  
  // Insert product
  const { data: insertedData, error } = await supabase
    .from('products')
    .insert(productData)
    .select('*, brands(name)')
    .single();
  
  if (error) {
    console.error('=== ❌ PRODUCT INSERTION FAILED ===');
    console.error('Error object:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    console.error('Error details:', error.details);
    console.error('Error hint:', error.hint);
    
    // More specific error handling
    if (error.code === '42501' || error.message.includes('permission denied')) {
      console.error('Permission denied error detected');
      toast.error('Permission denied. You need admin privileges to add products.');
    } else if (error.code === '23505') {
      console.error('Duplicate entry error detected');
      toast.error('A product with this name already exists');
    } else if (error.code === '23503' && error.message.includes('brand_id')) {
      console.error('Foreign key constraint error for brand_id');
      toast.error('Invalid brand selected. Please select a valid brand.');
    } else if (error.code === '42P01') {
      console.error('Table not found error');
      toast.error('Database table not found. Please contact support.');
    } else {
      console.error('Generic database error');
      toast.error(`Failed to add product: ${error.message}`);
    }
    throw error;
  }

  console.log('=== ✅ PRODUCT INSERTED SUCCESSFULLY ===');
  console.log('Inserted product data:', insertedData);
  
  // Show success message
  const brandName = insertedData.brands?.name || `Brand ID ${insertedData.brand_id}`;
  console.log('✅ Success! Product created with brand:', brandName);
  toast.success(`Product "${insertedData.name}" added successfully to ${brandName}!`);
  
  return insertedData;
};
