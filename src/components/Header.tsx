
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { User, LogOut, Sun, Moon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useTheme } from '../contexts/ThemeContext';
import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const totalItems = cart.reduce((total, item) => total + item.quantity, 0);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleLogout = async () => {
    await logout();
  };

  // Helper function to get user initial for avatar
  const getUserInitial = () => {
    if (!user) return '?';
    
    // Use user_metadata.name from Supabase user object if available
    if (user.user_metadata?.name) {
      return user.user_metadata.name.charAt(0);
    }
    
    return user.email?.charAt(0) || '?';
  };

  // Helper function to get user name
  const getUserName = () => {
    if (!user) return '';
    return user.user_metadata?.name || user.email?.split('@')[0] || '';
  };

  // Helper to check if user is admin
  const isUserAdmin = () => {
    return user?.user_metadata?.isAdmin === true;
  };

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md shadow-lg border-b border-border text-foreground transition-all duration-200">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Link to="/" className="text-2xl font-bold">
              <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">Offroad</span>
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">SpareHub</span>
            </Link>
          </div>
          
          <div className="hidden md:flex space-x-6">
            <Link to="/" className="hover:text-orange-600 font-bold transition-colors duration-200 relative after:content-[''] after:absolute after:w-full after:scale-x-0 after:h-0.5 after:bottom-0 after:left-0 after:bg-orange-600 after:origin-bottom-right after:transition-transform after:duration-300 hover:after:scale-x-100 hover:after:origin-bottom-left">
              Home
            </Link>
            <Link to="/products" className="hover:text-orange-600 font-bold transition-colors duration-200 relative after:content-[''] after:absolute after:w-full after:scale-x-0 after:h-0.5 after:bottom-0 after:left-0 after:bg-orange-600 after:origin-bottom-right after:transition-transform after:duration-300 hover:after:scale-x-100 hover:after:origin-bottom-left">
              Products
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {/* Theme Toggle Button */}
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleTheme}
              className="rounded-full hover:bg-accent transition-colors duration-200"
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? (
                <Moon className="h-5 w-5" />
              ) : (
                <Sun className="h-5 w-5" />
              )}
            </Button>

            <Link to="/cart" className="relative group">
              <span className="sr-only">Cart</span>
              <svg className="h-6 w-6 transition-colors duration-200 group-hover:text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold animate-pulse">
                  {totalItems}
                </span>
              )}
            </Link>

            {user ? (
              <div className="flex items-center space-x-2">
                <Link to="/account/details">
                  <Button variant="ghost" size="icon" className="relative rounded-full hover:bg-accent transition-colors duration-200">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-gradient-to-r from-orange-500 to-red-600 text-white font-extrabold">
                        {getUserInitial()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </Link>
                <Button variant="ghost" size="icon" onClick={handleLogout} title="Logout" className="hover:bg-accent transition-colors duration-200">
                  <LogOut className="h-5 w-5" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/login">
                  <Button variant="outline" size="sm" className="hover:bg-accent transition-colors duration-200">Login</Button>
                </Link>
                <Link to="/register">
                  <Button size="sm" className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 transition-all duration-200">Register</Button>
                </Link>
              </div>
            )}

            <button onClick={toggleMobileMenu} className="md:hidden p-2 hover:bg-accent rounded-lg transition-colors duration-200">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-border pt-4">
            <Link to="/" className="block hover:text-orange-600 py-2 font-bold transition-colors duration-200">Home</Link>
            <Link to="/products" className="block hover:text-orange-600 py-2 font-bold transition-colors duration-200">Products</Link>
            
            <div className="flex items-center py-2">  
              <Link to="/cart" className="relative block group">
                <span className="sr-only">Cart</span>
                <svg className="h-6 w-6 group-hover:text-orange-600 transition-colors duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                    {totalItems}
                  </span>
                )}
              </Link>
            </div>
            
            {!user && (
              <>
                <Link to="/login" className="block hover:text-orange-600 py-2 font-bold transition-colors duration-200">Login</Link>
                <Link to="/register" className="block hover:text-orange-600 py-2 font-bold transition-colors duration-200">Register</Link>
              </>
            )}
            {user && (
              <button onClick={handleLogout} className="block hover:text-orange-600 py-2 font-bold w-full text-left transition-colors duration-200">
                Logout
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
