
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';

export const useAdminAccess = () => {
  const { user, isLoading } = useAuth();
  const [hasAccess, setHasAccess] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      setHasAccess(false);
      setChecking(false);
      return;
    }

    // Only allow access for the specific admin email
    const isAuthorizedAdmin = user.email === 'moemoalin782@gmail.com';
    setHasAccess(isAuthorizedAdmin);
    setChecking(false);
  }, [user, isLoading]);

  return {
    hasAccess,
    isLoading: checking || isLoading,
    user
  };
};
