
import React from 'react';
import AdminOrders from './AdminOrders';
import AdminUsers from './AdminUsers';
import AdminProducts from './AdminProducts';

interface AdminTabsProps {
  activeTab: 'orders' | 'products' | 'users';
  onTabChange: (tab: 'orders' | 'products' | 'users') => void;
}

const AdminTabs: React.FC<AdminTabsProps> = ({ activeTab, onTabChange }) => {
  return (
    <div>
      <div className="mb-8 border-b">
        <nav className="flex space-x-8">
          <button 
            className={`pb-4 px-1 ${activeTab === 'orders' ? 'border-b-2 border-primary font-medium text-primary' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}
            onClick={() => onTabChange('orders')}
          >
            Orders
          </button>
          <button 
            className={`pb-4 px-1 ${activeTab === 'products' ? 'border-b-2 border-primary font-medium text-primary' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}
            onClick={() => onTabChange('products')}
          >
            Products
          </button>
          <button 
            className={`pb-4 px-1 ${activeTab === 'users' ? 'border-b-2 border-primary font-medium text-primary' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}
            onClick={() => onTabChange('users')}
          >
            Users
          </button>
        </nav>
      </div>
      
      {activeTab === 'orders' && <AdminOrders />}
      {activeTab === 'products' && <AdminProducts />}
      {activeTab === 'users' && <AdminUsers />}
    </div>
  );
};

export default AdminTabs;
