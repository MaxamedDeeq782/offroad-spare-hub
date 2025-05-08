
import React, { useState } from 'react';
import { Order, OrderStatus, updateOrderStatus } from '../../models/Order';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { toast } from 'sonner';

interface OrderItemProps {
  order: Order;
  onStatusUpdate: (orderId: string, newStatus: OrderStatus) => void;
}

const OrderItem: React.FC<OrderItemProps> = ({ order, onStatusUpdate }) => {
  const [isUpdating, setIsUpdating] = useState(false);
  
  const handleStatusChange = async (newStatus: OrderStatus) => {
    setIsUpdating(true);
    try {
      const success = await updateOrderStatus(order.id, newStatus);
      if (success) {
        onStatusUpdate(order.id, newStatus);
        toast.success(`Order status updated to ${newStatus}`);
      } else {
        toast.error('Failed to update order status');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsUpdating(false);
    }
  };
  
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    }).format(date);
  };
  
  const getStatusColor = (status: OrderStatus): string => {
    switch (status) {
      case 'approved':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'shipped':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'delivered':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'canceled':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
    }
  };
  
  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex flex-wrap justify-between items-start gap-2">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-medium">Order #{order.id.substring(0, 8)}</h3>
              <span className={`px-2 py-0.5 text-xs rounded-full ${getStatusColor(order.status)}`}>
                {order.status.toUpperCase()}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Placed by: {order.userId}
            </p>
            <p className="text-sm text-muted-foreground">
              Date: {formatDate(order.createdAt)}
            </p>
            <p className="font-medium mt-1">Total: ${order.total.toFixed(2)}</p>
          </div>
          
          {!isUpdating && (
            <div className="flex flex-wrap gap-2">
              {order.status === 'pending' && (
                <>
                  <Button 
                    size="sm" 
                    onClick={() => handleStatusChange('approved')}
                  >
                    Approve
                  </Button>
                  <Button 
                    size="sm" 
                    variant="destructive"
                    onClick={() => handleStatusChange('canceled')}
                  >
                    Cancel
                  </Button>
                </>
              )}
              
              {order.status === 'approved' && (
                <Button 
                  size="sm" 
                  onClick={() => handleStatusChange('shipped')}
                >
                  Mark Shipped
                </Button>
              )}
              
              {order.status === 'shipped' && (
                <Button 
                  size="sm" 
                  onClick={() => handleStatusChange('delivered')}
                >
                  Mark Delivered
                </Button>
              )}
            </div>
          )}
          
          {isUpdating && (
            <div className="flex items-center">
              <p className="text-sm">Updating...</p>
            </div>
          )}
        </div>
        
        <div className="mt-4 border-t pt-4">
          <h4 className="text-sm font-medium mb-2">Order Items:</h4>
          <ul className="space-y-2">
            {order.items && order.items.map((item, index) => (
              <li key={item.id || index} className="text-sm flex justify-between">
                <span>{item.productId} x{item.quantity}</span>
                <span>${(item.price * item.quantity).toFixed(2)}</span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default OrderItem;
