
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
  adminSecretKeyAuth: (secretKey: string) => boolean;
  // Development mode functions
  devModeLogin: (isAdmin?: boolean) => void;
  isDevelopmentMode: boolean;
  setDevelopmentMode: (mode: boolean) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  login: async () => ({ success: false, error: 'Auth context not initialized' }),
  register: async () => ({ success: false, error: 'Auth context not initialized' }),
  logout: async () => {},
  isLoading: true,
  adminSecretKeyAuth: () => false,
  devModeLogin: () => {},
  isDevelopmentMode: false,
  setDevelopmentMode: () => {}
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDevelopmentMode, setDevelopmentMode] = useState(false);

  useEffect(() => {
    // Skip Supabase auth setup in development mode
    if (isDevelopmentMode) {
      setIsLoading(false);
      return;
    }
    
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
  }, [isDevelopmentMode]);

  const login = async (email: string, password: string): Promise<{ success: boolean; error: string | null }> => {
    // In dev mode, simulate success with any credentials
    if (isDevelopmentMode) {
      const isAdmin = email === 'admin@offroadspares.com';
      devModeLogin(isAdmin);
      return { success: true, error: null };
    }
    
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
    // In dev mode, simulate success with any credentials
    if (isDevelopmentMode) {
      const isAdmin = email === 'admin@offroadspares.com';
      devModeLogin(isAdmin);
      return { success: true, error: null };
    }
    
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
    if (isDevelopmentMode) {
      setUser(null);
      setSession(null);
      return;
    }
    
    await supabase.auth.signOut();
  };
  
  // Function for development mode login
  const devModeLogin = (isAdmin: boolean = false) => {
    const mockUser = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      email: isAdmin ? 'admin@offroadspares.com' : 'user@example.com',
      user_metadata: {
        name: isAdmin ? 'Admin User' : 'Test User',
        isAdmin: isAdmin
      }
    } as unknown as User;
    
    const mockSession = {
      user: mockUser,
      access_token: 'fake-token-for-development',
      refresh_token: 'fake-refresh-token',
      expires_at: Date.now() + 3600
    } as unknown as Session;
    
    setUser(mockUser);
    setSession(mockSession);
    console.log('Development mode login:', isAdmin ? 'admin' : 'regular user');
  };
  
  // Validate admin secret key
  const adminSecretKeyAuth = (secretKey: string): boolean => {
    // In dev mode, accept any non-empty key
    if (isDevelopmentMode) return secretKey.length > 0;
    
    // Compare with the hardcoded secret key
    return secretKey === 'maxamed782';
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      session, 
      login, 
      register, 
      logout, 
      isLoading, 
      adminSecretKeyAuth,
      devModeLogin,
      isDevelopmentMode,
      setDevelopmentMode
    }}>
      {children}
    </AuthContext.Provider>
  );
};
