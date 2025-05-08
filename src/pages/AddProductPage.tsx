import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { supabase } from '../integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';

interface Brand {
  id: number;
  name: string;
}

const VEHICLE_TYPES = [
  "Toyota Hilux",
  "Toyota Land Cruiser",
  "Nissan Patrol",
  "Mitsubishi L200"
];

const AddProductPage: React.FC = () => {
  const [productName, setProductName] = useState('');
  const [price, setPrice] = useState('');
  const [selectedBrand, setSelectedBrand] = useState<string>('');
  const [selectedVehicle, setSelectedVehicle] = useState<string>('');
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  // Check admin status whenever user changes
  useEffect(() => {
    // Check if the user is admin from metadata
    if (user?.user_metadata?.isAdmin) {
      setIsAdmin(true);
    } else {
      // If not in user metadata, check session storage as fallback
      const adminAuth = sessionStorage.getItem('adminAuth');
      setIsAdmin(adminAuth === 'true');
    }
  }, [user]);

  // Fetch brands on component mount
  useEffect(() => {
    fetchBrands();
  }, []);

  // Fetch all brands from the database
  const fetchBrands = async () => {
    try {
      const { data, error } = await supabase.from('brands').select('*');
      if (error) {
        console.error('Error fetching brands:', error);
        toast.error('Failed to load brands');
      } else {
        setBrands(data || []);
      }
    } catch (error) {
      console.error('Unexpected error fetching brands:', error);
      toast.error('An error occurred while loading brands');
    }
  };

  // Handle image change
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
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
    
    if (!productName || !price || !selectedVehicle) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);

    try {
      // Create full product name with vehicle type
      const fullProductName = `${productName} for ${selectedVehicle}`;
      
      // Upload image if present
      let imageUrl = null;
      if (uploadedImage) {
        // Check if products bucket exists
        const { data: bucketData } = await supabase.storage.listBuckets();
        let bucketExists = bucketData?.some(bucket => bucket.name === 'products');
        
        // Create bucket if it doesn't exist
        if (!bucketExists) {
          const { error: createError } = await supabase.storage.createBucket('products', {
            public: true
          });
          
          if (createError) {
            toast.error('Failed to create storage for images');
            console.error('Bucket creation error:', createError);
            setLoading(false);
            return;
          }
        }
        
        // Upload the file
        const fileExt = uploadedImage.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
        const filePath = `product-images/${fileName}`;
        
        const { error: uploadError } = await supabase.storage
          .from('products')
          .upload(filePath, uploadedImage);
        
        if (uploadError) {
          toast.error('Failed to upload image');
          console.error('Image upload error:', uploadError);
          setLoading(false);
          return;
        }
        
        // Get the public URL
        const { data: publicUrl } = supabase.storage
          .from('products')
          .getPublicUrl(filePath);
          
        imageUrl = publicUrl.publicUrl;
      }
      
      // Insert into database
      const { data, error } = await supabase
        .from('products')
        .insert({
          name: fullProductName,
          price: parseFloat(price),
          brand_id: selectedBrand ? parseInt(selectedBrand) : null,
          image_url: imageUrl
        })
        .select()
        .single();
      
      if (error) {
        toast.error('Failed to add product');
        console.error('Product creation error:', error);
      } else {
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

  // If not admin, show access denied
  if (!isAdmin) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
        <p>{!user ? "Please log in first." : "You don't have permission to access this page."}</p>
        <Button 
          className="mt-4" 
          onClick={() => navigate('/')}
        >
          Return to Home
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
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
              />
            </div>

            <div>
              <Label htmlFor="vehicle-type">Vehicle Type</Label>
              <Select 
                value={selectedVehicle} 
                onValueChange={setSelectedVehicle}
              >
                <SelectTrigger id="vehicle-type">
                  <SelectValue placeholder="Select vehicle type" />
                </SelectTrigger>
                <SelectContent>
                  {VEHICLE_TYPES.map((vehicle) => (
                    <SelectItem key={vehicle} value={vehicle}>
                      {vehicle}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

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

            <div>
              <Label htmlFor="brand">Brand (Optional)</Label>
              <Select 
                value={selectedBrand} 
                onValueChange={setSelectedBrand}
              >
                <SelectTrigger id="brand">
                  <SelectValue placeholder="Select a brand" />
                </SelectTrigger>
                <SelectContent>
                  {brands.map((brand) => (
                    <SelectItem key={brand.id} value={brand.id.toString()}>
                      {brand.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

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

            <div className="flex justify-end">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate('/admin')}
                className="mr-2"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Adding Product...' : 'Add Product'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddProductPage;
