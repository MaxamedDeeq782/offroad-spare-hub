
import { supabase } from '../integrations/supabase/client';
import { toast } from 'sonner';

export type OrderStatus = "pending" | "approved" | "canceled" | "delivered";

export interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
}

// Load sample data for development if database returns no orders
const sampleOrders: Order[] = [
  {
    id: "o1",
    userId: "u2",
    items: [
      { productId: "p1", quantity: 1, price: 29.99 },
      { productId: "p2", quantity: 2, price: 49.99 }
    ],
    total: 129.97,
    status: "approved",
    createdAt: new Date("2023-05-10"),
    updatedAt: new Date("2023-05-11")
  },
  {
    id: "o2",
    userId: "u2",
    items: [
      { productId: "p4", quantity: 1, price: 89.99 }
    ],
    total: 89.99,
    status: "pending",
    createdAt: new Date("2023-05-15"),
    updatedAt: new Date("2023-05-15")
  }
];

// In-memory cache for orders
let ordersCache: Order[] = [];

// Fetch orders from Supabase
export const fetchOrders = async (userId?: string): Promise<Order[]> => {
  try {
    let query = supabase.from('orders').select(`
      id,
      user_id,
      total,
      status,
      created_at,
      updated_at,
      order_items(product_id, quantity, price)
    `).order('created_at', { ascending: false });
    
    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching orders:', error);
      return sampleOrders; // Return sample data if there's an error
    }

    if (data && data.length > 0) {
      // Transform the Supabase data into our Order interface format
      const transformedOrders: Order[] = data.map(order => ({
        id: order.id,
        userId: order.user_id,
        items: order.order_items.map((item: any) => ({
          productId: item.product_id,
          quantity: item.quantity,
          price: parseFloat(item.price)
        })),
        total: parseFloat(order.total),
        status: order.status as OrderStatus,
        createdAt: new Date(order.created_at),
        updatedAt: new Date(order.updated_at)
      }));

      ordersCache = transformedOrders;
      return transformedOrders;
    }

    return sampleOrders; // Return sample data if no orders exist
  } catch (error) {
    console.error('Unexpected error fetching orders:', error);
    return sampleOrders; // Return sample data on error
  }
};

// Add a new order to Supabase
export const addOrder = async (order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<Order | null> => {
  try {
    // Insert the order
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: order.userId,
        total: order.total,
        status: order.status
      })
      .select()
      .single();

    if (orderError || !orderData) {
      console.error('Error creating order:', orderError);
      toast.error('Failed to create order');
      return null;
    }

    // Insert the order items
    const orderItems = order.items.map(item => ({
      order_id: orderData.id,
      product_id: item.productId,
      quantity: item.quantity,
      price: item.price
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      console.error('Error adding order items:', itemsError);
      toast.error('Failed to add items to order');
      return null;
    }

    // Create the complete order object
    const newOrder: Order = {
      id: orderData.id,
      userId: orderData.user_id,
      items: order.items,
      total: parseFloat(orderData.total),
      status: orderData.status as OrderStatus,
      createdAt: new Date(orderData.created_at),
      updatedAt: new Date(orderData.updated_at)
    };

    // Update cache
    ordersCache = [newOrder, ...ordersCache];
    
    return newOrder;
  } catch (error) {
    console.error('Unexpected error adding order:', error);
    toast.error('An unexpected error occurred');
    return null;
  }
};

// Update order status in Supabase
export const updateOrderStatus = async (orderId: string, status: OrderStatus): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('orders')
      .update({ 
        status, 
        updated_at: new Date().toISOString() 
      })
      .eq('id', orderId);

    if (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
      return false;
    }

    // Update cache
    ordersCache = ordersCache.map(order => 
      order.id === orderId 
        ? { ...order, status, updatedAt: new Date() } 
        : order
    );
    
    return true;
  } catch (error) {
    console.error('Unexpected error updating order status:', error);
    toast.error('An unexpected error occurred');
    return false;
  }
};
