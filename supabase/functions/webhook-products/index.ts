import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-webhook-token",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  }

  try {
    // Optional webhook token verification
    const webhookToken = Deno.env.get("WEBHOOK_SECRET");
    if (webhookToken) {
      const providedToken = req.headers.get("x-webhook-token");
      if (providedToken !== webhookToken) {
        return new Response("Unauthorized", { status: 401, headers: corsHeaders });
      }
    }

    const payload = await req.json();
    const { action, id, data, stock, ...rest } = payload;

    if (!id || !action) {
      return new Response("Missing id or action", { status: 400, headers: corsHeaders });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    if (action === "delete") {
      const { error } = await supabase
        .from("products")
        .update({ status: "DELETED", is_active: false })
        .eq("id", id);

      if (error) {
        console.error("Delete error:", error);
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: corsHeaders,
        });
      }
    } else if (action === "create" || action === "update") {
      const productData = {
        id,
        club_id: rest.clubId,
        club_name: rest.clubName,
        type: rest.type || "DISPENSE",
        category: rest.category || "",
        brand: rest.brand || "",
        name: rest.name,
        description: rest.description || "",
        units: rest.units || "GRAMS",
        status: rest.status || "IN_STOCK",
        tags: rest.tags || "",
        stock_available: stock?.available ?? 0,
        stock_stashed: stock?.stashed ?? 0,
        cbd: data?.cbd ?? 0,
        thc: data?.thc ?? 0,
        jar_weight: data?.jarWeight ?? 0,
        price_group: rest.priceGroup || "",
        purchase_price: rest.purchasePrice || 0,
        prices: rest.prices || [],
        non_discountable: rest.nonDiscountable ?? false,
        allow_gift: rest.allowGift ?? true,
        is_active: rest.status !== "DELETED",
        webhook_created: rest.created || null,
        webhook_updated: rest.updated || null,
      };

      const { error } = await supabase
        .from("products")
        .upsert(productData, { onConflict: "id" });

      if (error) {
        console.error("Upsert error:", error);
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: corsHeaders,
        });
      }
    } else {
      return new Response("Unknown action", { status: 400, headers: corsHeaders });
    }

    return new Response(null, { status: 200, headers: corsHeaders });
  } catch (err) {
    console.error("Webhook error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: corsHeaders,
    });
  }
});
