
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

// PayPal API base URL
const getPayPalBaseURL = () => {
  const clientId = Deno.env.get("PAYPAL_CLIENT_ID");
  return clientId?.startsWith("sb-") ? "https://api-m.sandbox.paypal.com" : "https://api-m.paypal.com";
};

// Get PayPal access token
const getPayPalAccessToken = async () => {
  const clientId = Deno.env.get("PAYPAL_CLIENT_ID");
  const clientSecret = Deno.env.get("PAYPAL_CLIENT_SECRET");
  
  if (!clientId || !clientSecret) {
    throw new Error("PayPal credentials not configured");
  }

  const auth = btoa(`${clientId}:${clientSecret}`);
  
  const response = await fetch(`${getPayPalBaseURL()}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      "Authorization": `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!response.ok) {
    throw new Error("Failed to get PayPal access token");
  }

  const data = await response.json();
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
      throw new Error("Invalid cart items");
    }
    
    console.log(`Creating PayPal order for user: ${userId}`);
    console.log(`Cart items: ${cartItems.length} items`);
    
    // Get PayPal access token
    const accessToken = await getPayPalAccessToken();
    
    // Calculate total amount
    const totalAmount = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Create PayPal order
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
      },
    };

    console.log("Creating PayPal order with data:", JSON.stringify(orderData, null, 2));

    const response = await fetch(`${getPayPalBaseURL()}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`,
      },
      body: JSON.stringify(orderData),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("PayPal API error:", errorData);
      throw new Error(`PayPal API error: ${response.status}`);
    }

    const paypalOrder = await response.json();
    console.log("PayPal order created:", paypalOrder.id);

    // Get approval URL
    const approvalUrl = paypalOrder.links.find((link) => link.rel === "approve")?.href;
    
    if (!approvalUrl) {
      throw new Error("No approval URL found in PayPal response");
    }

    return new Response(JSON.stringify({ 
      orderId: paypalOrder.id,
      approvalUrl: approvalUrl,
      isTestMode: getPayPalBaseURL().includes("sandbox")
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
    
    return new Response(JSON.stringify({ error: error.message }), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
      status: 400,
    });
  }
});
