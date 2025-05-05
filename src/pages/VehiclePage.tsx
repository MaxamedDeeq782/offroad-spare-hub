
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { products, Product } from '../models/Product';

const VehiclePage: React.FC = () => {
  const { vehicleSlug } = useParams<{ vehicleSlug: string }>();
  const [vehicleProduct, setVehicleProduct] = useState<Product | null>(null);

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

  // Get a single vehicle product
  useEffect(() => {
    if (vehicleSlug) {
      const vehicleName = getVehicleName(vehicleSlug);
      const filtered = products.filter(product => 
        product.vehicleCompatibility.includes(vehicleName)
      );
      
      // Only get the first product for this vehicle
      if (filtered.length > 0) {
        setVehicleProduct(filtered[0]);
      } else {
        setVehicleProduct(null);
      }
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
      
      {!vehicleProduct ? (
        <div className="bg-white p-8 rounded-lg shadow text-center">
          <p className="text-xl mb-6">No parts found for this vehicle</p>
          <Link to="/products" className="btn btn-primary px-6 py-2">
            Browse All Products
          </Link>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="h-64 bg-gray-200 relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-medium">Product Image</span>
              </div>
            </div>
            <div className="p-6">
              <h3 className="font-semibold text-2xl mb-3">{vehicleProduct.name}</h3>
              <p className="text-gray-600 mb-4">{vehicleProduct.description}</p>
              <div className="flex justify-between items-center mt-6">
                <span className="text-2xl font-bold">${vehicleProduct.price.toFixed(2)}</span>
                <Link to={`/product/${vehicleProduct.id}`} className="btn btn-primary px-6 py-2">
                  View Details
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VehiclePage;
