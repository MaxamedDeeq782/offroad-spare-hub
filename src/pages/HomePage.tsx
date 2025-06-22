
import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Truck, Star, Shield, Clock, Users } from 'lucide-react';
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
      hasLogo: true,
      logoSrc: '/lovable-uploads/dfe2c4cb-d7d0-4fb0-80e8-d717a3ff30ab.png'
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
    <div className="min-h-screen">
      {/* Hero Section with Enhanced Gradient */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-white">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-orange-500 to-red-600 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-gradient-to-r from-green-500 to-teal-600 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-2000"></div>
        </div>
        
        <div className="container mx-auto px-4 py-16 md:py-32 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-7xl font-extrabold mb-4 md:mb-6 bg-gradient-to-r from-orange-400 via-red-500 to-orange-600 bg-clip-text text-transparent animate-fade-in">
              Premium Off-Road Parts
            </h1>
            <p className="text-lg md:text-2xl mb-4 md:mb-6 text-gray-300 leading-relaxed animate-fade-in delay-200">
              Discover genuine spare parts for your adventure vehicles
            </p>
            <p className="text-base md:text-xl mb-8 md:mb-10 text-gray-400 animate-fade-in delay-300">
              Soo hel qaybo dheeri ah oo sax ah Toyota Hilux, Land Cruiser, Nissan Patrol, iyo Mitsubishi L200
            </p>
          </div>
        </div>
        
        {/* Decorative bottom wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg className="w-full h-20 text-background" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M0,120L48,112C96,104,192,88,288,80C384,72,480,72,576,76C672,80,768,88,864,92C960,96,1056,96,1152,88C1248,80,1344,64,1392,56L1440,48L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z" fill="currentColor"></path>
          </svg>
        </div>
      </div>

      {/* Vehicle Categories with Enhanced Cards */}
      <div className="py-12 md:py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              Shop by Vehicle
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Find the perfect parts for your off-road machine
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {vehicles.map((vehicle, index) => (
              <Link 
                key={vehicle.slug} 
                to={`/products?vehicle=${encodeURIComponent(vehicle.name)}&partId=${encodeURIComponent(vehicle.partId)}`}
                className="group relative bg-card rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 overflow-hidden animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-red-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <div className="h-48 md:h-56 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 relative overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center p-4 md:p-6">
                    {vehicle.hasLogo && vehicle.logoSrc ? (
                      <Image 
                        src={vehicle.logoSrc} 
                        alt={`${vehicle.name} logo`}
                        className="max-w-full max-h-full object-contain filter group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <span className="text-xl md:text-2xl font-bold text-gray-600 dark:text-gray-300">{vehicle.name}</span>
                    )}
                  </div>
                  
                  {/* Decorative corner accent */}
                  <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-orange-500 to-red-600 opacity-80 transform rotate-45 translate-x-8 -translate-y-8"></div>
                </div>
                
                <div className="p-4 md:p-6">
                  <h3 className="font-bold text-lg md:text-xl mb-2 text-foreground group-hover:text-orange-600 transition-colors duration-300">
                    {vehicle.name}
                  </h3>
                  <p className="text-sm md:text-base text-muted-foreground">Browse all {vehicle.name} parts</p>
                  
                  {/* Arrow indicator */}
                  <div className="mt-3 md:mt-4 flex items-center text-orange-600 font-medium opacity-0 group-hover:opacity-100 transform translate-x-0 group-hover:translate-x-2 transition-all duration-300">
                    <span className="mr-2 text-sm md:text-base">Explore Parts</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Enhanced Why Choose Us Section */}
      <div className="py-12 md:py-20 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              Why Choose OffroadSpareHub
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
              We're committed to keeping your adventure going with premium parts and exceptional service
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {[
              {
                icon: Shield,
                title: "Quality Guaranteed",
                description: "All our parts are genuine or OEM quality, tested and verified to meet or exceed manufacturer standards.",
                gradient: "from-blue-500 to-blue-600"
              },
              {
                icon: Truck,
                title: "Fast Delivery",
                description: "We know your vehicle needs to be back on the road ASAP. Enjoy fast delivery on all orders.",
                gradient: "from-green-500 to-green-600"
              },
              {
                icon: Users,
                title: "Expert Support",
                description: "Our team of off-road enthusiasts and mechanics are here to help you find the right parts.",
                gradient: "from-purple-500 to-purple-600"
              }
            ].map((feature, index) => (
              <div 
                key={feature.title}
                className="group text-center animate-fade-in"
                style={{ animationDelay: `${index * 200}ms` }}
              >
                <div className={`bg-gradient-to-br ${feature.gradient} rounded-2xl w-16 md:w-20 h-16 md:h-20 flex items-center justify-center mx-auto mb-4 md:mb-6 shadow-lg group-hover:shadow-xl transform group-hover:scale-110 transition-all duration-300`}>
                  <feature.icon className="h-8 md:h-10 w-8 md:w-10 text-white" />
                </div>
                <h3 className="text-xl md:text-2xl font-bold mb-3 md:mb-4 text-foreground">{feature.title}</h3>
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed max-w-sm mx-auto">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-12 md:py-16 bg-gradient-to-r from-orange-600 to-red-600 text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 text-center">
            {[
              { number: "24/7", label: "Customer Support" },
              { number: "99%", label: "Satisfaction Rate" }
            ].map((stat, index) => (
              <div key={stat.label} className="animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                <div className="text-2xl md:text-5xl font-extrabold mb-1 md:mb-2">{stat.number}</div>
                <div className="text-sm md:text-lg font-medium opacity-90">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Admin Button - Enhanced styling */}
      {isAuthorizedAdmin && (
        <div className="py-8 md:py-12 bg-background">
          <div className="container mx-auto px-4 text-center">
            <Link 
              to="/admin" 
              className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-6 md:px-8 py-3 md:py-4 rounded-xl inline-flex items-center shadow-xl hover:shadow-2xl font-extrabold border-2 border-red-400 transform hover:scale-105 transition-all duration-300"
            >
              <ShieldCheck size={20} className="mr-2 md:mr-3" />
              <span className="uppercase tracking-wide text-sm md:text-base">ADMIN DASHBOARD</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;
