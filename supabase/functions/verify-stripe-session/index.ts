
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
      console.error("STRIPE_SECRET_KEY is not set");
      throw new Error("STRIPE_SECRET_KEY is not set");
    }
    
    // Initialize Stripe
    const stripe = new Stripe(stripeSecretKey);
    
    // Get the request body
    const { sessionId } = await req.json();
    
    if (!sessionId) {
      console.error("No sessionId provided");
      throw new Error("No sessionId provided");
    }
    
    console.log(`Retrieving session information for: ${sessionId}`);
    
    // Retrieve the session with expanded data
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items', 'line_items.data.price.product', 'customer_details']
    });
    
    if (!session) {
      console.error("No session found with the provided ID");
      throw new Error("No session found with the provided ID");
    }
    
    console.log(`Found session: ${session.id} with status: ${session.status}`);
    console.log(`Payment status: ${session.payment_status}`);
    
    // Check if the payment was successful
    if (session.payment_status !== 'paid') {
      console.warn(`Payment not completed. Status: ${session.payment_status}`);
      return new Response(JSON.stringify({ 
        success: false,
        error: `Payment not completed. Status: ${session.payment_status}` 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }
    
    // Process line items to ensure product IDs are correctly formatted
    const lineItems = session.line_items?.data || [];
    console.log(`Processing ${lineItems.length} line items`);
    
    const processedLineItems = lineItems.map(item => {
      const product = typeof item.price.product === 'string' 
        ? { id: item.price.product } 
        : item.price.product;
      
      return {
        ...item,
        price: {
          ...item.price,
          product
        }
      };
    });
    
    // Extract customer and shipping information
    const customerDetails = session.customer_details || {};
    const shippingAddress = customerDetails.address || {};
    
    console.log("Customer details:", customerDetails);
    console.log("Shipping address:", shippingAddress);
    
    // Return the session details with comprehensive information
    const responseData = { 
      success: true,
      session_id: session.id,
      amount_total: session.amount_total,
      customer_email: session.customer_email || customerDetails.email,
      customer_details: customerDetails,
      shipping: {
        name: customerDetails.name,
        email: customerDetails.email || session.customer_email,
        address: shippingAddress.line1,
        city: shippingAddress.city,
        state: shippingAddress.state,
        zipCode: shippingAddress.postal_code,
        country: shippingAddress.country
      },
      line_items: processedLineItems,
      payment_status: session.payment_status,
      payment_intent: session.payment_intent,
      created: session.created,
      metadata: session.metadata || {}
    };
    
    console.log("Returning successful response:", responseData);
    
    return new Response(JSON.stringify(responseData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error verifying Stripe session:", error);
    
    // Return detailed error information
    const errorResponse = { 
      success: false,
      error: error.message,
      details: error.stack || "No stack trace available"
    };
    
    return new Response(JSON.stringify(errorResponse), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
