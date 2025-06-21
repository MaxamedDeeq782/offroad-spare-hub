
-- Add PayPal payment tracking columns to orders table
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS paypal_order_id TEXT,
ADD COLUMN IF NOT EXISTS paypal_payment_id TEXT;

-- Create index for PayPal order lookups
CREATE INDEX IF NOT EXISTS idx_orders_paypal_order_id ON orders(paypal_order_id);
