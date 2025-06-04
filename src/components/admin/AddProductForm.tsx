
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';
import VehicleSelector from './VehicleSelector';
import BrandSelector from './BrandSelector';
import ImageUploader from './ImageUploader';
import { sanitizeText, validateRequiredFields } from '@/utils/sanitization';

const VEHICLE_TYPES = [
  "Toyota Hilux",
  "Toyota Land Cruiser",
  "Nissan Patrol",
  "Mitsubishi L200"
];

const AddProductForm: React.FC = () => {
  const [productName, setProductName] = useState('');
  const [price, setPrice] = useState('');
  const [selectedBrand, setSelectedBrand] = useState<string>('');
  const [selectedVehicle, setSelectedVehicle] = useState<string>('');
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  // Handle image change
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image file must be less than 5MB');
        return;
      }
      
      setUploadedImage(file);
      
      // Create a preview
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Sanitize inputs
    const sanitizedProductName = sanitizeText(productName);
    const sanitizedPrice = sanitizeText(price);
    
    // Validate required fields
    const formData = {
      productName: sanitizedProductName,
      price: sanitizedPrice,
      selectedVehicle
    };
    
    const missingFields = validateRequiredFields(formData, ['productName', 'price', 'selectedVehicle']);
    
    if (missingFields.length > 0) {
      toast.error(`Please fill in all required fields: ${missingFields.join(', ')}`);
      return;
    }

    // Validate price is a positive number
    const priceNum = parseFloat(sanitizedPrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      toast.error('Please enter a valid price');
      return;
    }

    setLoading(true);

    try {
      // Check user authentication and role
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('You must be logged in to add products');
        navigate('/login');
        return;
      }

      console.log('Current user:', user.email);

      // Create full product name with vehicle type
      const fullProductName = `${sanitizedProductName} for ${selectedVehicle}`;
      
      // Upload image if present
      let imageUrl = null;
      if (uploadedImage) {
        console.log('Uploading image:', uploadedImage.name);
        
        // Check if products bucket exists
        const { data: bucketData, error: bucketError } = await supabase.storage.listBuckets();
        
        if (bucketError) {
          console.error('Error checking buckets:', bucketError);
          toast.error('Error checking storage buckets');
          setLoading(false);
          return;
        }
        
        let bucketExists = bucketData?.some(bucket => bucket.name === 'products');
        console.log('Bucket exists:', bucketExists);
        
        // Create bucket if it doesn't exist
        if (!bucketExists) {
          console.log('Creating products bucket');
          const { error: createError } = await supabase.storage.createBucket('products', {
            public: true
          });
          
          if (createError) {
            toast.error('Failed to create storage for images');
            console.error('Bucket creation error:', createError);
            setLoading(false);
            return;
          }
          console.log('Products bucket created successfully');
        }
        
        // Upload the file
        const fileExt = uploadedImage.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
        const filePath = `product-images/${fileName}`;
        
        console.log('Uploading file to path:', filePath);
        const { error: uploadError } = await supabase.storage
          .from('products')
          .upload(filePath, uploadedImage);
        
        if (uploadError) {
          toast.error('Failed to upload image');
          console.error('Image upload error:', uploadError);
          setLoading(false);
          return;
        }
        
        console.log('Image uploaded successfully');
        
        // Get the public URL
        const { data: publicUrl } = supabase.storage
          .from('products')
          .getPublicUrl(filePath);
          
        imageUrl = publicUrl.publicUrl;
        console.log('Image URL:', imageUrl);
      }
      
      // Insert into database
      const productData = {
        name: fullProductName,
        price: priceNum,
        brand_id: selectedBrand ? parseInt(selectedBrand) : null,
        image_url: imageUrl
      };
      
      console.log('Inserting product into database:', productData);
      
      const { data, error } = await supabase
        .from('products')
        .insert(productData)
        .select()
        .single();
      
      if (error) {
        console.error('Product creation error:', error);
        
        // Provide more specific error messages
        if (error.code === 'PGRST301') {
          toast.error('Access denied. You need admin privileges to add products.');
        } else if (error.code === '23505') {
          toast.error('A product with this name already exists');
        } else {
          toast.error(`Failed to add product: ${error.message}`);
        }
      } else {
        console.log('Product added successfully:', data);
        toast.success('Product added successfully!');
        
        // Reset form
        setProductName('');
        setPrice('');
        setSelectedBrand('');
        setSelectedVehicle('');
        setUploadedImage(null);
        setImagePreview(null);
        
        // Redirect to admin page
        navigate('/admin');
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Add New Product</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="product-name">Product Name</Label>
            <Input 
              id="product-name"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="Enter product name"
              required
              maxLength={255}
            />
          </div>

          <VehicleSelector 
            selectedVehicle={selectedVehicle}
            setSelectedVehicle={setSelectedVehicle}
            vehicleTypes={VEHICLE_TYPES}
            isMobile={isMobile}
          />

          <div>
            <Label htmlFor="price">Price ($)</Label>
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
          />

          <ImageUploader 
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
