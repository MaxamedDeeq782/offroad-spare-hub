
import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface AccessDeniedProps {
  isLoggedIn: boolean;
}

const AccessDenied: React.FC<AccessDeniedProps> = ({ isLoggedIn }) => {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-4 py-8 text-center">
      <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
      <p>{!isLoggedIn ? "Please log in first." : "You don't have permission to access this page."}</p>
      <Button 
        className="mt-4" 
        onClick={() => navigate('/')}
      >
        Return to Home
      </Button>
    </div>
  );
};

export default AccessDenied;
