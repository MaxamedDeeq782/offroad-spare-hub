
import React, { useState, useEffect } from 'react';
import { Order, fetchOrders } from '../../models/Order';
import OrderItem from './OrderItem';
import { Loader2 } from 'lucide-react';

const AdminOrders: React.FC = () => {
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setIsLoading(true);
    try {
      const orders = await fetchOrders();
      setAllOrders(orders);
    } catch (error) {
      console.error("Error loading orders:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOrderUpdate = (orderId: string, newStatus: Order['status']) => {
    setAllOrders(prev => 
      prev.map(order => 
        order.id === orderId 
          ? { ...order, status: newStatus, updatedAt: new Date() } 
          : order
      )
    );
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold mb-4">Manage Orders</h2>
      
      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="ml-2 text-lg">Loading orders...</span>
        </div>
      ) : allOrders.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow text-center dark:bg-gray-800">
          <p className="text-xl mb-6">No orders found</p>
        </div>
      ) : (
        <div className="space-y-6">
          {allOrders.map((order) => (
            <OrderItem 
              key={order.id} 
              order={order} 
              onOrderUpdate={handleOrderUpdate}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
