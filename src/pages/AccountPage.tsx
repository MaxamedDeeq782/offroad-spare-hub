
import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const AccountPage: React.FC = () => {
  const { user, logout } = useAuth();

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
            <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center text-xl font-bold mr-4">
              {user.name.charAt(0)}
            </div>
            <div>
              <h2 className="text-xl font-semibold">{user.name}</h2>
              <p className="text-gray-600">{user.email}</p>
            </div>
          </div>
          
          {user.isAdmin && (
            <Link to="/admin" className="block w-full btn btn-secondary py-2 mb-4">
              Admin Dashboard
            </Link>
          )}
          
          <button 
            onClick={logout}
            className="block w-full btn btn-primary py-2"
          >
            Logout
          </button>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">My Orders</h3>
          <p className="text-gray-600 mb-4">View and track your order history</p>
          <Link to="/orders" className="btn btn-primary block text-center py-2">
            View Orders
          </Link>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">My Addresses</h3>
          <p className="text-gray-600 mb-4">Manage your shipping addresses</p>
          <button className="btn btn-primary block w-full py-2">
            Manage Addresses
          </button>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Account Settings</h3>
          <p className="text-gray-600 mb-4">Update your account information</p>
          <button className="btn btn-primary block w-full py-2">
            Edit Settings
          </button>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Payment Methods</h3>
          <p className="text-gray-600 mb-4">Manage your payment options</p>
          <button className="btn btn-primary block w-full py-2">
            Manage Payments
          </button>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Help & Support</h3>
          <p className="text-gray-600 mb-4">Contact customer service</p>
          <Link to="/contact" className="btn btn-primary block text-center py-2">
            Contact Us
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AccountPage;
