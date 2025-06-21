
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

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

// PayPal API base URL - detects live vs sandbox
const getPayPalBaseURL = () => {
  const clientId = Deno.env.get("PAYPAL_CLIENT_ID");
  if (!clientId) {
    throw new Error("PAYPAL_CLIENT_ID not configured");
  }
  // Live PayPal client IDs do NOT start with 'sb-', sandbox ones do
  return clientId.startsWith("sb-") ? "https://api-m.sandbox.paypal.com" : "https://api-m.paypal.com";
};

// Get PayPal access token using proper authentication
const getPayPalAccessToken = async () => {
  const clientId = Deno.env.get("PAYPAL_CLIENT_ID");
  const clientSecret = Deno.env.get("PAYPAL_CLIENT_SECRET");
  
  if (!clientId || !clientSecret) {
    throw new Error("PayPal credentials not configured - missing PAYPAL_CLIENT_ID or PAYPAL_CLIENT_SECRET");
  }

  const baseURL = getPayPalBaseURL();
  console.log(`Getting PayPal access token from: ${baseURL}`);
  console.log(`Using ${baseURL.includes('sandbox') ? 'SANDBOX' : 'LIVE'} PayPal environment`);
  
  // Create base64 encoded credentials for Basic auth
  const credentials = btoa(`${clientId}:${clientSecret}`);
  
  const response = await fetch(`${baseURL}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      "Authorization": `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
      "Accept": "application/json",
    },
    body: "grant_type=client_credentials",
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("PayPal token request failed:", response.status, errorText);
    throw new Error(`Failed to get PayPal access token: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  console.log("PayPal access token obtained successfully");
  return data.access_token;
};

serve(async (req) => {
  try {
    // Handle CORS
    const corsResponse = handleCors(req);
    if (corsResponse) return corsResponse;
    
    console.log("=== PAYPAL ORDER CREATION STARTED ===");
    
    // Get the request body
    const { cartItems, userId } = await req.json();
    
    // Validate request body
    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
      throw new Error("Invalid cart items provided");
    }
    
    if (!userId) {
      throw new Error("User ID is required");
    }
    
    const baseURL = getPayPalBaseURL();
    const isLive = !baseURL.includes('sandbox');
    
    console.log(`Creating PayPal order for user: ${userId}`);
    console.log(`Environment: ${isLive ? 'LIVE' : 'SANDBOX'}`);
    console.log(`Cart items: ${cartItems.length} items`);
    
    // Get PayPal access token
    const accessToken = await getPayPalAccessToken();
    
    // Calculate total amount
    const totalAmount = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    console.log(`Total amount: $${totalAmount.toFixed(2)}`);
    
    // Create PayPal order payload
    const orderData = {
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: "USD",
            value: totalAmount.toFixed(2),
            breakdown: {
              item_total: {
                currency_code: "USD",
                value: totalAmount.toFixed(2),
              },
            },
          },
          items: cartItems.map((item) => ({
            name: item.name,
            quantity: item.quantity.toString(),
            unit_amount: {
              currency_code: "USD",
              value: item.price.toFixed(2),
            },
          })),
        },
      ],
      application_context: {
        return_url: `${new URL(req.url).origin}/order-confirmation`,
        cancel_url: `${new URL(req.url).origin}/checkout`,
        brand_name: "Auto Parts Store",
        user_action: "PAY_NOW",
        landing_page: "NO_PREFERENCE",
        shipping_preference: "NO_SHIPPING"
      },
    };

    console.log("Creating PayPal order...");

    const response = await fetch(`${baseURL}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`,
        "PayPal-Request-Id": `${Date.now()}-${Math.random()}`,
      },
      body: JSON.stringify(orderData),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("PayPal order creation failed:", response.status, errorData);
      throw new Error(`PayPal order creation failed: ${response.status} - ${errorData}`);
    }

    const paypalOrder = await response.json();
    console.log("PayPal order created successfully:", paypalOrder.id);

    // Get approval URL
    const approvalUrl = paypalOrder.links.find((link) => link.rel === "approve")?.href;
    
    if (!approvalUrl) {
      console.error("No approval URL found in PayPal response:", paypalOrder);
      throw new Error("No approval URL found in PayPal response");
    }

    console.log("Approval URL:", approvalUrl);

    return new Response(JSON.stringify({ 
      orderId: paypalOrder.id,
      approvalUrl: approvalUrl,
      isTestMode: !isLive
    }), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
      status: 200,
    });
  } catch (error) {
    console.error("=== PAYPAL ORDER CREATION ERROR ===");
    console.error("Error details:", error);
    
    let errorMessage = "Failed to create PayPal order";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    return new Response(JSON.stringify({ 
      error: errorMessage,
      details: error instanceof Error ? error.stack : "Unknown error"
    }), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
      status: 500,
    });
  }
});
