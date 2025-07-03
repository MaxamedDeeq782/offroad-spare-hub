
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import AdminOrders from './AdminOrders';
import AdminUsers from './AdminUsers';
import AdminProducts from './AdminProducts';
import AddProductModal from './AddProductModal';

interface AdminTabsProps {
  activeTab: 'orders' | 'users' | 'products';
  onTabChange: (tab: 'orders' | 'users' | 'products') => void;
  showProducts?: boolean;
}

const AdminTabs: React.FC<AdminTabsProps> = ({ 
  activeTab, 
  onTabChange, 
  showProducts = true 
}) => {
  const [refreshKey, setRefreshKey] = React.useState(0);

  const handleProductAdded = () => {
    // Trigger a refresh of the products list
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="space-y-6">
      {/* Header with Add Product Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Admin Panel</h2>
        {showProducts && activeTab === 'products' && (
          <AddProductModal onProductAdded={handleProductAdded} />
        )}
      </div>

      <Tabs value={activeTab} onValueChange={(value) => onTabChange(value as 'orders' | 'users' | 'products')}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          {showProducts && <TabsTrigger value="products">Products</TabsTrigger>}
        </TabsList>

        <TabsContent value="orders" className="space-y-4">
          <AdminOrders />
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <AdminUsers />
        </TabsContent>

        {showProducts && (
          <TabsContent value="products" className="space-y-4">
            <AdminProducts key={refreshKey} />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default AdminTabs;
