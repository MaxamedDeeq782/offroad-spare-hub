
import React, { createContext, useState, useContext, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userRole: string | null;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error: string | null }>;
  register: (email: string, password: string, name: string) => Promise<{ success: boolean; error: string | null }>;
  logout: () => Promise<void>;
  isLoading: boolean;
  checkUserRole: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  userRole: null,
  isAdmin: false,
  login: async () => ({ success: false, error: 'Auth context not initialized' }),
  register: async () => ({ success: false, error: 'Auth context not initialized' }),
  logout: async () => {},
  isLoading: true,
  checkUserRole: async () => {}
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkUserRole = async () => {
    if (!user) {
      setUserRole(null);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching user role:', error);
        setUserRole('user'); // Default to user role
      } else {
        setUserRole(data?.role || 'user');
      }
    } catch (err) {
      console.error('Unexpected error fetching user role:', err);
      setUserRole('user');
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log('Auth event:', event);
        setSession(newSession);
        setUser(newSession?.user ?? null);
        
        if (newSession?.user) {
          // Check user role when user signs in
          setTimeout(async () => {
            await checkUserRole();
          }, 0);
        } else {
          setUserRole(null);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(async ({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      
      if (currentSession?.user) {
        await checkUserRole();
      }
      
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Update user role when user changes
  useEffect(() => {
    if (user) {
      checkUserRole();
    }
  }, [user]);

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
          },
        },
      });

      if (error) {
        console.error('Registration error:', error.message);
        return { success: false, error: error.message };
      }

      // Create user role entry for new user
      if (data.user) {
        try {
          await supabase.from('user_roles').insert({
            user_id: data.user.id,
            role: 'user'
          });
        } catch (roleError) {
          console.error('Error creating user role:', roleError);
          // Don't fail registration if role creation fails
        }
      }

      return { success: true, error: null };
    } catch (err) {
      console.error('Unexpected registration error:', err);
      return { success: false, error: 'An unexpected error occurred' };
    }
  };

  const logout = async (): Promise<void> => {
    await supabase.auth.signOut();
    setUserRole(null);
  };

  const isAdmin = userRole === 'admin';

  return (
    <AuthContext.Provider value={{ 
      user, 
      session, 
      userRole,
      isAdmin,
      login, 
      register, 
      logout, 
      isLoading, 
      checkUserRole
    }}>
      {children}
    </AuthContext.Provider>
  );
};
