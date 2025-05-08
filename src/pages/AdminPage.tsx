
import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AdminAuth from '../components/admin/AdminAuth';
import AdminTabs from '../components/admin/AdminTabs';

const AdminPage: React.FC = () => {
  const { adminSecretKeyAuth, user } = useAuth();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<'orders' | 'products' | 'users'>('products');

  // Check if user is admin
  useEffect(() => {
    if (user?.user_metadata?.isAdmin) {
      setIsAuthenticated(true);
    }
  }, [user]);

  if (!isAuthenticated) {
    return (
      <AdminAuth 
        adminSecretKeyAuth={adminSecretKeyAuth} 
        onSuccessfulAuth={() => setIsAuthenticated(true)}
      />
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      <AdminTabs activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default AdminPage;
