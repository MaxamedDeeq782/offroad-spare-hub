
import React from 'react';
import { Link } from 'react-router-dom';
import { products } from '../models/Product';

const HomePage: React.FC = () => {
  // Get featured products
  const featuredProducts = products.filter(product => product.featured);
  
  // Available vehicle makes
  const vehicles = [
    {
      name: 'Toyota Hilux',
      slug: 'toyota-hilux',
      image: '/images/toyota-hilux.jpg'
    },
    {
      name: 'Toyota Land Cruiser',
      slug: 'toyota-land-cruiser',
      image: '/images/toyota-land-cruiser.jpg'
    },
    {
      name: 'Nissan Patrol',
      slug: 'nissan-patrol',
      image: '/images/nissan-patrol.jpg'
    },
    {
      name: 'Mitsubishi L200',
      slug: 'mitsubishi-l200',
      image: '/images/mitsubishi-l200.jpg'
    }
  ];

  return (
    <div>
      {/* Hero Section */}
      <div className="relative bg-gray-900 text-white py-24">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Quality Parts for Your Off-Road Adventure</h1>
            <p className="text-xl mb-8">Find genuine spare parts for Toyota Hilux, Land Cruiser, Nissan Patrol, and Mitsubishi L200</p>
            <Link to="/products" className="btn btn-primary px-8 py-3 text-lg">Shop Now</Link>
          </div>
        </div>
        <div className="absolute inset-0 bg-black opacity-50"></div>
      </div>

      {/* Vehicle Categories */}
      <div className="py-16 bg-gray-100">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center">Shop by Vehicle</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {vehicles.map((vehicle) => (
              <Link 
                key={vehicle.slug} 
                to={`/vehicle/${vehicle.slug}`}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
              >
                <div className="h-48 bg-gray-200 relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xl font-bold">{vehicle.name}</span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-2">{vehicle.name}</h3>
                  <p className="text-sm text-gray-600">Browse all {vehicle.name} parts</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Featured Products */}
      <div className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center">Featured Products</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
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
          
          <div className="mt-10 text-center">
            <Link to="/products" className="btn btn-secondary px-8 py-3">View All Products</Link>
          </div>
        </div>
      </div>

      {/* Why Choose Us */}
      <div className="py-16 bg-gray-100">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-center">Why Choose OffroadSpareHub</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-white rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4 shadow-md">
                <svg className="h-10 w-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Quality Guaranteed</h3>
              <p className="text-gray-600">All our parts are genuine or OEM quality, tested and verified to meet or exceed manufacturer standards.</p>
            </div>
            
            <div className="text-center">
              <div className="bg-white rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4 shadow-md">
                <svg className="h-10 w-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Fast Delivery</h3>
              <p className="text-gray-600">We know your vehicle needs to be back on the road ASAP. Enjoy fast delivery on all orders.</p>
            </div>
            
            <div className="text-center">
              <div className="bg-white rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4 shadow-md">
                <svg className="h-10 w-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Expert Support</h3>
              <p className="text-gray-600">Our team of off-road enthusiasts and mechanics are here to help you find the right parts.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
