
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

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
    
    console.log("=== PAYPAL ORDER CAPTURE STARTED ===");
    
    // Get environment variables
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Missing required environment variables");
      return new Response("Configuration error", { status: 500 });
    }

    // Initialize Supabase with service role key to bypass RLS
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get the request body
    const { orderId, userId, cartItems } = await req.json();
    
    if (!orderId) {
      throw new Error("Order ID is required");
    }
    
    console.log(`Capturing PayPal order: ${orderId} for user: ${userId}`);
    
    // Get PayPal access token
    const accessToken = await getPayPalAccessToken();
    
    // Capture the PayPal order
    const response = await fetch(`${getPayPalBaseURL()}/v2/checkout/orders/${orderId}/capture`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("PayPal capture error:", errorData);
      throw new Error(`PayPal capture failed: ${response.status}`);
    }

    const captureData = await response.json();
    console.log("PayPal order captured:", captureData.id);
    
    // Check if payment was successful
    const paymentStatus = captureData.status;
    if (paymentStatus !== "COMPLETED") {
      throw new Error(`Payment not completed. Status: ${paymentStatus}`);
    }

    // Extract payment details
    const payer = captureData.payer;
    const purchaseUnit = captureData.purchase_units[0];
    const payment = purchaseUnit.payments.captures[0];
    
    // Calculate total amount
    const totalAmount = parseFloat(purchaseUnit.amount.value);
    
    console.log("Creating order in database...");

    // Create the order record
    const orderData = {
      user_id: userId,
      total: totalAmount,
      status: 'approved' as const,
      paypal_order_id: orderId,
      paypal_payment_id: payment.id,
      shipping_name: payer.name ? `${payer.name.given_name} ${payer.name.surname}` : null,
      shipping_email: payer.email_address,
      shipping_address: payer.address?.address_line_1,
      shipping_city: payer.address?.admin_area_2,
      shipping_state: payer.address?.admin_area_1,
      shipping_zip: payer.address?.postal_code,
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

    // Create order items if cart items provided
    if (cartItems && cartItems.length > 0) {
      console.log("Creating order items...");
      const orderItems = cartItems.map(item => ({
        order_id: order.id,
        product_id: item.productId,
        quantity: item.quantity,
        price: item.price,
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);

      if (itemsError) {
        console.error("Error creating order items:", itemsError);
        throw itemsError;
      }
      
      console.log("Order items created successfully");
    }

    console.log("=== PAYPAL ORDER CAPTURE COMPLETED ===");

    return new Response(JSON.stringify({
      success: true,
      orderId: order.id,
      paypalOrderId: orderId,
      paymentId: payment.id,
      total: totalAmount,
    }), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
      status: 200,
    });

  } catch (error) {
    console.error("=== PAYPAL ORDER CAPTURE ERROR ===");
    console.error("Error details:", error);
    
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message 
    }), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
      status: 500,
    });
  }
});
