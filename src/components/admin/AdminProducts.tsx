
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '../../integrations/supabase/client';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../ui/table';
import AddProductModal from './AddProductModal';
import { processProductsWithVehicleTypes } from '../../utils/productProcessing';

interface Brand {
  id: number;
  name: string;
}

interface Product {
  id: number;
  name: string;
  price: number;
  image_url: string | null;
  brand_id: number | null;
  brands?: {
    name: string;
  };
  vehicleType?: string;
}

const AdminProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch products and brands on component mount
  useEffect(() => {
    fetchProductsAndBrands();
  }, []);

  const fetchProductsAndBrands = async () => {
    try {
      setLoading(true);
      console.log('=== FETCHING PRODUCTS AND BRANDS FOR ADMIN ===');
      
      // Fetch both in parallel
      const [productsResponse, brandsResponse] = await Promise.all([
        supabase
          .from('products')
          .select(`
            *,
            brands (
              name
            )
          `)
          .order('name'),
        supabase
          .from('brands')
          .select('*')
          .order('name')
      ]);
      
      if (productsResponse.error) {
        console.error('Error fetching products:', productsResponse.error);
        toast.error('Failed to load products');
      } else if (brandsResponse.error) {
        console.error('Error fetching brands:', brandsResponse.error);
        toast.error('Failed to load brands');
      } else {
        console.log('Fetched products:', productsResponse.data);
        console.log('Fetched brands:', brandsResponse.data);
        
        const brandsData = brandsResponse.data || [];
        const productsData = productsResponse.data || [];
        
        // Process products with vehicle types
        const processedProducts = processProductsWithVehicleTypes(productsData, brandsData);
        
        setBrands(brandsData);
        setProducts(processedProducts);
      }
    } catch (error) {
      console.error('Unexpected error fetching data:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Callback function to refresh data when a new product is added
  const handleProductAdded = () => {
    console.log('Product added - refreshing admin products list');
    fetchProductsAndBrands();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Manage Products</h2>
        <AddProductModal onProductAdded={handleProductAdded} />
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        {loading ? (
          <div className="text-center py-4">Loading products...</div>
        ) : products.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Brand</TableHead>
                <TableHead>Brand ID</TableHead>
                <TableHead>Vehicle Type</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => {
                const brandName = product.brands?.name || brands.find(b => b.id === product.brand_id)?.name || 'No brand';
                
                return (
                  <TableRow key={product.id}>
                    <TableCell>
                      {product.image_url ? (
                        <img 
                          src={product.image_url} 
                          alt={product.name} 
                          className="w-16 h-16 object-cover rounded"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center">
                          No image
                        </div>
                      )}
                    </TableCell>
                    <TableCell>{product.name}</TableCell>
                    <TableCell>${product.price.toFixed(2)}</TableCell>
                    <TableCell>{brandName}</TableCell>
                    <TableCell>
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {product.brand_id || 'NULL'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={`text-xs px-2 py-1 rounded ${
                        product.vehicleType 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {product.vehicleType || 'Unknown'}
                      </span>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-4">No products found.</div>
        )}
      </div>
    </div>
  );
};

export default AdminProducts;
