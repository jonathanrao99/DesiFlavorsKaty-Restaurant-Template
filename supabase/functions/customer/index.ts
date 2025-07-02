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
      const url = new URL(req.url);
      const lookup = url.searchParams.get('lookup');
      if (!lookup) throw new Error('Missing lookup param');
      // Lookup by email or phone
      const res = await fetch(`${SUPABASE_URL}/rest/v1/customers?or=(email.eq.${lookup},phone.eq.${lookup})`, {
        headers: {
          apikey: SERVICE_ROLE_KEY,
          authorization: `Bearer ${SERVICE_ROLE_KEY}`
        }
      });
      const data = await res.json();
      return new Response(JSON.stringify({ customer: data[0] || null }), { headers: corsHeaders });
    } else if (req.method === "POST") {
      const body = await req.json();
      // Upsert customer by email or phone
      const res = await fetch(`${SUPABASE_URL}/rest/v1/customers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: SERVICE_ROLE_KEY,
          authorization: `Bearer ${SERVICE_ROLE_KEY}`,
          Prefer: 'resolution=merge-duplicates'
        },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      return new Response(JSON.stringify({ customer: data[0] || null }), { headers: corsHeaders });
    } else {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), { headers: corsHeaders, status: 405 });
    }
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { headers: corsHeaders, status: 500 });
  }
}); 