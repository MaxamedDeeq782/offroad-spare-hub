
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

// Main function
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
    
    // Check if we're in test mode
    const isTestMode = stripeSecretKey.startsWith("sk_test_");
    console.log(`Using Stripe in ${isTestMode ? 'TEST' : 'LIVE'} mode`);
    
    // Get the request body
    const { cartItems, userId, customerInfo } = await req.json();
    
    // Validate request body
    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
      throw new Error("Invalid cart items");
    }
    
    // Initialize Stripe
    const stripe = new Stripe(stripeSecretKey);
    
    // Create line items for Stripe
    const lineItems = cartItems.map((item) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: item.name,
          description: `Quantity: ${item.quantity}`,
          // Only include images if they are absolute URLs
          images: item.imageUrl && item.imageUrl.startsWith('http') ? [item.imageUrl] : undefined,
        },
        unit_amount: Math.round(item.price * 100), // Convert to cents
      },
      quantity: item.quantity,
    }));
    
    // Extract origin from request for success URL
    const origin = new URL(req.url).origin;
    const referer = req.headers.get('referer');
    
    // Use referer as base for success URL if available, otherwise fallback to origin
    const baseUrl = referer ? new URL(referer).origin : origin;
    
    // Create the checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${baseUrl}/order-confirmation?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/checkout`,
      client_reference_id: userId,
      customer_email: customerInfo?.email,
      shipping_address_collection: {
        allowed_countries: ['US', 'CA', 'GB'],
      },
      // Pre-fill customer information if provided
      shipping_options: [
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: {
              amount: 0,
              currency: 'usd',
            },
            display_name: 'Free shipping',
            delivery_estimate: {
              minimum: {
                unit: 'business_day',
                value: 5,
              },
              maximum: {
                unit: 'business_day',
                value: 7,
              },
            },
          },
        }
      ],
    });
    
    return new Response(JSON.stringify({ 
      url: session.url, 
      isTestMode 
    }), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
      status: 200,
    });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
      status: 400,
    });
  }
});
