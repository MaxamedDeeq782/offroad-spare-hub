
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
  paypalOrderId?: string;
  paypalPaymentId?: string;
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
  paypalOrderId?: string;
  paypalPaymentId?: string;
  shipping?: ShippingInfo;
}

// Add an order to the database
export const addOrder = async (orderInput: OrderInput): Promise<Order | null> => {
  try {
    console.log("=== STARTING ORDER CREATION ===");
    console.log("Order input:", orderInput);

    // Check authentication first
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.error('Authentication error:', authError);
      throw new Error(`Authentication failed: ${authError.message}`);
    }
    
    if (!user) {
      console.error('No authenticated user found');
      throw new Error('You must be logged in to create an order');
    }

    console.log("✓ User authenticated:", user.id);

    // Validate required fields
    if (!orderInput.userId || !orderInput.items || orderInput.items.length === 0) {
      console.error("Missing required order data:", { 
        userId: !!orderInput.userId, 
        itemsLength: orderInput.items?.length || 0 
      });
      throw new Error('Missing required order information');
    }

    // Ensure the order is for the authenticated user
    if (orderInput.userId !== user.id) {
      console.error('User ID mismatch:', { inputUserId: orderInput.userId, authUserId: user.id });
      throw new Error('Invalid user ID for order creation');
    }

    console.log("✓ Validation passed");

    // Prepare order data for insertion
    const orderData = {
      user_id: orderInput.userId,
      total: orderInput.total,
      status: orderInput.status,
      paypal_order_id: orderInput.paypalOrderId,
      paypal_payment_id: orderInput.paypalPaymentId,
      shipping_name: orderInput.shipping?.name,
      shipping_address: orderInput.shipping?.address,
      shipping_city: orderInput.shipping?.city,
      shipping_state: orderInput.shipping?.state,
      shipping_zip: orderInput.shipping?.zipCode,
      shipping_email: orderInput.shipping?.email
    };

    console.log("Inserting order with data:", orderData);

    // Insert the order
    const { data: orderData_result, error: orderError } = await supabase
      .from('orders')
      .insert(orderData)
      .select()
      .single();

    if (orderError) {
      console.error('=== ORDER INSERTION ERROR ===');
      console.error('Error details:', orderError);
      console.error('Error code:', orderError.code);
      console.error('Error message:', orderError.message);
      
      if (orderError.code === '42501') {
        throw new Error('Permission denied. You do not have permission to create orders.');
      } else if (orderError.code === '23505') {
        throw new Error('Order with this information already exists.');
      } else {
        throw new Error(`Failed to create order: ${orderError.message}`);
      }
    }

    if (!orderData_result) {
      console.error('No order data returned after insertion');
      throw new Error('Order creation failed - no data returned');
    }

    console.log("✓ Order created successfully:", orderData_result);
    const orderId = orderData_result.id;

    // Insert all order items
    const orderItemsToInsert = orderInput.items.map(item => ({
      order_id: orderId,
      product_id: item.productId,
      quantity: item.quantity,
      price: item.price,
    }));

    console.log("Inserting order items:", orderItemsToInsert);
    
    const { data: itemsData, error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItemsToInsert)
      .select();

    if (itemsError) {
      console.error('=== ORDER ITEMS INSERTION ERROR ===');
      console.error('Error details:', itemsError);
      
      // Try to clean up the order if items insertion failed
      console.log("Cleaning up order due to items insertion failure...");
      await supabase.from('orders').delete().eq('id', orderId);
      
      throw new Error(`Failed to create order items: ${itemsError.message}`);
    }

    console.log("✓ Order items created successfully:", itemsData);

    // Return the created order with all details
    const createdOrder: Order = {
      id: orderId,
      userId: orderInput.userId,
      total: orderInput.total,
      status: orderInput.status,
      paypalOrderId: orderData_result.paypal_order_id,
      paypalPaymentId: orderData_result.paypal_payment_id,
      createdAt: new Date(orderData_result.created_at),
      updatedAt: new Date(orderData_result.updated_at),
      shipping: {
        name: orderData_result.shipping_name,
        address: orderData_result.shipping_address,
        city: orderData_result.shipping_city,
        state: orderData_result.shipping_state,
        zipCode: orderData_result.shipping_zip,
        email: orderData_result.shipping_email
      },
      guestName: orderData_result.guest_name,
      guestEmail: orderData_result.guest_email,
      items: orderInput.items.map((item, index) => ({
        id: itemsData[index]?.id || `temp-${index}`,
        orderId: orderId,
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
      })),
    };

    console.log("=== ORDER CREATION COMPLETED SUCCESSFULLY ===");
    console.log("Final order:", createdOrder);
    
    return createdOrder;
  } catch (error) {
    console.error('=== UNEXPECTED ERROR IN ORDER CREATION ===');
    console.error('Error type:', typeof error);
    console.error('Error details:', error);
    
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      throw error; // Re-throw the error with the original message
    } else {
      throw new Error('An unexpected error occurred while creating the order');
    }
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
            paypalOrderId: order.paypal_order_id,
            paypalPaymentId: order.paypal_payment_id,
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
          paypalOrderId: order.paypal_order_id,
          paypalPaymentId: order.paypal_payment_id,
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
