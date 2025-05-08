
import React, { useState, useEffect } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AdminAuth from '../components/admin/AdminAuth';
import AdminTabs from '../components/admin/AdminTabs';
import { Button } from '../components/ui/button';
import { Plus } from 'lucide-react';

const AdminPage: React.FC = () => {
  const { adminSecretKeyAuth, user } = useAuth();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<'orders' | 'users'>('orders');

  // Check if user is admin
  useEffect(() => {
    if (user?.user_metadata?.isAdmin) {
      setIsAuthenticated(true);
    }
  }, [user]);

  const handleAdminAuth = async (secretKey: string) => {
    const isValid = await adminSecretKeyAuth(secretKey);
    if (isValid) {
      setIsAuthenticated(true);
    }
    return isValid;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {!isAuthenticated ? (
        <AdminAuth 
          adminSecretKeyAuth={handleAdminAuth} 
          onSuccessfulAuth={() => setIsAuthenticated(true)}
        />
      ) : (
        <>
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <Link to="/admin/add-product">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add New Product
              </Button>
            </Link>
          </div>
          
          <AdminTabs 
            activeTab={activeTab} 
            onTabChange={setActiveTab}
            showProducts={false} // We don't show products tab, but we can conditionally render it if needed
          />
        </>
      )}
    </div>
  );
};

export default AdminPage;
