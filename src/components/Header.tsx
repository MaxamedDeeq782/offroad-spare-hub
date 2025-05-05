
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const totalItems = cart.reduce((total, item) => total + item.quantity, 0);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold text-primary">
              <span style={{ color: 'var(--color-primary)' }}>Offroad</span>
              <span style={{ color: 'var(--color-secondary)' }}>SpareHub</span>
            </Link>
          </div>
          
          <div className="hidden md:flex space-x-6">
            <Link to="/" className="hover:text-primary">Home</Link>
          </div>

          <div className="flex items-center space-x-4">
            <Link to="/cart" className="relative">
              <span className="sr-only">Cart</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                  {totalItems}
                </span>
              )}
            </Link>

            {user ? (
              <button onClick={logout} className="btn btn-secondary py-1 px-3">
                Logout
              </button>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/login" className="btn btn-secondary py-1 px-3">Login</Link>
                <Link to="/register" className="btn btn-primary py-1 px-3">Register</Link>
              </div>
            )}

            <button onClick={toggleMobileMenu} className="md:hidden">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4">
            <Link to="/" className="block hover:text-primary py-2">Home</Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
