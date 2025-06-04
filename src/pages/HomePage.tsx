import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Image from '../components/Image';

const HomePage: React.FC = () => {
  const { user } = useAuth();

  // Check if the current user is the authorized admin
  const isAuthorizedAdmin = user?.email === 'moemoalin782@gmail.com';

  // Available vehicle makes with their specific part mappings
  const vehicles = [
    {
      name: 'Toyota Hilux',
      slug: 'toyota-hilux',
      image: '/images/toyota-hilux.jpg',
      partId: 'Toyota Hilux Gearbox 5-Speed Manual',
      hasLogo: false
    },
    {
      name: 'Toyota Land Cruiser',
      slug: 'toyota-land-cruiser',
      image: '/images/toyota-land-cruiser.jpg',
      partId: 'Tie Rod End Kit for Toyota Land Cruiser FJ80 FzJ80 91-97 Lexus LX450',
      hasLogo: true,
      logoSrc: '/lovable-uploads/c935c10d-07b7-4fc3-a1b8-a5b2d3fde696.png'
    },
    {
      name: 'Nissan Patrol',
      slug: 'nissan-patrol',
      image: '/images/nissan-patrol.jpg',
      partId: 'Fit Nissan Patrol Y62 & Armada 5.6L 8 Cyl AT 2010 - 2023 aluminum radiator',
      hasLogo: true,
      logoSrc: '/lovable-uploads/39ccdbeb-223b-4378-ae17-fba0d1d3e3f4.png'
    },
    {
      name: 'Mitsubishi L200',
      slug: 'mitsubishi-l200',
      image: '/images/mitsubishi-l200.jpg',
      partId: 'Exhaust Pipe Kit Full System for MITSUBISHI L200 2.5L Diesel',
      hasLogo: true,
      logoSrc: '/lovable-uploads/45f35bee-963c-4247-ab50-23fec1e661ff.png'
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
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-center">Shop by Vehicle</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {vehicles.map((vehicle) => (
              <Link 
                key={vehicle.slug} 
                to={`/products?vehicle=${encodeURIComponent(vehicle.name)}&partId=${encodeURIComponent(vehicle.partId)}`}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
              >
                <div className="h-48 bg-gray-200 relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    {vehicle.hasLogo && vehicle.logoSrc ? (
                      <Image 
                        src={vehicle.logoSrc} 
                        alt={`${vehicle.name} logo`}
                        className="max-w-full max-h-full object-contain p-4"
                      />
                    ) : (
                      <span className="text-xl font-bold">{vehicle.name}</span>
                    )}
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

      {/* Why Choose Us Section */}
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 018 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Expert Support</h3>
              <p className="text-gray-600">Our team of off-road enthusiasts and mechanics are here to help you find the right parts.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Button - Only show at bottom of home page for the specific admin user */}
      {isAuthorizedAdmin && (
        <div className="py-8 bg-white">
          <div className="container mx-auto px-4 text-center">
            <Link 
              to="/admin" 
              className="bg-red-600 text-white px-6 py-3 rounded-md inline-flex items-center shadow-md hover:bg-red-700 font-extrabold border-2 border-red-400"
            >
              <ShieldCheck size={20} className="mr-2" />
              <span className="uppercase">ADMIN DASHBOARD</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;
