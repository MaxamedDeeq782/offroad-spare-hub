
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';

export const useAdminAccess = () => {
  const { user, isAdmin, isLoading } = useAuth();
  const [hasAccess, setHasAccess] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      setHasAccess(false);
      setChecking(false);
      return;
    }

    // Admin access is determined by the role in the database
    setHasAccess(isAdmin);
    setChecking(false);
  }, [user, isAdmin, isLoading]);

  return {
    hasAccess,
    isLoading: checking || isLoading,
    user
  };
};
