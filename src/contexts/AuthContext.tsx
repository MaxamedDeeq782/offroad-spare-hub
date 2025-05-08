
import React, { createContext, useState, useContext, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error: string | null }>;
  register: (email: string, password: string, name: string) => Promise<{ success: boolean; error: string | null }>;
  logout: () => Promise<void>;
  isLoading: boolean;
  adminSecretKeyAuth: (secretKey: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  login: async () => ({ success: false, error: 'Auth context not initialized' }),
  register: async () => ({ success: false, error: 'Auth context not initialized' }),
  logout: async () => {},
  isLoading: true,
  adminSecretKeyAuth: async () => false
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        console.log('Auth event:', event);
        setSession(newSession);
        setUser(newSession?.user ?? null);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error: string | null }> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Login error:', error.message);
        return { success: false, error: error.message };
      }

      return { success: true, error: null };
    } catch (err) {
      console.error('Unexpected login error:', err);
      return { success: false, error: 'An unexpected error occurred' };
    }
  };

  const register = async (email: string, password: string, name: string): Promise<{ success: boolean; error: string | null }> => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            isAdmin: email === 'admin@offroadspares.com', // Set admin for specific email
          },
        },
      });

      if (error) {
        console.error('Registration error:', error.message);
        return { success: false, error: error.message };
      }

      return { success: true, error: null };
    } catch (err) {
      console.error('Unexpected registration error:', err);
      return { success: false, error: 'An unexpected error occurred' };
    }
  };

  const logout = async (): Promise<void> => {
    await supabase.auth.signOut();
  };
  
  // Improved admin secret key auth that updates user metadata
  const adminSecretKeyAuth = async (secretKey: string): Promise<boolean> => {
    // Compare with the hardcoded secret key
    if (secretKey === 'maxamed782') {
      // If user is authenticated, update their metadata to set isAdmin flag
      if (user && session) {
        try {
          const { data, error } = await supabase.auth.updateUser({
            data: { isAdmin: true }
          });
          
          if (error) {
            console.error('Error updating user metadata:', error);
            return true; // Still return true to grant temporary access
          }
          
          // Update local user state with admin flag
          setUser(prev => {
            if (!prev) return prev;
            return {
              ...prev,
              user_metadata: { ...prev.user_metadata, isAdmin: true }
            };
          });
          
          console.log('User metadata updated with admin privileges');
        } catch (err) {
          console.error('Unexpected error updating user metadata:', err);
        }
      }
      return true;
    }
    return false;
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      session, 
      login, 
      register, 
      logout, 
      isLoading, 
      adminSecretKeyAuth
    }}>
      {children}
    </AuthContext.Provider>
  );
};
