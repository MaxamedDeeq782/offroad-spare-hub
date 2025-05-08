
import React, { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Order, fetchOrders } from '../models/Order';
import { products } from '../models/Product';
import { Loader2 } from 'lucide-react';

const OrdersPage: React.FC = () => {
  const { user } = useAuth();
  const [userOrders, setUserOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Redirect if not logged in
  if (!user) {
    return <Navigate to="/login" />;
  }

  useEffect(() => {
    const loadOrders = async () => {
      setIsLoading(true);
      if (user) {
        const orders = await fetchOrders(user.id);
        setUserOrders(orders);
      }
      setIsLoading(false);
    };

    loadOrders();
  }, [user]); 

  // Function to get product details by ID
  const getProductName = (productId: string): string => {
    const product = products.find(p => p.id === productId);
    return product ? product.name : 'Unknown Product';
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Orders</h1>
        <Link to="/account" className="text-primary hover:text-primary-dark">
          Back to Account
        </Link>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="ml-2 text-lg">Loading orders...</span>
        </div>
      ) : userOrders.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow text-center dark:bg-gray-800">
          <p className="text-xl mb-6">You haven't placed any orders yet</p>
          <Link to="/products" className="btn btn-primary px-6 py-2">
            Shop Now
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {userOrders.map((order) => (
            <div key={order.id} className="bg-white rounded-lg shadow overflow-hidden dark:bg-gray-800">
              <div className="p-6 border-b dark:border-gray-700">
                <div className="flex flex-wrap justify-between items-center gap-4">
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Order ID</div>
                    <div className="font-medium">{order.id}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Date</div>
                    <div className="font-medium">{formatDate(order.createdAt)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Total Amount</div>
                    <div className="font-medium">${order.total.toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Status</div>
                    <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${getStatusBadgeClass(order.status)}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <h3 className="font-semibold text-lg mb-3">Order Items</h3>
                <div className="space-y-3">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <div className="flex items-center">
                        <div className="h-12 w-12 bg-gray-200 rounded mr-4 flex-shrink-0 dark:bg-gray-700">
                          {/* Replace with actual image once available */}
                          <div className="h-full w-full flex items-center justify-center text-xs">Item</div>
                        </div>
                        <div>
                          <div className="font-medium">{getProductName(item.productId)}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">Qty: {item.quantity}</div>
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
    </div>
  );
};

export default OrdersPage;
