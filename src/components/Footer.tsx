
import React from 'react';
import { Phone, Mail, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Footer: React.FC = () => {
  const { user } = useAuth();
  const currentYear = new Date().getFullYear();
  
  // Helper to check if user is admin
  const isUserAdmin = () => {
    return user?.user_metadata?.isAdmin === true;
  };

  return (
    <footer className="bg-gray-800 text-white py-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-center">
          <h3 className="text-xl font-bold mb-4">OffroadSpareHub</h3>
          
          <div className="flex items-center space-x-2 mb-2">
            <Phone size={18} />
            <p className="text-gray-300">+123 456 7890</p>
          </div>
          
          <div className="flex items-center space-x-2 mb-4">
            <Mail size={18} />
            <p className="text-gray-300">info@offroadspares.com</p>
          </div>
          
          <div className="text-center text-gray-400 text-sm">
            <p>&copy; {currentYear} OffroadSpareHub. All rights reserved.</p>
          </div>
          
          {isUserAdmin() && (
            <div className="mt-4">
              <Link 
                to="/admin" 
                className="bg-red-600 text-white px-6 py-2 rounded-md flex items-center shadow-md hover:bg-red-700 font-extrabold border-2 border-red-400 animate-pulse"
              >
                <ShieldCheck size={20} className="mr-2" />
                <span className="uppercase">ADMIN DASHBOARD</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
