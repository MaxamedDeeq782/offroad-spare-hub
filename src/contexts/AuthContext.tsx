
import React, { createContext, useState, useContext, useEffect } from 'react';
import { User, users } from '../models/User';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: async () => false,
  register: async () => false,
  logout: () => {},
  isLoading: true
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for stored user on component mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // In a real app, this would make an API call
    const foundUser = users.find(u => u.email === email && u.password === password);
    
    if (foundUser) {
      // Create a copy of the user object without exposing the password in state
      const { password: _, ...userWithoutPassword } = foundUser;
      
      // Set the user in state
      setUser(foundUser);
      
      // Store user in localStorage, but without the password
      localStorage.setItem('user', JSON.stringify(foundUser));
      return true;
    }
    
    return false;
  };

  const register = async (email: string, password: string, name: string): Promise<boolean> => {
    // Check if user already exists
    const userExists = users.some(u => u.email === email);
    
    if (userExists) {
      return false;
    }
    
    // In a real app, this would make an API call to create user
    const newUser: User = {
      id: `u${users.length + 1}`,
      email,
      password, // In real app, this would be hashed
      name,
      isAdmin: false
    };
    
    users.push(newUser);
    
    // Create a copy of the user object without exposing the password in state
    const { password: _, ...userWithoutPassword } = newUser;
    
    // Login the new user
    setUser(newUser);
    localStorage.setItem('user', JSON.stringify(newUser));
    
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
