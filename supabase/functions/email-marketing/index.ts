// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
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
  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), { headers: corsHeaders, status: 405 });
    }
    const body = await req.json();
    // Expects { to: [emails], subject, html }
    if (!body.to || !body.subject || !body.html) {
      return new Response(JSON.stringify({ error: 'Missing to, subject, or html' }), { headers: corsHeaders, status: 400 });
    }
    const results = [];
    for (const email of body.to) {
      results.push(await sendResendEmail({ to: email, subject: body.subject, html: body.html }));
    }
    return new Response(JSON.stringify({ results }), { headers: corsHeaders });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { headers: corsHeaders, status: 500 });
  }
}); 