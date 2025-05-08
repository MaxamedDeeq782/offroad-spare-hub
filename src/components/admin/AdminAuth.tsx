
import React, { useState } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface AdminAuthProps {
  adminSecretKeyAuth: (key: string) => boolean;
  onSuccessfulAuth: () => void;
}

const AdminAuth: React.FC<AdminAuthProps> = ({ adminSecretKeyAuth, onSuccessfulAuth }) => {
  const [secretKey, setSecretKey] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (adminSecretKeyAuth(secretKey)) {
      setError('');
      onSuccessfulAuth();
    } else {
      setError('Invalid secret key');
    }
  };

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Admin Access</CardTitle>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-1">
              <Input
                type="password"
                value={secretKey}
                onChange={(e) => setSecretKey(e.target.value)}
                placeholder="Enter secret key"
                required
              />
            </div>
            
            <Button
              type="submit"
              className="w-full"
            >
              Access Admin Panel
            </Button>
          </CardContent>
        </form>
      </Card>
    </div>
  );
};

export default AdminAuth;
