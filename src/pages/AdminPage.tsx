
import React from 'react';
import { Link } from 'react-router-dom';
import { useAdminAccess } from '../hooks/useAdminAccess';
import AccessDenied from '../components/admin/AccessDenied';
import AdminTabs from '../components/admin/AdminTabs';
import { Button } from '../components/ui/button';
import { Plus, Loader2 } from 'lucide-react';
import { useState } from 'react';

const AdminPage: React.FC = () => {
  const { hasAccess, isLoading, user } = useAdminAccess();
  const [activeTab, setActiveTab] = useState<'orders' | 'users'>('orders');

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!hasAccess) {
    return <AccessDenied isLoggedIn={!!user} />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
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
        showProducts={false}
      />
    </div>
  );
};

export default AdminPage;
