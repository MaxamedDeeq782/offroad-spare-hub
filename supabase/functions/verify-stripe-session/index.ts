
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
    
    console.log("=== VERIFY STRIPE SESSION START ===");
    
    // Get Stripe secret key from environment variables
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeSecretKey) {
      console.error("STRIPE_SECRET_KEY is not set");
      return new Response(JSON.stringify({ 
        success: false,
        error: "Stripe configuration error - please contact support" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }
    
    // Initialize Stripe
    const stripe = new Stripe(stripeSecretKey);
    console.log("Stripe initialized successfully");
    
    // Get the request body
    let requestBody;
    try {
      requestBody = await req.json();
    } catch (parseError) {
      console.error("Failed to parse request body:", parseError);
      return new Response(JSON.stringify({ 
        success: false,
        error: "Invalid request format" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }
    
    const { sessionId } = requestBody;
    
    if (!sessionId) {
      console.error("No sessionId provided in request body");
      return new Response(JSON.stringify({ 
        success: false,
        error: "Session ID is required" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }
    
    console.log(`Retrieving session information for: ${sessionId}`);
    
    // Retrieve the session with expanded data
    let session;
    try {
      session = await stripe.checkout.sessions.retrieve(sessionId, {
        expand: ['line_items', 'line_items.data.price.product', 'customer_details']
      });
    } catch (stripeError) {
      console.error("Stripe API error:", stripeError);
      return new Response(JSON.stringify({ 
        success: false,
        error: `Failed to retrieve session: ${stripeError.message}` 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }
    
    if (!session) {
      console.error("No session found with the provided ID");
      return new Response(JSON.stringify({ 
        success: false,
        error: "Session not found" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 404,
      });
    }
    
    console.log(`Found session: ${session.id} with status: ${session.status}`);
    console.log(`Payment status: ${session.payment_status}`);
    
    // Check if the payment was successful
    if (session.payment_status !== 'paid') {
      console.warn(`Payment not completed. Status: ${session.payment_status}`);
      return new Response(JSON.stringify({ 
        success: false,
        error: `Payment status: ${session.payment_status}. Please try again or contact support.` 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }
    
    // Process line items to ensure product IDs are correctly formatted
    const lineItems = session.line_items?.data || [];
    console.log(`Processing ${lineItems.length} line items`);
    
    if (lineItems.length === 0) {
      console.warn("No line items found in session");
    }
    
    const processedLineItems = lineItems.map((item, index) => {
      console.log(`Processing line item ${index + 1}:`, {
        id: item.id,
        quantity: item.quantity,
        amount_total: item.amount_total,
        product: item.price?.product
      });
      
      const product = typeof item.price?.product === 'string' 
        ? { id: item.price.product } 
        : item.price?.product || { id: 'unknown' };
      
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
    
    // Validate required fields
    if (!session.amount_total) {
      console.error("Missing amount_total in session");
      return new Response(JSON.stringify({ 
        success: false,
        error: "Invalid payment amount" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }
    
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
    
    console.log("Returning successful response with amount:", responseData.amount_total);
    console.log("=== VERIFY STRIPE SESSION SUCCESS ===");
    
    return new Response(JSON.stringify(responseData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("=== VERIFY STRIPE SESSION ERROR ===");
    console.error("Unexpected error:", error);
    console.error("Error stack:", error.stack);
    
    // Return detailed error information for debugging
    const errorResponse = { 
      success: false,
      error: error.message || "An unexpected error occurred",
      details: error.stack || "No stack trace available",
      timestamp: new Date().toISOString()
    };
    
    return new Response(JSON.stringify(errorResponse), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
