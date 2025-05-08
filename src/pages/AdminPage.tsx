import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Order, orders, updateOrderStatus, OrderStatus } from '../models/Order';
import { products } from '../models/Product';
import { users } from '../models/User';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Alert, AlertDescription } from '../components/ui/alert';

const AdminPage: React.FC = () => {
  const { adminSecretKeyAuth } = useAuth();
  const [secretKey, setSecretKey] = useState('');
  const [error, setError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<'orders' | 'products' | 'users'>('orders');
  const [allOrders, setAllOrders] = useState<Order[]>(orders);

  // Refresh orders when component mounts
  useEffect(() => {
    setAllOrders(orders);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (adminSecretKeyAuth(secretKey)) {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Invalid secret key');
    }
  };

  // Function to get product details by ID
  const getProductName = (productId: string): string => {
    const product = products.find(p => p.id === productId);
    return product ? product.name : 'Unknown Product';
  };

  // Function to get user name by ID
  const getUserName = (userId: string): string => {
    const user = users.find(u => u.id === userId);
    return user ? user.name : 'Unknown User';
  };

  // Format date to readable string
  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleDateString();
  };

  // Status badge colors
  const getStatusBadgeClass = (status: string): string => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'canceled':
        return 'bg-red-100 text-red-800';
      case 'delivered':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Update order status
  const handleUpdateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    updateOrderStatus(orderId, newStatus);
    setAllOrders([...orders]); // Update local state with the updated orders array
  };

  // If not authenticated, show the secret key form
  if (!isAuthenticated) {
    return (
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Admin Access</CardTitle>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-1">
                <Input
                  type="password"
                  value={secretKey}
                  onChange={(e) => setSecretKey(e.target.value)}
                  placeholder="Enter secret key"
                  required
                />
              </div>
              
              <Button
                type="submit"
                className="w-full"
              >
                Access Admin Panel
              </Button>
            </CardContent>
          </form>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      
      <div className="mb-8 border-b">
        <nav className="flex space-x-8">
          <button 
            className={`pb-4 px-1 ${activeTab === 'orders' ? 'border-b-2 border-primary font-medium text-primary' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('orders')}
          >
            Orders
          </button>
          <button 
            className={`pb-4 px-1 ${activeTab === 'products' ? 'border-b-2 border-primary font-medium text-primary' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('products')}
          >
            Products
          </button>
          <button 
            className={`pb-4 px-1 ${activeTab === 'users' ? 'border-b-2 border-primary font-medium text-primary' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('users')}
          >
            Users
          </button>
        </nav>
      </div>
      
      {activeTab === 'orders' && (
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold mb-4">Manage Orders</h2>
          
          {allOrders.map((order) => (
            <div key={order.id} className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-6 border-b">
                <div className="flex flex-wrap justify-between items-center">
                  <div>
                    <div className="text-sm text-gray-500">Order ID</div>
                    <div className="font-medium">{order.id}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Customer</div>
                    <div className="font-medium">{getUserName(order.userId)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Date</div>
                    <div className="font-medium">{formatDate(order.createdAt)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Total Amount</div>
                    <div className="font-medium">${order.total.toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Status</div>
                    <select 
                      value={order.status}
                      onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value as OrderStatus)}
                      className="border rounded px-2 py-1 text-sm"
                    >
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="canceled">Canceled</option>
                      <option value="delivered">Delivered</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <h3 className="font-semibold text-lg mb-3">Order Items</h3>
                <div className="space-y-3">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <div className="flex items-center">
                        <div className="h-12 w-12 bg-gray-200 rounded mr-4 flex-shrink-0">
                          {/* Replace with actual image once available */}
                          <div className="h-full w-full flex items-center justify-center text-xs">Item</div>
                        </div>
                        <div>
                          <div className="font-medium">{getProductName(item.productId)}</div>
                          <div className="text-sm text-gray-500">Qty: {item.quantity}</div>
                        </div>
                      </div>
                      <div className="font-medium">${(item.price * item.quantity).toFixed(2)}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {activeTab === 'products' && (
        <div>
          <h2 className="text-2xl font-semibold mb-4">Manage Products</h2>
          <p className="text-gray-500">This feature would allow adding, editing, and removing products.</p>
          <div className="bg-white p-8 rounded-lg shadow mt-4">
            <p className="text-center">Product management functionality will be implemented in future updates.</p>
          </div>
        </div>
      )}
      
      {activeTab === 'users' && (
        <div>
          <h2 className="text-2xl font-semibold mb-4">Manage Users</h2>
          <p className="text-gray-500">This feature would allow managing user accounts.</p>
          <div className="bg-white p-8 rounded-lg shadow mt-4">
            <p className="text-center">User management functionality will be implemented in future updates.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
