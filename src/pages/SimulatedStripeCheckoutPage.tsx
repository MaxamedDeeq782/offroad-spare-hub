
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const SimulatedStripeCheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { cart, getCartTotal } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);
  const [countdown, setCountdown] = useState(3);

  const handleCompletePurchase = () => {
    setIsProcessing(true);
    
    // Simulate processing and then redirect to confirmation page
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          navigate(`/order-confirmation?session_id=simulated_${Date.now()}`);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6 text-center">Simulated Stripe Checkout</h1>
      <p className="text-center mb-8 text-gray-600 dark:text-gray-400">
        This is a simulated checkout page for development testing
      </p>
      
      <div className="max-w-md mx-auto">
        <Card className="p-6 mb-6">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-lg font-bold">Payment Amount</h2>
            <span className="text-xl font-bold">${getCartTotal().toFixed(2)}</span>
          </div>
          
          <div className="space-y-4 mb-6">
            <div>
              <Label htmlFor="card-number">Card Number</Label>
              <Input 
                id="card-number" 
                placeholder="4242 4242 4242 4242" 
                defaultValue="4242 4242 4242 4242"
                className="font-mono"
              />
              <p className="mt-1 text-xs text-gray-500">Use 4242 4242 4242 4242 for test payments</p>
            </div>
            
            <div className="flex gap-4">
              <div className="flex-1">
                <Label htmlFor="expiry">Expiry Date</Label>
                <Input id="expiry" placeholder="MM/YY" defaultValue="12/30" />
              </div>
              <div className="w-24">
                <Label htmlFor="cvc">CVC</Label>
                <Input id="cvc" placeholder="123" defaultValue="123" />
              </div>
            </div>
            
            <div>
              <Label htmlFor="name">Name on Card</Label>
              <Input id="name" placeholder="J. Smith" defaultValue="Test User" />
            </div>
          </div>
          
          <Button 
            onClick={handleCompletePurchase} 
            disabled={isProcessing} 
            className="w-full"
          >
            {isProcessing ? `Processing (${countdown})...` : 'Complete Purchase'}
          </Button>
          
          <div className="mt-4 flex justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
              <path fill="#6772E5" d="M33.3,0H6.7C3,0,0,3,0,6.7v26.7C0,37,3,40,6.7,40h26.7c3.7,0,6.7-3,6.7-6.7V6.7C40,3,37,0,33.3,0z M36.7,33.3c0,1.8-1.5,3.3-3.3,3.3H6.7c-1.8,0-3.3-1.5-3.3-3.3V6.7c0-1.8,1.5-3.3,3.3-3.3h26.7c1.8,0,3.3,1.5,3.3,3.3V33.3z"/>
              <path fill="#6772E5" d="M20,12c-2.8,0-5.2,1.3-6.8,3.2l0,0c0,0,0,0,0,0l0,0c-0.3,0.4-0.5,0.8-0.7,1.2c-0.5,1.1-0.8,2.3-0.8,3.6c0,4.4,3.6,8,8,8c4.4,0,8-3.6,8-8C28,15.6,24.4,12,20,12z"/>
            </svg>
          </div>
        </Card>
        
        <p className="text-sm text-center text-gray-500">
          This is a simulated checkout page for development testing.<br />
          In production, users will be redirected to the actual Stripe payment page.
        </p>
      </div>
    </div>
  );
};

export default SimulatedStripeCheckoutPage;
