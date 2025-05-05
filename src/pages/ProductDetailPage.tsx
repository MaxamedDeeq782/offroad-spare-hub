
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { products, Product } from '../models/Product';
import { useCart } from '../contexts/CartContext';

const ProductDetailPage: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    // Simulate fetching product details
    setLoading(true);
    const foundProduct = products.find(p => p.id === productId);
    
    if (foundProduct) {
      setProduct(foundProduct);
    }
    
    setLoading(false);
  }, [productId]);

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity);
      // Show success message (in production, would use a toast notification)
      alert(`${product.name} added to cart!`);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="text-xl">Loading product details...</div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white p-8 rounded-lg shadow text-center">
          <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
          <p className="mb-6">The product you're looking for doesn't exist or has been removed.</p>
          <Link to="/products" className="btn btn-primary px-6 py-2">
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link to="/products" className="text-primary hover:text-primary-dark flex items-center">
          <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Products
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="md:flex">
          <div className="md:w-1/2">
            <div className="h-96 bg-gray-200 relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-medium">Product Image</span>
              </div>
            </div>
          </div>
          
          <div className="md:w-1/2 p-8">
            <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
            
            <div className="mb-4">
              <span className="text-2xl font-bold text-primary">${product.price.toFixed(2)}</span>
              <span className={`ml-4 px-3 py-1 text-xs font-semibold rounded-full ${product.stock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
              </span>
            </div>
            
            <div className="mb-6">
              <h2 className="font-semibold mb-2">Description</h2>
              <p className="text-gray-700">{product.description}</p>
            </div>
            
            <div className="mb-6">
              <h2 className="font-semibold mb-2">Compatible Vehicles</h2>
              <div className="flex flex-wrap gap-2">
                {product.vehicleCompatibility.map((vehicle) => (
                  <span key={vehicle} className="bg-gray-100 px-3 py-1 rounded-full text-sm">
                    {vehicle}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="mb-6">
              <h2 className="font-semibold mb-2">Quantity</h2>
              <div className="flex items-center">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded-l"
                  aria-label="Decrease quantity"
                >
                  -
                </button>
                <span className="px-6 py-1 border-t border-b">{quantity}</span>
                <button 
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded-r"
                  aria-label="Increase quantity"
                  disabled={quantity >= product.stock}
                >
                  +
                </button>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-4">
              <button 
                onClick={handleAddToCart}
                className="btn btn-primary py-3 px-8"
                disabled={product.stock <= 0}
              >
                Add to Cart
              </button>
              
              <button 
                onClick={() => {
                  handleAddToCart();
                  navigate('/cart');
                }}
                className="btn btn-secondary py-3 px-8"
                disabled={product.stock <= 0}
              >
                Buy Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
