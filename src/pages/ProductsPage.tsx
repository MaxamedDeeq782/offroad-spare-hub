
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { products, Product } from '../models/Product';
import { useCart } from '../contexts/CartContext';
import { Button } from '../components/ui/button';
import { ShoppingCart } from 'lucide-react';
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableHead, 
  TableRow, 
  TableCell 
} from '../components/ui/table';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { supabase } from '../integrations/supabase/client';

interface DbProduct {
  id: number;
  name: string;
  price: number;
  image_url: string;
  brand_id: number | null;
}

const ProductsPage: React.FC = () => {
  const [selectedVehicle, setSelectedVehicle] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const { addToCart } = useCart();
  const [dbProducts, setDbProducts] = useState<DbProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  // Extract unique vehicles for filters
  const vehicles = Array.from(
    new Set(products.flatMap(product => product.vehicleCompatibility))
  );

  // Check if a vehicle was selected from the homepage
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const vehicleParam = queryParams.get('vehicle');
    if (vehicleParam) {
      setSelectedVehicle(vehicleParam);
    }
  }, [location.search]);

  // Fetch products from Supabase
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*');
        
        if (error) {
          console.error('Error fetching products:', error);
        } else {
          setDbProducts(data || []);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Helper function to determine if a product belongs to a specific vehicle
  const productBelongsToVehicle = (product: Product, vehicle: string): boolean => {
    // If no vehicle is selected or the product's compatibility includes the selected vehicle
    if (!vehicle || product.vehicleCompatibility.includes(vehicle)) {
      return true;
    }
    return false;
  };

  // Helper function to determine vehicle from product name for database products
  const getVehicleFromProductName = (productName: string): string => {
    const vehicleKeywords = {
      'Toyota Hilux': ['hilux', 'toyota hilux'],
      'Toyota Land Cruiser': ['land cruiser', 'toyota land cruiser', 'fj80', 'fzj80'],
      'Nissan Patrol': ['patrol', 'nissan patrol', 'y62', 'armada'],
      'Mitsubishi L200': ['l200', 'mitsubishi l200']
    };

    const lowercaseName = productName.toLowerCase();
    
    for (const [vehicle, keywords] of Object.entries(vehicleKeywords)) {
      if (keywords.some(keyword => lowercaseName.includes(keyword.toLowerCase()))) {
        return vehicle;
      }
    }
    
    return '';
  };

  // Filter products based on selected filters and search term
  const filteredProducts = products.filter(product => {
    // First, check if the product belongs to the selected vehicle
    if (!productBelongsToVehicle(product, selectedVehicle)) {
      return false;
    }
    
    // Then check if the product matches the search term
    if (searchTerm && !product.name.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    return true;
  });

  // Filter database products based on selected vehicle and search term
  const filteredDbProducts = dbProducts.filter(product => {
    const productVehicle = getVehicleFromProductName(product.name);
    
    // Check if the product belongs to the selected vehicle
    if (selectedVehicle && productVehicle !== selectedVehicle) {
      return false;
    }
    
    // Check if the product matches the search term
    if (searchTerm && !product.name.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    return true;
  });

  const handleAddToCart = (product: Product) => {
    addToCart(product, 1);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">
        {selectedVehicle ? `${selectedVehicle} Parts` : 'All Products'}
      </h1>
      
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters */}
        <div className="lg:w-1/4">
          <Card>
            <CardHeader>
              <CardTitle>Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <label className="block font-medium mb-2">Search</label>
                <input 
                  type="text" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search products..."
                  className="w-full border rounded-md px-3 py-2 dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
              
              <div className="mb-6">
                <label className="block font-medium mb-2">Vehicle</label>
                <select 
                  value={selectedVehicle}
                  onChange={(e) => setSelectedVehicle(e.target.value)}
                  className="w-full border rounded-md px-3 py-2 dark:bg-gray-700 dark:border-gray-600"
                >
                  <option value="">All Vehicles</option>
                  {vehicles.map((vehicle) => (
                    <option key={vehicle} value={vehicle}>
                      {vehicle}
                    </option>
                  ))}
                </select>
              </div>
              
              {(selectedVehicle || searchTerm) && (
                <button
                  onClick={() => {
                    setSelectedVehicle('');
                    setSearchTerm('');
                  }}
                  className="mt-4 text-primary hover:text-primary-dark"
                >
                  Clear Filters
                </button>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Product Table */}
        <div className="lg:w-3/4">
          <Card>
            <CardHeader>
              <CardTitle>Products from Database</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <p>Loading products...</p>
                </div>
              ) : filteredDbProducts.length === 0 ? (
                <div className="text-center py-8">
                  <p>No products found in database for {selectedVehicle || "selected filters"}</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product Name</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDbProducts.map((product) => {
                      const vehicleType = getVehicleFromProductName(product.name);
                      return (
                        <TableRow key={product.id}>
                          <TableCell className="font-medium">
                            {product.name}
                            {vehicleType && (
                              <div className="text-xs text-gray-500 mt-1">
                                For: {vehicleType}
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="text-right">${product.price.toFixed(2)}</TableCell>
                          <TableCell className="text-right">
                            <Button 
                              onClick={() => {
                                const mockModelProduct: Product = {
                                  id: product.id.toString(),
                                  name: product.name,
                                  description: "Product from database",
                                  price: product.price,
                                  imageUrl: product.image_url || "/placeholder.svg",
                                  category: "Unknown",
                                  vehicleCompatibility: vehicleType ? [vehicleType] : [],
                                  stock: 10
                                };
                                handleAddToCart(mockModelProduct);
                              }} 
                              size="sm"
                            >
                              <ShoppingCart className="h-4 w-4 mr-1" />
                              Add to Cart
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Products from Model</CardTitle>
            </CardHeader>
            <CardContent>
              {filteredProducts.length === 0 ? (
                <div className="text-center py-8">
                  <p>No products found matching your criteria</p>
                  <button 
                    onClick={() => {
                      setSelectedVehicle('');
                      setSearchTerm('');
                    }}
                    className="mt-4 btn btn-primary"
                  >
                    Clear Filters
                  </button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product Name</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">
                          <Link to={`/product/${product.id}`} className="hover:underline">
                            {product.name}
                          </Link>
                          <div className="text-xs text-gray-500 mt-1">
                            For: {product.vehicleCompatibility.join(', ')}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">${product.price.toFixed(2)}</TableCell>
                        <TableCell className="text-right">
                          <Button 
                            onClick={() => handleAddToCart(product)}
                            size="sm"
                          >
                            <ShoppingCart className="h-4 w-4 mr-1" />
                            Add to Cart
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;
