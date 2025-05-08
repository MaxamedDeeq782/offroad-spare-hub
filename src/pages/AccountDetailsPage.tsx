
import React, { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { User, LogOut, Moon, Sun, Package } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Order, OrderStatus, orders as allOrders } from '../models/Order';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';

const AccountDetailsPage: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [userOrders, setUserOrders] = useState<Order[]>([]);

  // Redirect if not logged in
  if (!user) {
    return <Navigate to="/login" />;
  }

  // Helper functions to access user data safely
  const getUserName = () => {
    return user.user_metadata?.name || user.email?.split('@')[0] || '';
  };

  const getUserInitial = () => {
    const name = user.user_metadata?.name || user.email || '';
    return name.charAt(0);
  };

  const isUserAdmin = () => {
    return user.user_metadata?.isAdmin === true;
  };

  useEffect(() => {
    if (user) {
      // Filter orders for current user
      const userId = user.id;
      const filteredOrders = allOrders.filter(order => order.userId === userId);
      setUserOrders(filteredOrders);
    }
  }, [user]);

  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleDateString();
  };

  const getStatusBadgeClass = (status: OrderStatus): string => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300 font-bold';
      case 'approved':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 font-bold';
      case 'canceled':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300 font-bold';
      case 'delivered':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 font-bold';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 font-bold';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-extrabold mb-8">My Account</h1>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
        <div className="flex items-center gap-6 mb-6">
          <Avatar className="h-20 w-20">
            <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-extrabold">
              {getUserInitial()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-2xl font-extrabold text-foreground">{getUserName()}</h2>
            <p className="text-lg font-bold">{user.email}</p>
            <div className="flex items-center mt-2">
              <span className="mr-2 font-bold">Theme:</span>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={toggleTheme}
                className="rounded-full"
              >
                {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>
        
        {isUserAdmin() && (
          <div className="mb-4">
            <Link to="/admin">
              <Button variant="outline" className="font-bold">Admin Dashboard</Button>
            </Link>
          </div>
        )}
      </div>
      
      <Tabs defaultValue="orders" className="w-full">
        <TabsList className="w-full justify-start mb-6">
          <TabsTrigger value="orders" className="flex items-center gap-2 text-lg font-bold">
            <Package className="h-5 w-5" />
            Orders
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2 text-lg font-bold">
            <User className="h-5 w-5" />
            Account Settings
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="orders">
          {userOrders.length === 0 ? (
            <div className="text-center py-8 bg-white dark:bg-gray-800 rounded-lg shadow-md">
              <p className="font-bold text-lg mb-4">You haven't placed any orders yet</p>
              <Link to="/products">
                <Button className="font-bold">Shop Now</Button>
              </Link>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-extrabold text-base">Order ID</TableHead>
                    <TableHead className="font-extrabold text-base">Date</TableHead>
                    <TableHead className="font-extrabold text-base">Status</TableHead>
                    <TableHead className="font-extrabold text-base">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {userOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-bold">{order.id}</TableCell>
                      <TableCell className="font-bold">{formatDate(order.createdAt)}</TableCell>
                      <TableCell>
                        <span className={`inline-block px-2 py-1 rounded-full ${getStatusBadgeClass(order.status)}`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </TableCell>
                      <TableCell className="font-bold">${order.total.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="settings">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="space-y-6">
              <div className="grid gap-2">
                <h3 className="font-extrabold text-lg">Email</h3>
                <p className="font-bold text-base">{user.email}</p>
              </div>
              
              <div className="grid gap-2">
                <h3 className="font-extrabold text-lg">Account Type</h3>
                <p className="font-bold text-base">{isUserAdmin() ? 'Administrator' : 'Customer'}</p>
              </div>
              
              <div className="pt-4">
                <Button 
                  variant="destructive" 
                  className="w-full font-bold"
                  onClick={logout}
                >
                  <LogOut className="h-5 w-5 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
      
    </div>
  );
};

export default AccountDetailsPage;
