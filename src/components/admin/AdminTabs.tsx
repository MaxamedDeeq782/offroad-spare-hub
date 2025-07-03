
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import AdminOrders from './AdminOrders';
import AdminUsers from './AdminUsers';
import AddProductModal from './AddProductModal';

interface AdminTabsProps {
  activeTab: 'orders' | 'users';
  onTabChange: (tab: 'orders' | 'users') => void;
  showProducts?: boolean;
}

const AdminTabs: React.FC<AdminTabsProps> = ({ 
  activeTab, 
  onTabChange, 
  showProducts = true 
}) => {
  const [refreshKey, setRefreshKey] = React.useState(0);

  const handleProductAdded = () => {
    // Trigger a refresh if needed in the future
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="space-y-6">
      {/* Header with Add Product Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Admin Panel</h2>
        {showProducts && (
          <AddProductModal onProductAdded={handleProductAdded} />
        )}
      </div>

      <Tabs value={activeTab} onValueChange={(value) => onTabChange(value as 'orders' | 'users')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="space-y-4">
          <AdminOrders />
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <AdminUsers />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminTabs;
