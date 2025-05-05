
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { products, Product } from '../models/Product';

const VehiclePage: React.FC = () => {
  const { vehicleSlug } = useParams<{ vehicleSlug: string }>();
  const [vehicleProducts, setVehicleProducts] = useState<Product[]>([]);

  // Convert slug to vehicle name
  const getVehicleName = (slug: string): string => {
    const nameMappings: Record<string, string> = {
      'toyota-hilux': 'Toyota Hilux',
      'toyota-land-cruiser': 'Toyota Land Cruiser',
      'nissan-patrol': 'Nissan Patrol',
      'mitsubishi-l200': 'Mitsubishi L200'
    };
    
    return nameMappings[slug] || slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  // Get vehicle products
  useEffect(() => {
    if (vehicleSlug) {
      const vehicleName = getVehicleName(vehicleSlug);
      const filtered = products.filter(product => 
        product.vehicleCompatibility.includes(vehicleName)
      );
      setVehicleProducts(filtered);
    }
  }, [vehicleSlug]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link to="/" className="text-primary hover:text-primary-dark flex items-center">
          <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Home
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-6">{getVehicleName(vehicleSlug || '')} Parts</h1>
      
      {vehicleProducts.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow text-center">
          <p className="text-xl mb-6">No parts found for this vehicle</p>
          <Link to="/products" className="btn btn-primary px-6 py-2">
            Browse All Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vehicleProducts.map((product) => (
            <div key={product.id} className="bg-white rounded-lg shadow overflow-hidden">
              <div className="h-48 bg-gray-200 relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-medium">Product Image</span>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                <p className="text-sm text-gray-600 mb-4">{product.description.substring(0, 100)}...</p>
                <div className="flex justify-between items-center">
                  <span className="text-xl font-bold">${product.price.toFixed(2)}</span>
                  <Link to={`/product/${product.id}`} className="btn btn-primary">View Details</Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VehiclePage;
