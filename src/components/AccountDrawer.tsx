
import React from 'react';
import { Link } from 'react-router-dom';
import { User, LogOut, Moon, Sun, Package } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { 
  Drawer, 
  DrawerTrigger, 
  DrawerContent, 
  DrawerHeader, 
  DrawerTitle, 
  DrawerFooter, 
  DrawerClose 
} from './ui/drawer';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Order, OrderStatus } from '../models/Order';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';

interface AccountDrawerProps {
  userOrders: Order[];
}

const AccountDrawer: React.FC<AccountDrawerProps> = ({ userOrders }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  if (!user) return null;

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
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="ghost" size="icon" className="relative rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary text-primary-foreground font-extrabold">
              {user.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DrawerTrigger>
      <DrawerContent className="h-[85vh]">
        <DrawerHeader className="px-4">
          <DrawerTitle className="text-xl font-extrabold">My Account</DrawerTitle>
        </DrawerHeader>
        
        <div className="px-4 pb-2">
          <div className="flex items-center gap-4 mb-6">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="bg-primary text-primary-foreground text-xl font-extrabold">
                {user.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-extrabold text-lg text-foreground">
                {user.name}
              </h3>
              <p className="font-bold">
                {user.email}
              </p>
            </div>
          </div>
          
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center">
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
            
            {user.isAdmin && (
              <Link to="/admin">
                <Button variant="outline" size="sm" className="font-bold">Admin Dashboard</Button>
              </Link>
            )}
          </div>
        </div>
        
        <Tabs defaultValue="orders" className="w-full">
          <TabsList className="w-full justify-start px-4">
            <TabsTrigger value="orders" className="flex items-center gap-2 font-bold">
              <Package className="h-4 w-4" />
              Orders
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2 font-bold">
              <User className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="orders" className="px-4 overflow-auto max-h-[50vh]">
            {userOrders.length === 0 ? (
              <div className="text-center py-8">
                <p className="font-bold mb-4">You haven't placed any orders yet</p>
                <DrawerClose asChild>
                  <Link to="/products">
                    <Button className="font-bold">Shop Now</Button>
                  </Link>
                </DrawerClose>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-extrabold">Order ID</TableHead>
                    <TableHead className="font-extrabold">Date</TableHead>
                    <TableHead className="font-extrabold">Status</TableHead>
                    <TableHead className="font-extrabold">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {userOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-bold">{order.id}</TableCell>
                      <TableCell className="font-bold">{formatDate(order.createdAt)}</TableCell>
                      <TableCell>
                        <span className={`inline-block px-2 py-1 text-xs rounded-full ${getStatusBadgeClass(order.status)}`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </TableCell>
                      <TableCell className="font-bold">${order.total.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
            <div className="py-4">
              <DrawerClose asChild>
                <Link to="/orders">
                  <Button variant="outline" className="w-full font-bold">View All Orders</Button>
                </Link>
              </DrawerClose>
            </div>
          </TabsContent>
          
          <TabsContent value="settings" className="px-4">
            <div className="space-y-4">
              <div className="grid gap-1">
                <h3 className="font-extrabold">Email</h3>
                <p className="font-bold">{user.email}</p>
              </div>
              
              <div className="grid gap-1">
                <h3 className="font-extrabold">Account Type</h3>
                <p className="font-bold">{user.isAdmin ? 'Administrator' : 'Customer'}</p>
              </div>
              
              <div className="pt-4">
                <Button 
                  variant="destructive" 
                  className="w-full font-bold"
                  onClick={logout}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        <DrawerFooter>
          <DrawerClose asChild>
            <Button variant="outline" className="font-bold">Close</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default AccountDrawer;
