
import { supabase } from '../integrations/supabase/client';

export type OrderStatus = 'pending' | 'approved' | 'shipped' | 'delivered' | 'canceled';

export interface OrderItem {
  id?: string;
  orderId: string;
  productId: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  userId: string; // This is now always required and can't be blank
  total: number;
  status: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
  items?: OrderItem[];
}

export interface OrderInput {
  userId: string;
  items: {
    productId: string;
    quantity: number;
    price: number;
  }[];
  total: number;
  status: OrderStatus;
}

// Add an order to the database
export const addOrder = async (orderInput: OrderInput): Promise<Order | null> => {
  try {
    // Insert the order
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: orderInput.userId,
        total: orderInput.total,
        status: orderInput.status,
      })
      .select()
      .single();

    if (orderError || !orderData) {
      console.error('Error creating order:', orderError);
      return null;
    }

    const orderId = orderData.id;

    // Insert all order items
    const orderItemsToInsert = orderInput.items.map(item => ({
      order_id: orderId,
      product_id: item.productId,
      quantity: item.quantity,
      price: item.price,
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItemsToInsert);

    if (itemsError) {
      console.error('Error creating order items:', itemsError);
      return null;
    }

    // Return the created order
    return {
      id: orderId,
      userId: orderInput.userId,
      total: orderInput.total,
      status: orderInput.status,
      createdAt: new Date(orderData.created_at),
      updatedAt: new Date(orderData.updated_at),
      items: orderInput.items.map((item, index) => ({
        id: index.toString(), // Temporary ID for newly created items
        orderId: orderId,
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
      })),
    };
  } catch (error) {
    console.error('Unexpected error creating order:', error);
    return null;
  }
};

// Fetch all orders
export const fetchOrders = async (userId?: string): Promise<Order[]> => {
  try {
    let query = supabase.from('orders').select('*');
    
    if (userId) {
      query = query.eq('user_id', userId);
    }
    
    const { data: ordersData, error: ordersError } = await query.order('created_at', { ascending: false });
    
    if (ordersError) {
      console.error('Error fetching orders:', ordersError);
      return [];
    }
    
    const orders: Order[] = await Promise.all(
      ordersData.map(async (order) => {
        const { data: itemsData, error: itemsError } = await supabase
          .from('order_items')
          .select('*')
          .eq('order_id', order.id);
        
        if (itemsError) {
          console.error(`Error fetching items for order ${order.id}:`, itemsError);
          return {
            id: order.id,
            userId: order.user_id,
            total: order.total,
            status: order.status,
            createdAt: new Date(order.created_at),
            updatedAt: new Date(order.updated_at),
            items: [],
          };
        }
        
        const items: OrderItem[] = itemsData.map((item) => ({
          id: item.id,
          orderId: item.order_id,
          productId: item.product_id,
          quantity: item.quantity,
          price: item.price,
        }));
        
        return {
          id: order.id,
          userId: order.user_id,
          total: order.total,
          status: order.status,
          createdAt: new Date(order.created_at),
          updatedAt: new Date(order.updated_at),
          items,
        };
      })
    );
    
    return orders;
  } catch (error) {
    console.error('Unexpected error fetching orders:', error);
    return [];
  }
};

// Update an order's status
export const updateOrderStatus = async (orderId: string, status: OrderStatus): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId);
    
    if (error) {
      console.error('Error updating order status:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Unexpected error updating order status:', error);
    return false;
  }
};
