// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
  const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    return new Response(JSON.stringify({ error: 'Missing Supabase env vars' }), { headers: corsHeaders, status: 500 });
  }
  try {
    if (req.method === "GET") {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/menu_items?select=*`, {
        headers: {
          apikey: SERVICE_ROLE_KEY,
          authorization: `Bearer ${SERVICE_ROLE_KEY}`
        }
      });
      const data = await res.json();
      return new Response(JSON.stringify({ inventory: data }), { headers: corsHeaders });
    } else if (req.method === "POST") {
      const body = await req.json();
      // Update inventory (expects array of {id, ...fields})
      const updates = Array.isArray(body) ? body : [body];
      const results = [];
      for (const update of updates) {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/menu_items?id=eq.${update.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            apikey: SERVICE_ROLE_KEY,
            authorization: `Bearer ${SERVICE_ROLE_KEY}`,
            Prefer: 'return=representation'
          },
          body: JSON.stringify(update)
        });
        results.push(await res.json());
      }
      return new Response(JSON.stringify({ updated: results }), { headers: corsHeaders });
    } else {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), { headers: corsHeaders, status: 405 });
    }
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { headers: corsHeaders, status: 500 });
  }
}); 