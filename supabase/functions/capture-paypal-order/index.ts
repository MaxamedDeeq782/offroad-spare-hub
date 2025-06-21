
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

// PayPal API base URL - automatically detects sandbox vs live
const getPayPalBaseURL = () => {
  const clientId = Deno.env.get("PAYPAL_CLIENT_ID");
  if (!clientId) {
    throw new Error("PAYPAL_CLIENT_ID not configured");
  }
  return clientId.startsWith("sb-") ? "https://api-m.sandbox.paypal.com" : "https://api-m.paypal.com";
};

// Get PayPal access token
const getPayPalAccessToken = async () => {
  const clientId = Deno.env.get("PAYPAL_CLIENT_ID");
  const clientSecret = Deno.env.get("PAYPAL_CLIENT_SECRET");
  
  if (!clientId || !clientSecret) {
    throw new Error("PayPal credentials not configured - missing PAYPAL_CLIENT_ID or PAYPAL_CLIENT_SECRET");
  }

  console.log("Getting PayPal access token for capture...");
  
  const credentials = btoa(`${clientId}:${clientSecret}`);
  
  const response = await fetch(`${getPayPalBaseURL()}/v1/oauth2/token`, {
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
  console.log("PayPal access token obtained for capture");
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
      console.error("Missing Supabase environment variables");
      throw new Error("Supabase configuration error");
    }

    // Initialize Supabase with service role key to bypass RLS
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get the request body
    const { orderId, userId, cartItems } = await req.json();
    
    if (!orderId) {
      throw new Error("PayPal Order ID is required");
    }
    
    console.log(`Capturing PayPal order: ${orderId} for user: ${userId}`);
    
    // Get PayPal access token
    const accessToken = await getPayPalAccessToken();
    
    // Capture the PayPal order
    console.log("Sending capture request to PayPal...");
    const response = await fetch(`${getPayPalBaseURL()}/v2/checkout/orders/${orderId}/capture`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`,
        "PayPal-Request-Id": `${Date.now()}-${Math.random()}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("PayPal capture failed:", response.status, errorData);
      throw new Error(`PayPal capture failed: ${response.status} - ${errorData}`);
    }

    const captureData = await response.json();
    console.log("PayPal order captured successfully:", captureData.id);
    
    // Check if payment was successful
    const paymentStatus = captureData.status;
    if (paymentStatus !== "COMPLETED") {
      console.error("Payment not completed, status:", paymentStatus);
      throw new Error(`Payment not completed. Status: ${paymentStatus}`);
    }

    // Extract payment details
    const payer = captureData.payer || {};
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
      shipping_name: payer.name ? `${payer.name.given_name || ''} ${payer.name.surname || ''}`.trim() : null,
      shipping_email: payer.email_address || null,
      shipping_address: payer.address?.address_line_1 || null,
      shipping_city: payer.address?.admin_area_2 || null,
      shipping_state: payer.address?.admin_area_1 || null,
      shipping_zip: payer.address?.postal_code || null,
    };

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert(orderData)
      .select()
      .single();

    if (orderError) {
      console.error("Error creating order in database:", orderError);
      throw new Error(`Database error: ${orderError.message}`);
    }

    console.log("Order created in database:", order.id);

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
        throw new Error(`Failed to create order items: ${itemsError.message}`);
      }
      
      console.log("Order items created successfully");
    }

    console.log("=== PAYPAL ORDER CAPTURE COMPLETED SUCCESSFULLY ===");

    return new Response(JSON.stringify({
      success: true,
      orderId: order.id,
      paypalOrderId: orderId,
      paymentId: payment.id,
      total: totalAmount,
      status: 'approved'
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
    
    let errorMessage = "Failed to capture PayPal payment";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    return new Response(JSON.stringify({ 
      success: false,
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
