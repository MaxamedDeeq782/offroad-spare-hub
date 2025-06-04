
import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const AccountPage: React.FC = () => {
  const { user, logout, isAdmin } = useAuth();

  // Helper functions to access user data safely
  const getUserName = () => {
    return user?.user_metadata?.name || user?.email?.split('@')[0] || '';
  };

  const getUserInitial = () => {
    if (!user) return '';
    const name = user.user_metadata?.name || user.email || '';
    return name.charAt(0);
  };

  // Redirect if not logged in
  if (!user) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Account</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-6">
            <div className="h-16 w-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold mr-4">
              {getUserInitial()}
            </div>
            <div>
              <h2 className="text-xl font-extrabold">{getUserName()}</h2>
              <p className="text-gray-600 font-bold">{user.email}</p>
              {isAdmin && (
                <span className="inline-block bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full mt-1">
                  Administrator
                </span>
              )}
            </div>
          </div>
          
          <Link to="/account/details" className="block w-full btn btn-primary py-2 mb-4 font-bold text-center">
            Account Details
          </Link>
          
          {isAdmin && (
            <Link to="/admin" className="block w-full btn btn-secondary py-2 mb-4 font-bold text-center">
              Admin Dashboard
            </Link>
          )}
          
          <button 
            onClick={logout}
            className="block w-full btn btn-destructive py-2 font-bold"
          >
            Logout
          </button>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-extrabold mb-4">My Orders</h3>
          <p className="text-gray-600 mb-4 font-bold">View and track your order history</p>
          <Link to="/orders" className="btn btn-primary block text-center py-2 font-bold">
            View Orders
          </Link>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-extrabold mb-4">My Addresses</h3>
          <p className="text-gray-600 mb-4 font-bold">Manage your shipping addresses</p>
          <button className="btn btn-primary block w-full py-2 font-bold">
            Manage Addresses
          </button>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-extrabold mb-4">Account Settings</h3>
          <p className="text-gray-600 mb-4 font-bold">Update your account information</p>
          <Link to="/account/details" className="btn btn-primary block text-center py-2 font-bold">
            Edit Settings
          </Link>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-extrabold mb-4">Payment Methods</h3>
          <p className="text-gray-600 mb-4 font-bold">Manage your payment options</p>
          <button className="btn btn-primary block w-full py-2 font-bold">
            Manage Payments
          </button>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-extrabold mb-4">Help & Support</h3>
          <p className="text-gray-600 mb-4 font-bold">Contact customer service</p>
          <Link to="/contact" className="btn btn-primary block text-center py-2 font-bold">
            Contact Us
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AccountPage;
