
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@12.18.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
};

const handleCors = (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
      status: 204,
    });
  }
  return null;
};

serve(async (req) => {
  try {
    // Handle CORS
    const corsResponse = handleCors(req);
    if (corsResponse) return corsResponse;

    console.log("=== STRIPE WEBHOOK STARTED ===");

    // Get environment variables
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!stripeSecretKey || !webhookSecret || !supabaseUrl || !supabaseServiceKey) {
      console.error("Missing required environment variables");
      return new Response("Configuration error", { status: 500 });
    }

    // Initialize Stripe
    const stripe = new Stripe(stripeSecretKey, { apiVersion: "2023-10-16" });

    // Initialize Supabase with service role key to bypass RLS
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get the signature from headers
    const signature = req.headers.get("stripe-signature");
    if (!signature) {
      console.error("No Stripe signature found");
      return new Response("No signature", { status: 400 });
    }

    // Get the raw body
    const body = await req.text();

    // Verify the webhook signature
    let event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return new Response("Invalid signature", { status: 400 });
    }

    console.log("Webhook event type:", event.type);
    console.log("Event ID:", event.id);

    // Check if we've already processed this event
    const { data: existingWebhook } = await supabase
      .from("stripe_webhooks")
      .select("id")
      .eq("stripe_event_id", event.id)
      .single();

    if (existingWebhook) {
      console.log("Event already processed, skipping");
      return new Response("Event already processed", { status: 200 });
    }

    // Handle checkout.session.completed event
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      
      console.log("Processing checkout session:", session.id);
      console.log("Customer ID:", session.customer);
      console.log("Payment status:", session.payment_status);

      if (session.payment_status === "paid") {
        try {
          // Get detailed session information with line items
          const detailedSession = await stripe.checkout.sessions.retrieve(session.id, {
            expand: ['line_items', 'line_items.data.price.product', 'customer']
          });

          console.log("Retrieved detailed session");

          // Extract customer and shipping information
          const customer = detailedSession.customer as Stripe.Customer;
          const customerDetails = detailedSession.customer_details;
          const shippingDetails = detailedSession.shipping_details || customerDetails?.address;

          // Calculate total amount (convert from cents to dollars)
          const totalAmount = (detailedSession.amount_total || 0) / 100;

          // Get user ID from session metadata
          const userId = detailedSession.client_reference_id || detailedSession.metadata?.userId;

          if (!userId) {
            console.error("No user ID found in session");
            throw new Error("No user ID found in session");
          }

          console.log("Creating order for user:", userId);

          // Create the order record
          const orderData = {
            user_id: userId,
            total: totalAmount,
            status: 'approved' as const,
            stripe_session_id: session.id,
            stripe_customer_id: typeof customer === 'string' ? customer : customer?.id,
            stripe_payment_intent_id: detailedSession.payment_intent as string,
            shipping_name: shippingDetails?.name || customerDetails?.name,
            shipping_email: customerDetails?.email || customer?.email,
            shipping_address: shippingDetails?.address?.line1,
            shipping_city: shippingDetails?.address?.city,
            shipping_state: shippingDetails?.address?.state,
            shipping_zip: shippingDetails?.address?.postal_code,
          };

          const { data: order, error: orderError } = await supabase
            .from("orders")
            .insert(orderData)
            .select()
            .single();

          if (orderError) {
            console.error("Error creating order:", orderError);
            throw orderError;
          }

          console.log("Order created:", order.id);

          // Create order items from line items
          const lineItems = detailedSession.line_items?.data || [];
          console.log("Processing", lineItems.length, "line items");

          for (const item of lineItems) {
            const product = item.price?.product;
            const productName = typeof product === 'string' ? product : product?.name || 'Unknown Product';
            const unitAmount = (item.price?.unit_amount || 0) / 100;

            const orderItemData = {
              order_id: order.id,
              product_id: typeof product === 'string' ? product : product?.id || 'unknown',
              quantity: item.quantity || 1,
              price: unitAmount,
            };

            const { error: itemError } = await supabase
              .from("order_items")
              .insert(orderItemData);

            if (itemError) {
              console.error("Error creating order item:", itemError);
              throw itemError;
            }
          }

          console.log("Order items created successfully");

          // Record the webhook as processed
          await supabase
            .from("stripe_webhooks")
            .insert({
              stripe_event_id: event.id,
              event_type: event.type,
              order_id: order.id,
            });

          console.log("Webhook recorded as processed");

        } catch (error) {
          console.error("Error processing checkout session:", error);
          
          // Still record the webhook to prevent reprocessing
          await supabase
            .from("stripe_webhooks")
            .insert({
              stripe_event_id: event.id,
              event_type: event.type,
            });

          return new Response(`Error processing order: ${error.message}`, { status: 500 });
        }
      } else {
        console.log("Payment not completed, status:", session.payment_status);
      }
    } else {
      console.log("Unhandled event type:", event.type);
      
      // Record unhandled events too
      await supabase
        .from("stripe_webhooks")
        .insert({
          stripe_event_id: event.id,
          event_type: event.type,
        });
    }

    console.log("=== STRIPE WEBHOOK COMPLETED ===");

    return new Response("Webhook processed successfully", {
      headers: corsHeaders,
      status: 200,
    });

  } catch (error) {
    console.error("=== STRIPE WEBHOOK ERROR ===");
    console.error("Error details:", error);
    
    return new Response(`Webhook error: ${error.message}`, {
      headers: corsHeaders,
      status: 500,
    });
  }
});
