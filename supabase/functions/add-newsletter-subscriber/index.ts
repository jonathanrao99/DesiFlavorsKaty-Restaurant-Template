import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};

async function addToResendContacts(email: string, name: string) {
  const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
  if (!RESEND_API_KEY) throw new Error('Missing RESEND_API_KEY');
  
  console.log('Starting newsletter subscription for:', { email, name });
  
  try {
    // First, let's test if we can access the Resend API at all
    const testRes = await fetch('https://api.resend.com/audiences', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Test API response status:', testRes.status);
    
    if (!testRes.ok) {
      const errorText = await testRes.text();
      console.log('API test error:', errorText);
      throw new Error(`Resend API test failed: ${errorText}`);
    }
    
    const audiences = await testRes.json();
    console.log('Available audiences:', audiences);
    
    // Find or create our audience
    const audienceName = 'Desi Flavors Newsletter';
    let audienceId = null;
    
    // Look for existing audience
    for (const audience of audiences.data || []) {
      if (audience.name === audienceName) {
        audienceId = audience.id;
        console.log('Found existing audience:', audienceId);
        break;
      }
    }
    
    // Create audience if not found
    if (!audienceId) {
      console.log('Creating new audience:', audienceName);
      const createRes = await fetch('https://api.resend.com/audiences', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: audienceName })
      });
      
      console.log('Create audience status:', createRes.status);
      
      if (!createRes.ok) {
        const errorText = await createRes.text();
        console.log('Create audience error:', errorText);
        throw new Error(`Failed to create audience: ${errorText}`);
      }
      
      const newAudience = await createRes.json();
      audienceId = newAudience.id;
      console.log('Created audience with ID:', audienceId);
    }
    
    // Now add the contact using the correct API endpoint
    const firstName = name.split(' ')[0] || name;
    const lastName = name.split(' ').slice(1).join(' ') || '';
    
    // Use the audience endpoint to add contacts
    const contactData = {
      audience: [{
        email: email,
        firstName: firstName,
        lastName: lastName,
        subscribed: true
      }]
    };
    
    console.log('Adding contact with data:', contactData);
    
    const contactRes = await fetch(`https://api.resend.com/audiences/${audienceId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(contactData)
    });
    
    console.log('Contact response status:', contactRes.status);
    
    if (!contactRes.ok) {
      const error = await contactRes.text();
      console.log('Contact error:', error);
      throw new Error(`Failed to add contact: ${error}`);
    }
    
    const result = await contactRes.json();
    console.log('Success! Contact added:', result);
    return result;
    
  } catch (error) {
    console.error('Error in addToResendContacts:', error);
    throw error;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), { 
        headers: corsHeaders, 
        status: 405 
      });
    }
    
    const body = await req.json();
    console.log('Received request:', body);
    
    if (!body.email || !body.name) {
      return new Response(JSON.stringify({ error: 'Missing email or name' }), { 
        headers: corsHeaders, 
        status: 400 
      });
    }
    
    const result = await addToResendContacts(body.email, body.name);
    return new Response(JSON.stringify({ success: true, result }), { 
      headers: corsHeaders 
    });
  } catch (error) {
    console.error('Function error:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: error.toString()
    }), { 
      headers: corsHeaders, 
      status: 500 
    });
  }
}); 