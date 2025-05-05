
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { products, Product } from '../models/Product';

const ProductsPage: React.FC = () => {
  const [selectedVehicle, setSelectedVehicle] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Extract unique categories and vehicles for filters
  const categories = Array.from(new Set(products.map(product => product.category)));
  const vehicles = Array.from(
    new Set(products.flatMap(product => product.vehicleCompatibility))
  );

  // Group products by vehicle for filtering
  const productsByVehicle = new Map<string, Product[]>();
  
  vehicles.forEach(vehicle => {
    productsByVehicle.set(
      vehicle,
      products.filter(product => product.vehicleCompatibility.includes(vehicle))
    );
  });

  // Filter products based on selected filters and search term
  const filteredProducts = (() => {
    let result: Product[] = [...products];
    
    // If a vehicle is selected, only show one product per selected vehicle
    if (selectedVehicle) {
      const vehicleProducts = productsByVehicle.get(selectedVehicle) || [];
      result = vehicleProducts.length > 0 ? [vehicleProducts[0]] : [];
    }
    
    // Apply category filter if selected
    if (selectedCategory) {
      result = result.filter(product => product.category === selectedCategory);
    }
    
    // Apply search term if provided
    if (searchTerm) {
      result = result.filter(product => 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return result;
  })();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">All Products</h1>
      
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters */}
        <div className="lg:w-1/4">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Filters</h2>
            
            <div className="mb-6">
              <label className="block font-medium mb-2">Search</label>
              <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search products..."
                className="w-full border rounded-md px-3 py-2"
              />
            </div>
            
            <div className="mb-6">
              <label className="block font-medium mb-2">Vehicle</label>
              <select 
                value={selectedVehicle}
                onChange={(e) => setSelectedVehicle(e.target.value)}
                className="w-full border rounded-md px-3 py-2"
              >
                <option value="">All Vehicles</option>
                {vehicles.map((vehicle) => (
                  <option key={vehicle} value={vehicle}>
                    {vehicle}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block font-medium mb-2">Category</label>
              <select 
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full border rounded-md px-3 py-2"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            
            {(selectedVehicle || selectedCategory || searchTerm) && (
              <button
                onClick={() => {
                  setSelectedVehicle('');
                  setSelectedCategory('');
                  setSearchTerm('');
                }}
                className="mt-4 text-primary hover:text-primary-dark"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
        
        {/* Product Grid */}
        <div className="lg:w-3/4">
          {filteredProducts.length === 0 ? (
            <div className="bg-white p-8 rounded-lg shadow text-center">
              <p className="text-lg mb-4">No products found matching your criteria</p>
              <button 
                onClick={() => {
                  setSelectedVehicle('');
                  setSelectedCategory('');
                  setSearchTerm('');
                }}
                className="btn btn-primary"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
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
      </div>
    </div>
  );
};

export default ProductsPage;
