
export interface User {
  id: string;
  email: string;
  password: string; // In a real app, this would be hashed
  name: string;
  isAdmin: boolean;
}

// Sample user data
export const users: User[] = [
  {
    id: "u1",
    email: "admin@offroadspares.com",
    password: "admin123", // This would be hashed in a real application
    name: "Admin User",
    isAdmin: true
  },
  {
    id: "u2",
    email: "john@example.com",
    password: "password123", // This would be hashed in a real application
    name: "John Smith",
    isAdmin: false
  }
];
