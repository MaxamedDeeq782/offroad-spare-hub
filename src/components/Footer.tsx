
import React from 'react';
import { Phone, Mail } from 'lucide-react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

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
        </div>
      </div>
    </footer>
  );
};

export default Footer;
