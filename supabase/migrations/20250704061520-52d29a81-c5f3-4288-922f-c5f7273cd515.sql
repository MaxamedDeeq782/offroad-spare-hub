
-- First, let's see what the current check constraint allows and drop it
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_status_check;

-- Create a new check constraint that allows all the status values used in the application
ALTER TABLE public.orders ADD CONSTRAINT orders_status_check 
CHECK (status IN ('pending', 'approved', 'shipped', 'delivered', 'canceled'));
