
import React, { useState } from 'react';
import { Order, OrderStatus, updateOrderStatus } from '../../models/Order';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChevronDown, ChevronUp } from 'lucide-react';

interface OrderItemProps {
  order: Order;
  onStatusUpdate: (orderId: string, newStatus: OrderStatus) => void;
}

const OrderItem: React.FC<OrderItemProps> = ({ order, onStatusUpdate }) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  
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

  // Check if shipping information exists
  const hasShippingInfo = order.shipping && (
    order.shipping.name || 
    order.shipping.address || 
    order.shipping.city || 
    order.shipping.state || 
    order.shipping.zipCode || 
    order.shipping.email
  );
  
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
          
          <div className="flex flex-col gap-2">
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
            
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-1"
              onClick={() => setShowDetails(!showDetails)}
            >
              {showDetails ? (
                <>
                  <ChevronUp className="h-4 w-4" />
                  Hide Details
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4" />
                  Show Details
                </>
              )}
            </Button>
          </div>
          
          {isUpdating && (
            <div className="flex items-center">
              <p className="text-sm">Updating...</p>
            </div>
          )}
        </div>
        
        {showDetails && (
          <div className="mt-4 pt-4 border-t">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Order Items */}
              <div>
                <h4 className="text-sm font-medium mb-2">Order Items:</h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead className="text-right">Qty</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {order.items && order.items.map((item, index) => (
                      <TableRow key={item.id || index}>
                        <TableCell>{item.productId}</TableCell>
                        <TableCell className="text-right">{item.quantity}</TableCell>
                        <TableCell className="text-right">${(item.price * item.quantity).toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              {/* Shipping Information */}
              {hasShippingInfo && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Shipping Information:</h4>
                  <div className="bg-muted p-3 rounded-md space-y-1">
                    {order.shipping?.name && (
                      <p className="text-sm">Name: {order.shipping.name}</p>
                    )}
                    {order.shipping?.email && (
                      <p className="text-sm">Email: {order.shipping.email}</p>
                    )}
                    {order.shipping?.address && (
                      <p className="text-sm">Address: {order.shipping.address}</p>
                    )}
                    {(order.shipping?.city || order.shipping?.state || order.shipping?.zipCode) && (
                      <p className="text-sm">
                        {order.shipping.city}{order.shipping.city && order.shipping.state && ', '}
                        {order.shipping.state} {order.shipping.zipCode}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OrderItem;
