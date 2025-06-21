
import React from 'react';
import { useAdminAccess } from '../hooks/useAdminAccess';
import AccessDenied from '../components/admin/AccessDenied';
import AddProductForm from '../components/admin/AddProductForm';
import ErrorBoundary from '../components/ErrorBoundary';
import { Loader2 } from 'lucide-react';

const AddProductPage: React.FC = () => {
  console.log('=== ADD PRODUCT PAGE RENDERING ===');
  
  const { hasAccess, isLoading, user } = useAdminAccess();
  
  console.log('Admin access state:', { hasAccess, isLoading, userEmail: user?.email });

  if (isLoading) {
    console.log('Still loading admin access...');
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!hasAccess) {
    console.log('Access denied for user:', user?.email);
    return <AccessDenied isLoggedIn={!!user} />;
  }

  console.log('Rendering AddProductForm for authorized user');
  
  return (
    <ErrorBoundary>
      <div className="container mx-auto px-4 py-8">
        <AddProductForm />
      </div>
    </ErrorBoundary>
  );
};

export default AddProductPage;
