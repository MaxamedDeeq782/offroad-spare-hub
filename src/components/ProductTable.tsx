
import React, { useState, useMemo } from 'react';
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableHead, 
  TableRow, 
  TableCell 
} from './ui/table';
import { Button } from './ui/button';
import { ShoppingCart, Maximize2 } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import Image from './Image';
import { Dialog, DialogContent } from './ui/dialog';
import ProductTableSkeleton from './ProductTableSkeleton';

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
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  console.log('=== PRODUCT TABLE DEBUG ===');
  console.log('Products received in ProductTable:', products);
  console.log('Number of products:', products.length);
  console.log('Loading state:', loading);
  console.log('Selected vehicle:', selectedVehicle);
  
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

  // Memoized function to get the appropriate image URL for a product
  const getProductImage = useMemo(() => {
    return (product: DbProduct): string => {
      if (product.image_url) {
        return product.image_url;
      }
      
      if (product.name.includes("Tie Rod End Kit for Toyota Land Cruiser")) {
        return "/lovable-uploads/24d8adc5-ed35-48c1-8cc9-e09314fa4597.png";
      }
      
      if (product.name.includes("Toyota Hilux Gearbox 5-Speed Manual")) {
        return "/lovable-uploads/8141ace2-fd8d-4f8e-bace-f155332b298f.png";
      }
      
      if (product.name.includes("Fit Nissan Patrol Y62 & Armada 5.6L")) {
        return "/lovable-uploads/00d7891c-ee78-4e3a-a14c-e516197e30dd.png";
      }
      
      if (product.name.includes("Exhaust Pipe Kit") && product.name.includes("MITSUBISHI L200")) {
        return "/lovable-uploads/6bd92b92-92f2-45e4-99fa-75c2ee81ee77.png";
      }
      
      return "/placeholder.svg";
    };
  }, []);

  if (loading) {
    console.log('ProductTable: Showing loading skeleton');
    return <ProductTableSkeleton />;
  }

  if (products.length === 0) {
    console.log('ProductTable: No products to display');
    return (
      <div className="text-center py-8">
        <p>No products found for {selectedVehicle || "selected filters"}</p>
        <p className="text-sm text-gray-500 mt-2">
          Debug: Check console for data fetching details
        </p>
      </div>
    );
  }

  console.log('ProductTable: Rendering', products.length, 'products');

  return (
    <>
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
            const imageUrl = getProductImage(product);
            
            console.log(`Rendering product ${product.id}:`, product.name);
            
            return (
              <TableRow key={product.id}>
                <TableCell>
                  <div className="w-24 h-24 md:w-32 md:h-32 relative group">
                    <Image 
                      src={imageUrl} 
                      alt={product.name}
                      className="object-contain w-full h-full rounded cursor-pointer"
                      onClick={() => setSelectedImage(imageUrl)}
                    />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30 rounded">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-white"
                        onClick={() => setSelectedImage(imageUrl)}
                      >
                        <Maximize2 className="h-6 w-6" />
                      </Button>
                    </div>
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
      
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] p-1 flex items-center justify-center">
          {selectedImage && (
            <img 
              src={selectedImage} 
              alt="Product Image" 
              className="max-w-full max-h-[calc(90vh-2rem)] object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProductTable;
