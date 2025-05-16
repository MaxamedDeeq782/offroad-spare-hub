
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import AccessDenied from '../components/admin/AccessDenied';
import AddProductForm from '../components/admin/AddProductForm';

const AddProductPage: React.FC = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const { user } = useAuth();

  // Check admin status whenever user changes
  useEffect(() => {
    // Check if the user is admin from metadata
    if (user?.user_metadata?.isAdmin) {
      setIsAdmin(true);
    } else {
      // If not in user metadata, check session storage as fallback
      const adminAuth = sessionStorage.getItem('adminAuth');
      setIsAdmin(adminAuth === 'true');
    }
  }, [user]);

  // If not admin, show access denied
  if (!isAdmin) {
    return <AccessDenied isLoggedIn={!!user} />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <AddProductForm />
    </div>
  );
};

export default AddProductPage;
