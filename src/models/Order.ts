
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

// Sample order data
export const orders: Order[] = [
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
