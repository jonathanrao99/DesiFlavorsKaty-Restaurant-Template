import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};

// Helper function to add delay
function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testResendAPI(email: string, name: string) {
  const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
  if (!RESEND_API_KEY) throw new Error('Missing RESEND_API_KEY');
  
  console.log('Testing Resend API with key:', RESEND_API_KEY.substring(0, 10) + '...');
  console.log('Adding contact:', { email, name });
  
  try {
    // Test 1: List audiences with rate limiting
    console.log('Step 1: Testing audience list...');
    let listRes;
    let retryCount = 0;
    const maxRetries = 5;
    
    while (retryCount < maxRetries) {
      try {
        listRes = await fetch('https://api.resend.com/audiences', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${RESEND_API_KEY}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log('List audiences status:', listRes.status);
        
        if (listRes.status === 429) {
          console.log(`Rate limited, waiting 1 second before retry ${retryCount + 1}...`);
          await delay(1000); // Wait 1 second for rate limit
          retryCount++;
          continue;
        }
        
        break; // Success, exit retry loop
      } catch (error) {
        console.log(`List attempt ${retryCount + 1} failed:`, error);
        retryCount++;
        if (retryCount >= maxRetries) throw error;
        await delay(1000);
      }
    }
    
    if (!listRes || !listRes.ok) {
      const errorText = await listRes?.text() || 'Unknown error';
      console.log('List audiences error:', errorText);
      throw new Error(`Failed to list audiences: ${errorText}`);
    }
    
    const audiences = await listRes.json();
    console.log('Audiences found:', audiences);
    
    // Add delay to respect rate limits
    await delay(600);
    
    // Test 2: Create or find audience
    const audienceName = 'Desi Flavors Newsletter';
    let audienceId = null;
    
    for (const audience of audiences.data || []) {
      if (audience.name === audienceName) {
        audienceId = audience.id;
        console.log('Found existing audience:', audienceId);
        break;
      }
    }
    
    if (!audienceId) {
      console.log('Creating new audience...');
      let createRes;
      retryCount = 0;
      
      while (retryCount < maxRetries) {
        try {
          createRes = await fetch('https://api.resend.com/audiences', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${RESEND_API_KEY}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name: audienceName })
          });
          
          console.log('Create audience status:', createRes.status);
          
          if (createRes.status === 429) {
            console.log(`Rate limited, waiting 1 second before retry ${retryCount + 1}...`);
            await delay(1000);
            retryCount++;
            continue;
          }
          
          break; // Success, exit retry loop
        } catch (error) {
          console.log(`Create attempt ${retryCount + 1} failed:`, error);
          retryCount++;
          if (retryCount >= maxRetries) throw error;
          await delay(1000);
        }
      }
      
      if (!createRes || !createRes.ok) {
        const errorText = await createRes?.text() || 'Unknown error';
        console.log('Create audience error:', errorText);
        throw new Error(`Failed to create audience: ${errorText}`);
      }
      
      const newAudience = await createRes.json();
      audienceId = newAudience.id;
      console.log('Created audience with ID:', audienceId);
      
      // Add delay to respect rate limits
      await delay(600);
    }
    
    // Test 3: Create contact with rate limiting
    console.log('Step 3: Creating contact...');
    const firstName = name.split(' ')[0] || name;
    const lastName = name.split(' ').slice(1).join(' ') || '';
    
    const contactData = {
      email: email,
      firstName: firstName,
      lastName: lastName,
      unsubscribed: false,
      audienceId: audienceId
    };
    
    console.log('Contact data:', contactData);
    
    let contactRes;
    retryCount = 0;
    
    while (retryCount < maxRetries) {
      try {
        contactRes = await fetch('https://api.resend.com/contacts', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${RESEND_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(contactData)
        });
        
        console.log('Create contact status:', contactRes.status);
        
        if (contactRes.status === 429) {
          console.log(`Rate limited, waiting 1 second before retry ${retryCount + 1}...`);
          await delay(1000);
          retryCount++;
          continue;
        }
        
        break; // Success, exit retry loop
      } catch (error) {
        console.log(`Contact attempt ${retryCount + 1} failed:`, error);
        retryCount++;
        if (retryCount >= maxRetries) throw error;
        await delay(1000);
      }
    }
    
    if (!contactRes || !contactRes.ok) {
      const error = await contactRes?.text() || 'Unknown error';
      console.log('Create contact error:', error);
      throw new Error(`Failed to create contact: ${error}`);
    }
    
    const result = await contactRes.json();
    console.log('Contact created successfully:', result);
    
    return { 
      success: true, 
      message: 'Successfully subscribed to newsletter',
      contact: result,
      audienceId: audienceId
    };
    
  } catch (error) {
    console.error('Error in testResendAPI:', error);
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
    
    const result = await testResendAPI(body.email, body.name);
    return new Response(JSON.stringify(result), { 
      headers: corsHeaders 
    });
  } catch (error) {
    console.error('Function error:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: error.toString(),
      stack: error.stack
    }), { 
      headers: corsHeaders, 
      status: 500 
    });
  }
}); 