
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

// Read orders from localStorage or use sample data if not available
const loadOrders = (): Order[] => {
  const storedOrders = localStorage.getItem('orders');
  if (storedOrders) {
    // Convert date strings back to Date objects
    return JSON.parse(storedOrders).map((order: any) => ({
      ...order,
      createdAt: new Date(order.createdAt),
      updatedAt: new Date(order.updatedAt)
    }));
  }
  
  // Default sample order data
  return [
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
};

// Initialize orders
export let orders: Order[] = loadOrders();

// Add a new order and save to localStorage
export const addOrder = (order: Order): void => {
  orders = [...orders, order];
  saveOrders();
};

// Save orders to localStorage
export const saveOrders = (): void => {
  localStorage.setItem('orders', JSON.stringify(orders));
};

// Update order status and save to localStorage
export const updateOrderStatus = (orderId: string, status: OrderStatus): void => {
  orders = orders.map(order => 
    order.id === orderId 
      ? { ...order, status, updatedAt: new Date() } 
      : order
  );
  saveOrders();
};
