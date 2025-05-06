
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
  const [selectedPartId, setSelectedPartId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const { addToCart } = useCart();
  const [dbProducts, setDbProducts] = useState<DbProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  // Extract unique vehicles for filters
  const vehicles = Array.from(
    new Set(products.flatMap(product => product.vehicleCompatibility))
  );

  // Check if a vehicle and specific part was selected from the homepage
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const vehicleParam = queryParams.get('vehicle');
    const partIdParam = queryParams.get('partId');
    
    if (vehicleParam) {
      setSelectedVehicle(vehicleParam);
    }
    
    if (partIdParam) {
      setSelectedPartId(partIdParam);
      setSearchTerm(partIdParam); // Also set the search term to the part ID for filtering
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
  const productBelongsToVehicle = (product: Product, vehicle: string, partId: string): boolean => {
    // If a specific part ID is provided, check if the product name matches exactly
    if (partId && product.name !== partId) {
      return false;
    }
    
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

  // Filter products based on selected filters and search term or specific part
  const filteredProducts = products.filter(product => {
    // First, check if the product belongs to the selected vehicle and matches the part ID if specified
    if (!productBelongsToVehicle(product, selectedVehicle, selectedPartId)) {
      return false;
    }
    
    // If no specific part ID is selected but search term exists, filter by search term
    if (!selectedPartId && searchTerm && !product.name.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    return true;
  });

  // Map specific part IDs to their corresponding vehicles
  const getSpecificPartForVehicle = (vehicle: string): string => {
    const partMap: Record<string, string> = {
      'Toyota Hilux': 'Toyota Hilux Gearbox 5-Speed Manual',
      'Toyota Land Cruiser': 'Tie Rod End Kit for Toyota Land Cruiser FJ80 FzJ80 91-97 Lexus LX450',
      'Nissan Patrol': 'Fit Nissan Patrol Y62 & Armada 5.6L 8 Cyl AT 2010 - 2023 aluminum radiator',
      'Mitsubishi L200': 'Exhaust Pipe Kit Full System for MITSUBISHI L200 2.5L Diesel'
    };
    
    return partMap[vehicle] || '';
  };

  // Filter database products based on selected vehicle and specific part or search term
  const filteredDbProducts = dbProducts.filter(product => {
    const productVehicle = getVehicleFromProductName(product.name);
    
    // Check if the product belongs to the selected vehicle
    if (selectedVehicle && productVehicle !== selectedVehicle) {
      return false;
    }
    
    // If a specific part ID is selected, check if the product name matches exactly
    if (selectedPartId && product.name !== selectedPartId) {
      return false;
    }
    
    // If no specific part ID is selected but search term exists, filter by search term
    if (!selectedPartId && searchTerm && !product.name.toLowerCase().includes(searchTerm.toLowerCase())) {
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
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    // Clear selected part ID when search term is manually changed
                    if (selectedPartId && e.target.value !== selectedPartId) {
                      setSelectedPartId('');
                    }
                  }}
                  placeholder="Search products..."
                  className="w-full border rounded-md px-3 py-2 dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
              
              <div className="mb-6">
                <label className="block font-medium mb-2">Vehicle</label>
                <select 
                  value={selectedVehicle}
                  onChange={(e) => {
                    const newVehicle = e.target.value;
                    setSelectedVehicle(newVehicle);
                    
                    // If a vehicle is selected, automatically set the part ID for that vehicle
                    if (newVehicle) {
                      const specificPart = getSpecificPartForVehicle(newVehicle);
                      setSelectedPartId(specificPart);
                      setSearchTerm(specificPart);
                    } else {
                      setSelectedPartId('');
                      setSearchTerm('');
                    }
                  }}
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
              
              {(selectedVehicle || searchTerm || selectedPartId) && (
                <button
                  onClick={() => {
                    setSelectedVehicle('');
                    setSelectedPartId('');
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
                      setSelectedPartId('');
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
