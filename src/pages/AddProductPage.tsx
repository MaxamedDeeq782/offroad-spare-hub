
import React from 'react';
import { useAdminAccess } from '../hooks/useAdminAccess';
import AccessDenied from '../components/admin/AccessDenied';
import AddProductForm from '../components/admin/AddProductForm';
import { Loader2 } from 'lucide-react';

const AddProductPage: React.FC = () => {
  const { hasAccess, isLoading, user } = useAdminAccess();

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!hasAccess) {
    return <AccessDenied isLoggedIn={!!user} />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <AddProductForm />
    </div>
  );
};

export default AddProductPage;
