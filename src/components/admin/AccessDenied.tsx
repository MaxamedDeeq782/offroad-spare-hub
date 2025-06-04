
import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ShieldX, LogIn } from 'lucide-react';

interface AccessDeniedProps {
  isLoggedIn: boolean;
}

const AccessDenied: React.FC<AccessDeniedProps> = ({ isLoggedIn }) => {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-4 py-8 text-center">
      <div className="max-w-md mx-auto">
        <ShieldX className="h-16 w-16 text-red-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-4 text-red-600">Access Denied</h1>
        
        {!isLoggedIn ? (
          <>
            <p className="mb-6 text-gray-600">
              You need to be logged in with administrative privileges to access this page.
            </p>
            <div className="space-y-4">
              <Button 
                className="w-full" 
                onClick={() => navigate('/login')}
              >
                <LogIn className="mr-2 h-4 w-4" />
                Sign In
              </Button>
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={() => navigate('/')}
              >
                Return to Home
              </Button>
            </div>
          </>
        ) : (
          <>
            <p className="mb-6 text-gray-600">
              You don't have administrative privileges to access this page. 
              Contact your administrator if you believe this is an error.
            </p>
            <Button 
              className="w-full" 
              onClick={() => navigate('/')}
            >
              Return to Home
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default AccessDenied;
