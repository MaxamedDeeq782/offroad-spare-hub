
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@12.18.0";

// Define CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Handle CORS preflight requests
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
    
    // Get Stripe secret key from environment variables
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeSecretKey) {
      throw new Error("STRIPE_SECRET_KEY is not set");
    }
    
    // Initialize Stripe
    const stripe = new Stripe(stripeSecretKey);
    
    // Get the request body
    const { sessionId } = await req.json();
    
    if (!sessionId) {
      throw new Error("No sessionId provided");
    }
    
    console.log(`Retrieving session information for: ${sessionId}`);
    
    // Retrieve the session
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items', 'line_items.data.price.product']
    });
    
    if (!session) {
      throw new Error("No session found with the provided ID");
    }
    
    console.log(`Found session: ${session.id} with status: ${session.status}`);
    
    // Check if the payment was successful
    if (session.payment_status !== 'paid') {
      return new Response(JSON.stringify({ 
        success: false,
        error: `Payment not completed. Status: ${session.payment_status}` 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }
    
    // Return the session details
    return new Response(JSON.stringify({ 
      success: true,
      amount_total: session.amount_total,
      customer_email: session.customer_email,
      customer_details: session.customer_details,
      line_items: session.line_items?.data || [],
      payment_status: session.payment_status,
      created: session.created
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error verifying Stripe session:", error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
