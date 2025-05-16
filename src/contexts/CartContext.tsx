import React, { createContext, useState, useContext, useEffect } from 'react';
import { Product } from '../models/Product';
import { supabase } from '../integrations/supabase/client';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  imageUrl: string;
  quantity: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, quantity: number) => void;
  updateQuantity: (id: string, quantity: number) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  getCartTotal: () => number;
}

const CartContext = createContext<CartContextType>({
  cart: [],
  addToCart: () => {},
  updateQuantity: () => {},
  removeFromCart: () => {},
  clearCart: () => {},
  getCartTotal: () => 0
});

export const useCart = () => useContext(CartContext);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const { user } = useAuth();

  // Load cart from Supabase ONLY if user is logged in
  useEffect(() => {
    const fetchCart = async () => {
      try {
        // Clear the cart state when the user changes
        setCart([]);
        
        if (user) {
          // Fetch cart items for logged-in user
          const { data, error } = await supabase
            .from('cart_items')
            .select('*')
            .eq('user_id', user.id);
            
          if (error) {
            console.error('Error fetching cart:', error);
            return;
          }
          
          // Transform the data to match our CartItem structure
          const cartItems: CartItem[] = data.map(item => ({
            id: item.id,
            productId: item.product_id,
            name: item.name,
            price: item.price,
            imageUrl: item.image_url || '',
            quantity: item.quantity
          }));
          
          setCart(cartItems);
        }
      } catch (error) {
        console.error('Error loading cart:', error);
      }
    };

    fetchCart();
  }, [user]);

  const addToCart = async (product: Product, quantity: number) => {
    try {
      if (!user) {
        toast.error('Please log in to add items to your cart');
        return;
      }

      // Check if the item already exists in cart
      const existingItemIndex = cart.findIndex(item => item.productId === product.id);
      
      if (existingItemIndex >= 0) {
        // Update quantity of existing item
        const existingItem = cart[existingItemIndex];
        const newQuantity = existingItem.quantity + quantity;
        
        const { error } = await supabase
          .from('cart_items')
          .update({ quantity: newQuantity })
          .eq('id', existingItem.id);
          
        if (error) {
          console.error('Error updating cart item:', error);
          toast.error('Failed to update item in your cart');
          return;
        }
        
        // Update local state
        const updatedCart = [...cart];
        updatedCart[existingItemIndex] = {
          ...existingItem,
          quantity: newQuantity
        };
        setCart(updatedCart);
      } else {
        // Add new item
        const newItem = {
          id: uuidv4(),
          productId: product.id,
          name: product.name,
          price: product.price,
          imageUrl: product.imageUrl || '',
          quantity
        };
        
        const { error } = await supabase
          .from('cart_items')
          .insert({
            id: newItem.id,
            user_id: user.id,
            product_id: product.id,
            name: product.name,
            price: product.price,
            image_url: product.imageUrl || '',
            quantity
          });
          
        if (error) {
          console.error('Error adding to cart:', error);
          toast.error('Failed to add item to your cart');
          return;
        }
        
        // Update local state
        setCart(prevCart => [...prevCart, newItem]);
      }
      
      toast.success(`Added ${product.name} to your cart`);
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add item to cart');
    }
  };

  const updateQuantity = async (id: string, quantity: number) => {
    try {
      if (!user) {
        toast.error('Please log in to update your cart');
        return;
      }

      if (quantity <= 0) {
        await removeFromCart(id);
        return;
      }

      // Update in Supabase
      const { error } = await supabase
        .from('cart_items')
        .update({ quantity })
        .eq('id', id);
        
      if (error) {
        console.error('Error updating quantity:', error);
        toast.error('Failed to update quantity');
        return;
      }
      
      // Update local state
      setCart(prevCart => 
        prevCart.map(item => 
          item.id === id 
            ? { ...item, quantity } 
            : item
        )
      );
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast.error('Failed to update quantity');
    }
  };

  const removeFromCart = async (id: string) => {
    try {
      if (!user) {
        toast.error('Please log in to remove items from your cart');
        return;
      }

      // Remove from Supabase
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', id);
        
      if (error) {
        console.error('Error removing item:', error);
        toast.error('Failed to remove item from cart');
        return;
      }
      
      // Update local state
      setCart(prevCart => prevCart.filter(item => item.id !== id));
      toast.success('Item removed from cart');
    } catch (error) {
      console.error('Error removing item:', error);
      toast.error('Failed to remove item from cart');
    }
  };

  const clearCart = async () => {
    try {
      if (!user) {
        toast.error('Please log in to clear your cart');
        return;
      }

      // Clear all user's cart items from Supabase
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id);
        
      if (error) {
        console.error('Error clearing cart:', error);
        toast.error('Failed to clear your cart');
        return;
      }
      
      // Update local state
      setCart([]);
      toast.success('Cart cleared');
    } catch (error) {
      console.error('Error clearing cart:', error);
      toast.error('Failed to clear cart');
    }
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  return (
    <CartContext.Provider 
      value={{ 
        cart, 
        addToCart, 
        updateQuantity, 
        removeFromCart, 
        clearCart,
        getCartTotal 
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
