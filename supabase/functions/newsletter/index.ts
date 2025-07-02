// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};
async function sendResendEmail({ to, subject, html }) {
  const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
  if (!RESEND_API_KEY) throw new Error('Missing RESEND_API_KEY');
  const from = Deno.env.get('RESEND_FROM_EMAIL') || 'noreply@yourdomain.com';
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ from, to, subject, html })
  });
  if (!res.ok) throw new Error('Failed to send email');
  return res.json();
}
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
      const res = await fetch(`${SUPABASE_URL}/rest/v1/newsletters?select=*&order=created_at.desc`, {
        headers: {
          apikey: SERVICE_ROLE_KEY,
          authorization: `Bearer ${SERVICE_ROLE_KEY}`
        }
      });
      const data = await res.json();
      return new Response(JSON.stringify({ subscribers: data }), { headers: corsHeaders });
    } else if (req.method === "POST") {
      const body = await req.json();
      // Add subscriber
      const res = await fetch(`${SUPABASE_URL}/rest/v1/newsletters`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: SERVICE_ROLE_KEY,
          authorization: `Bearer ${SERVICE_ROLE_KEY}`,
          Prefer: 'return=representation'
        },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      // Send welcome email via Resend
      if (body.email) {
        await sendResendEmail({
          to: body.email,
          subject: 'Welcome to the Desi Flavors Hub Newsletter!',
          html: `<h2>Thank you for subscribing!</h2><p>We'll keep you updated with our latest news and offers.</p>`
        });
      }
      return new Response(JSON.stringify({ subscriber: data[0] || null }), { headers: corsHeaders });
    } else {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), { headers: corsHeaders, status: 405 });
    }
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { headers: corsHeaders, status: 500 });
  }
}); 