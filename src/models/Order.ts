
import { supabase } from '../integrations/supabase/client';

export type OrderStatus = 'pending' | 'approved' | 'shipped' | 'delivered' | 'canceled';

export interface OrderItem {
  id?: string;
  orderId: string;
  productId: string;
  quantity: number;
  price: number;
}

export interface ShippingInfo {
  name?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  email?: string;
}

export interface Order {
  id: string;
  userId: string;
  total: number;
  status: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
  stripeSessionId?: string;
  items?: OrderItem[];
  shipping?: ShippingInfo;
  guestName?: string;
  guestEmail?: string;
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
  stripeSessionId?: string;
  shipping?: ShippingInfo;
}

// Add an order to the database
export const addOrder = async (orderInput: OrderInput): Promise<Order | null> => {
  try {
    console.log("Adding order to database:", orderInput);

    // Validate required fields
    if (!orderInput.userId || !orderInput.items || orderInput.items.length === 0) {
      console.error("Missing required order data");
      return null;
    }

    // Insert the order
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: orderInput.userId,
        total: orderInput.total,
        status: orderInput.status,
        stripe_session_id: orderInput.stripeSessionId,
        shipping_name: orderInput.shipping?.name,
        shipping_address: orderInput.shipping?.address,
        shipping_city: orderInput.shipping?.city,
        shipping_state: orderInput.shipping?.state,
        shipping_zip: orderInput.shipping?.zipCode,
        shipping_email: orderInput.shipping?.email
      })
      .select()
      .single();

    if (orderError || !orderData) {
      console.error('Error creating order:', orderError);
      return null;
    }

    console.log("Order created successfully:", orderData);
    const orderId = orderData.id;

    // Insert all order items
    const orderItemsToInsert = orderInput.items.map(item => ({
      order_id: orderId,
      product_id: item.productId,
      quantity: item.quantity,
      price: item.price,
    }));

    console.log("Inserting order items:", orderItemsToInsert);
    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItemsToInsert);

    if (itemsError) {
      console.error('Error creating order items:', itemsError);
      // Try to clean up the order if items insertion failed
      await supabase.from('orders').delete().eq('id', orderId);
      return null;
    }

    console.log("Order items created successfully");

    // Return the created order with all details
    return {
      id: orderId,
      userId: orderInput.userId,
      total: orderInput.total,
      status: orderInput.status,
      stripeSessionId: orderData.stripe_session_id,
      createdAt: new Date(orderData.created_at),
      updatedAt: new Date(orderData.updated_at),
      shipping: {
        name: orderData.shipping_name,
        address: orderData.shipping_address,
        city: orderData.shipping_city,
        state: orderData.shipping_state,
        zipCode: orderData.shipping_zip,
        email: orderData.shipping_email
      },
      guestName: orderData.guest_name,
      guestEmail: orderData.guest_email,
      items: orderInput.items.map((item, index) => ({
        id: `temp-${index}`, // Temporary ID for newly created items
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
            status: order.status as OrderStatus,
            createdAt: new Date(order.created_at),
            updatedAt: new Date(order.updated_at),
            stripeSessionId: order.stripe_session_id,
            shipping: {
              name: order.shipping_name,
              address: order.shipping_address,
              city: order.shipping_city,
              state: order.shipping_state,
              zipCode: order.shipping_zip,
              email: order.shipping_email
            },
            guestName: order.guest_name,
            guestEmail: order.guest_email,
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
          status: order.status as OrderStatus,
          createdAt: new Date(order.created_at),
          updatedAt: new Date(order.updated_at),
          stripeSessionId: order.stripe_session_id,
          shipping: {
            name: order.shipping_name,
            address: order.shipping_address,
            city: order.shipping_city,
            state: order.shipping_state,
            zipCode: order.shipping_zip,
            email: order.shipping_email
          },
          guestName: order.guest_name,
          guestEmail: order.guest_email,
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
