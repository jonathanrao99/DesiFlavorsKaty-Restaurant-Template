import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { supabase } from '@/integrations/supabase/client';
import { logAnalyticsEvent } from '@/utils/loyaltyAndAnalytics';

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'subscribers') {
      const { data: subscribers, error } = await supabase
        .from('newsletter_subscribers')
        .select('*')
        .eq('active', true);

      if (error) throw error;

      return NextResponse.json({ 
        subscribers: subscribers || [],
        count: subscribers?.length || 0
      });
    }

    if (action === 'campaigns') {
      const { data: campaigns, error } = await supabase
        .from('newsletter_campaigns')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return NextResponse.json({ campaigns: campaigns || [] });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('Newsletter API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, email, subject, content, template } = body;

    if (action === 'subscribe') {
      // Add subscriber
      const { data, error } = await supabase
        .from('newsletter_subscribers')
        .upsert({ 
          email,
          active: true,
          subscribed_at: new Date().toISOString()
        });

      if (error) throw error;

      // Analytics: log newsletter signup
      await logAnalyticsEvent('newsletter_signup', { email });
      if (typeof window !== 'undefined') {
        window.gtag && window.gtag('event', 'newsletter_signup', { email });
        window.umami && window.umami('newsletter_signup', { email });
      }

      return NextResponse.json({ success: true, message: 'Subscribed successfully' });
    }

    if (action === 'send') {
      // Get all active subscribers
      const { data, error: subscribersError } = await supabase
        .from('newsletter_subscribers')
        .select('email')
        .eq('active', true);

      if (subscribersError) throw subscribersError;
      const subscribers: { email: string }[] = Array.isArray(data)
        ? data
            .filter(s => !('error' in s))
            .filter(s => typeof (s as any)?.email === 'string')
            .map(s => ({ email: (s as any).email as string }))
        : [];
      if (!subscribers.length) {
        return NextResponse.json({ error: 'No active subscribers found' }, { status: 400 });
      }

      // Create campaign record
      const { data: campaign, error: campaignError } = await supabase
        .from('newsletter_campaigns')
        .insert({
          subject,
          content,
          template,
          sent_at: new Date().toISOString(),
          recipient_count: subscribers.length
        })
        .select()
        .single();

      if (campaignError) throw campaignError;

      // Send emails
      const emailPromises = subscribers.map((subscriber) => 
        transporter.sendMail({
          from: process.env.FROM_EMAIL,
          to: subscriber.email,
          subject,
          html: content,
        })
      );

      await Promise.all(emailPromises);

      return NextResponse.json({ 
        success: true, 
        message: `Newsletter sent to ${subscribers.length} subscribers`,
        campaignId: campaign && 'id' in campaign ? campaign.id : undefined
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('Newsletter send error:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
} 