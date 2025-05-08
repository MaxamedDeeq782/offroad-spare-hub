
import React from 'react';
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableHead, 
  TableRow, 
  TableCell 
} from './ui/table';
import { Button } from './ui/button';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import Image from './Image';

interface DbProduct {
  id: number;
  name: string;
  price: number;
  image_url: string;
  brand_id: number | null;
}

interface ProductTableProps {
  products: DbProduct[];
  loading: boolean;
  selectedVehicle: string;
  getVehicleFromProductName: (name: string) => string;
}

const ProductTable: React.FC<ProductTableProps> = ({ 
  products, 
  loading, 
  selectedVehicle,
  getVehicleFromProductName 
}) => {
  const { addToCart } = useCart();

  const handleAddToCart = (product: DbProduct) => {
    const mockModelProduct = {
      id: product.id.toString(),
      name: product.name,
      description: "Product from database",
      price: product.price,
      imageUrl: product.image_url || "/placeholder.svg",
      category: "Unknown",
      vehicleCompatibility: [getVehicleFromProductName(product.name)].filter(Boolean),
      stock: 10
    };
    
    addToCart(mockModelProduct, 1);
  };

  // Function to get the appropriate image URL for a product
  const getProductImage = (product: DbProduct): string => {
    // Check if the product is the Tie Rod End Kit for Toyota Land Cruiser
    if (product.name.includes("Tie Rod End Kit for Toyota Land Cruiser")) {
      return "/lovable-uploads/24d8adc5-ed35-48c1-8cc9-e09314fa4597.png";
    }
    
    // Return the default image URL or placeholder if not available
    return product.image_url || "/placeholder.svg";
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <p>Loading products...</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-8">
        <p>No products found for {selectedVehicle || "selected filters"}</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Image</TableHead>
          <TableHead>Product Name</TableHead>
          <TableHead className="text-right">Price</TableHead>
          <TableHead className="text-right">Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {products.map((product) => {
          const vehicleType = getVehicleFromProductName(product.name);
          return (
            <TableRow key={product.id}>
              <TableCell>
                <div className="w-24 h-24 md:w-32 md:h-32 relative">
                  <Image 
                    src={getProductImage(product)} 
                    alt={product.name}
                    className="object-contain w-full h-full rounded"
                  />
                </div>
              </TableCell>
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
                  onClick={() => handleAddToCart(product)} 
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
  );
};

export default ProductTable;
