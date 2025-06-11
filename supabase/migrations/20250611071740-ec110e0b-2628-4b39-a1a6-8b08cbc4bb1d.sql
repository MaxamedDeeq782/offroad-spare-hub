
-- Add webhook tracking table to prevent duplicate processing
CREATE TABLE IF NOT EXISTS public.stripe_webhooks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  stripe_event_id TEXT NOT NULL UNIQUE,
  event_type TEXT NOT NULL,
  processed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  order_id UUID REFERENCES public.orders(id)
);

-- Enable RLS on webhook table
ALTER TABLE public.stripe_webhooks ENABLE ROW LEVEL SECURITY;

-- Allow service role to manage webhooks (edge functions use service role)
CREATE POLICY "Service role can manage webhooks" ON public.stripe_webhooks
  USING (true)
  WITH CHECK (true);

-- Update orders table to ensure we can store Stripe customer data
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT;

-- Add index for faster webhook lookups
CREATE INDEX IF NOT EXISTS idx_orders_stripe_session_id ON public.orders(stripe_session_id);
CREATE INDEX IF NOT EXISTS idx_stripe_webhooks_event_id ON public.stripe_webhooks(stripe_event_id);
