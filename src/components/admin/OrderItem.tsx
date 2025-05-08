
import React from 'react';
import { Order, OrderStatus, updateOrderStatus } from '../../models/Order';
import { products } from '../../models/Product';
import { users } from '../../models/User';
import { toast } from 'sonner';

interface OrderItemProps {
  order: Order;
  onOrderUpdate: (orderId: string, newStatus: OrderStatus) => void;
}

const OrderItem: React.FC<OrderItemProps> = ({ order, onOrderUpdate }) => {
  // Function to get product details by ID
  const getProductName = (productId: string): string => {
    const product = products.find(p => p.id === productId);
    return product ? product.name : 'Unknown Product';
  };

  // Function to get customer name - handles both registered users and guests
  const getCustomerName = (order: Order): string => {
    if (order.guestName) {
      return `${order.guestName} (Guest)`;
    }
    const user = users.find(u => u.id === order.userId);
    return user ? user.name : order.userId.substring(0, 8) + '...';
  };

  // Format date to readable string
  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleDateString();
  };

  // Update order status
  const handleUpdateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    const success = await updateOrderStatus(orderId, newStatus);
    
    if (success) {
      toast.success(`Order status updated to ${newStatus}`);
      onOrderUpdate(orderId, newStatus);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden dark:bg-gray-800">
      <div className="p-6 border-b dark:border-gray-700">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Order ID</div>
            <div className="font-medium">{order.id}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Customer</div>
            <div className="font-medium">{getCustomerName(order)}</div>
            {order.guestEmail && (
              <div className="text-sm text-gray-500 dark:text-gray-400">{order.guestEmail}</div>
            )}
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
            <select 
              value={order.status}
              onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value as OrderStatus)}
              className="border rounded px-2 py-1 text-sm dark:bg-gray-700 dark:border-gray-600"
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
                <div className="h-12 w-12 bg-gray-200 rounded mr-4 flex-shrink-0 dark:bg-gray-700">
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
  );
};

export default OrderItem;
