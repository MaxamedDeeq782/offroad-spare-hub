
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '../../integrations/supabase/client';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../ui/table';

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
}

const AdminProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch products and brands on component mount
  useEffect(() => {
    fetchProducts();
    fetchBrands();
  }, []);

  // Fetch all products from the database
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*');
      
      if (error) {
        console.error('Error fetching products:', error);
        toast.error('Failed to load products');
      } else {
        // Filter products to only show the specific vehicle types
        const filteredProducts = (data || []).filter(product => {
          const productName = product.name.toLowerCase();
          return (
            productName.includes('toyota hilux') || 
            productName.includes('land cruiser') ||
            productName.includes('nissan patrol') ||
            productName.includes('mitsubishi l200')
          );
        });
        
        setProducts(filteredProducts);
      }
    } catch (error) {
      console.error('Unexpected error fetching products:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch all brands from the database
  const fetchBrands = async () => {
    try {
      const { data, error } = await supabase.from('brands').select('*');
      if (error) {
        console.error('Error fetching brands:', error);
      } else {
        setBrands(data || []);
      }
    } catch (error) {
      console.error('Unexpected error fetching brands:', error);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Manage Products</h2>
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
                <TableHead>Vehicle Type</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => {
                const brand = brands.find(b => b.id === product.brand_id);
                
                // Determine the vehicle type
                let vehicleType = "";
                const productName = product.name.toLowerCase();
                if (productName.includes('toyota hilux')) vehicleType = "Toyota Hilux";
                else if (productName.includes('land cruiser')) vehicleType = "Toyota Land Cruiser";
                else if (productName.includes('nissan patrol')) vehicleType = "Nissan Patrol";
                else if (productName.includes('mitsubishi l200')) vehicleType = "Mitsubishi L200";
                
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
                    <TableCell>{brand?.name || 'No brand'}</TableCell>
                    <TableCell>{vehicleType || 'Unknown'}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-4">No products found for the specified vehicle types.</div>
        )}
      </div>
    </div>
  );
};

export default AdminProducts;
