
import React, { useState, useEffect } from 'react';
import { Order, fetchOrders } from '../../models/Order';
import OrderItem from './OrderItem';
import { Loader2, CreditCard } from 'lucide-react';

const AdminOrders: React.FC = () => {
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [filter, setFilter] = useState<'all' | 'paypal' | 'manual'>('all');

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

  // Filter orders based on source
  const filteredOrders = allOrders.filter(order => {
    if (filter === 'paypal') {
      return !!(order.paypalOrderId || order.paypalPaymentId);
    }
    if (filter === 'manual') {
      return !(order.paypalOrderId || order.paypalPaymentId);
    }
    return true; // 'all'
  });

  const paypalOrdersCount = allOrders.filter(order => 
    !!(order.paypalOrderId || order.paypalPaymentId)
  ).length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Manage Orders</h2>
        
        {/* Filter buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              filter === 'all' 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            All Orders ({allOrders.length})
          </button>
          <button
            onClick={() => setFilter('paypal')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1 ${
              filter === 'paypal' 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            <CreditCard className="h-4 w-4" />
            PayPal Orders ({paypalOrdersCount})
          </button>
          <button
            onClick={() => setFilter('manual')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              filter === 'manual' 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            Manual Orders ({allOrders.length - paypalOrdersCount})
          </button>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="ml-2 text-lg">Loading orders...</span>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow text-center dark:bg-gray-800">
          <p className="text-xl mb-6">
            {filter === 'paypal' ? 'No PayPal orders found' : 
             filter === 'manual' ? 'No manual orders found' : 
             'No orders found'}
          </p>
          {filter === 'paypal' && (
            <p className="text-sm text-muted-foreground">
              Orders will appear here automatically when customers complete payments through PayPal.
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {filteredOrders.map((order) => (
            <OrderItem 
              key={order.id} 
              order={order} 
              onStatusUpdate={handleOrderUpdate}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
