import { useState, Fragment } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Phone, User, MessageSquare, Check, AlertCircle, ArrowRight, Users, PartyPopper, ChevronDown, Download, HelpCircle } from 'lucide-react';
import { logAnalyticsEvent } from '@/utils/loyaltyAndAnalytics';
import { supabase } from '@/integrations/supabase/client';

const ContactForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
    event_type: 'general',
    subscribe_newsletter: false
  });
  // Dropdown options for Event Type
  const eventOptions = [
    { value: 'general', label: 'General Inquiry', icon: HelpCircle },
    { value: 'private', label: 'Private/Corporate Event', icon: Users },
    { value: 'festival', label: 'Festival Catering', icon: PartyPopper },
    { value: 'catering', label: 'Tray Ordering', icon: Download },
  ];
  const selectedEvent = eventOptions.find(opt => opt.value === formData.event_type) || eventOptions[0];
  const SelectedEventIcon = selectedEvent.icon;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNewsletterSignup = (email) => {
    logAnalyticsEvent('newsletter_signup', { email });
    if (typeof window !== 'undefined') {
      window.gtag && window.gtag('event', 'newsletter_signup', { email });
      window.umami && window.umami('newsletter_signup', { email });
    }
    // ...existing logic...
  };

  const handleContactFormSubmit = (formData) => {
    logAnalyticsEvent('contact_form_submitted', formData);
    if (typeof window !== 'undefined') {
      window.gtag && window.gtag('event', 'contact_form_submitted', formData);
      window.umami && window.umami('contact_form_submitted', formData);
    }
    // ...existing logic...
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus({ type: null, message: '' });

    try {
      // Send email via Supabase Edge Function (Resend)
      const now = new Date().toLocaleString();
      const eventLabel = selectedEvent.label;
      
      // Get the correct Supabase URL - use hardcoded URL since we know it
      const supabaseUrl = 'https://tpncxlxsggpsiswoownv.supabase.co';
      const timestamp = Date.now();
      const url = `${supabaseUrl}/functions/v1/send-email?t=${timestamp}`;
      
      console.log('Environment check:');
      console.log('- NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
      console.log('- Using hardcoded URL:', supabaseUrl);
      console.log('Full URL:', url);
      console.log('Making fetch request to:', url);
      
      const body = {
        to: 'desiflavorskaty@gmail.com',
        subject: 'New Submission by ' + formData.name,
        html: `
          <p>Hello Desi Flavors Katy Team,</p>
          <p>You've just received a new response from the contact form on your website. Details are as follows:</p>
          <ul>
            <li><strong>Submission Date:</strong> ${now}</li>
            <li><strong>Name:</strong> ${formData.name}</li>
            <li><strong>Email:</strong> ${formData.email}</li>
            <li><strong>Phone:</strong> ${formData.phone || 'N/A'}</li>
            <li><strong>Event Type:</strong> ${eventLabel}</li>
            <li><strong>Subscribed to Newsletter:</strong> ${formData.subscribe_newsletter ? 'Yes' : 'No'}</li>
            <li><strong>Message:</strong><br/>${formData.message}</li>
          </ul>
        `,
        // Add user details for confirmation email
        userEmail: formData.email,
        userName: formData.name,
        userPhone: formData.phone,
        eventType: eventLabel,
        userMessage: formData.message
      };
      
      console.log('Request body:', body);
      console.log('Request headers:', { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`
      });
      
      const res = await fetch(url, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify(body)
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error('Email send failed:', res.status, errorText);
        throw new Error(`Failed to send email: ${res.status} ${errorText}`);
      }
      
      // If user subscribed to newsletter, add them to Resend
      if (formData.subscribe_newsletter) {
        try {
          const newsletterUrl = `${supabaseUrl}/functions/v1/add-newsletter-subscriber?t=${timestamp}`;
          const newsletterRes = await fetch(newsletterUrl, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`
            },
            body: JSON.stringify({
              email: formData.email,
              name: formData.name
            })
          });
          
          if (!newsletterRes.ok) {
            const errorText = await newsletterRes.text();
            console.error('Newsletter subscription failed:', newsletterRes.status, errorText);
          } else {
            const newsletterResult = await newsletterRes.json();
            console.log('Newsletter subscription result:', newsletterResult);
            
            if (newsletterResult.alreadySubscribed) {
              console.log('User was already subscribed to newsletter');
            } else {
              console.log('Newsletter subscription successful');
            }
          }
        } catch (newsletterError) {
          console.error('Newsletter subscription error:', newsletterError);
          // Don't fail the main form submission if newsletter fails
        }
      }
      
      setSubmitStatus({
        type: 'success',
        message: 'Thank you for your message! We will get back to you soon.'
      });
      setFormData({
        name: '',
        email: '',
        phone: '',
        message: '',
        event_type: 'general',
        subscribe_newsletter: false
      });
    } catch (error) {
      console.error('Error submitting form:', error);
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      setSubmitStatus({
        type: 'error',
        message: 'There was an error submitting your message. Please try again later.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="relative max-w-3xl mx-auto"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-desi-orange/5 via-white to-transparent rounded-2xl"></div>
      
      <form onSubmit={handleSubmit} className="relative space-y-8 bg-white/90 p-8 md:p-10 rounded-2xl shadow-xl border border-gray-100">
        <div className="space-y-2 text-center mb-8">
          <h3 className="text-2xl font-display font-bold text-desi-black">Get in Touch</h3>
          <p className="text-gray-600">Fill out the form below and we'll get back to you as soon as possible.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="relative group"
          >
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-desi-orange/80 group-focus-within:text-desi-orange transition-colors z-10" size={20} />
              <input
                id="name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                required
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-desi-orange focus:ring-2 focus:ring-desi-orange/20 transition-all bg-white"
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="relative group"
          >
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-desi-orange/80 group-focus-within:text-desi-orange transition-colors z-10" size={20} />
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="john@example.com"
                required
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-desi-orange focus:ring-2 focus:ring-desi-orange/20 transition-all bg-white"
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="relative group"
          >
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-desi-orange/80 group-focus-within:text-desi-orange transition-colors z-10" size={20} />
              <input
                id="phone"
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="(123) 456-7890"
                required
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-desi-orange focus:ring-2 focus:ring-desi-orange/20 transition-all bg-white"
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
            className="relative group"
          >
            <label htmlFor="event_type" className="block text-sm font-medium text-gray-700 mb-1">Event Type</label>
            <div className="relative">
              <SelectedEventIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-desi-orange/80 group-focus-within:text-desi-orange transition-colors z-10" size={20} />
              <select
                id="event_type"
                name="event_type"
                value={formData.event_type}
                onChange={handleChange}
                className="w-full pl-10 pr-10 py-3 rounded-xl border border-gray-200 focus:border-desi-orange focus:ring-2 focus:ring-desi-orange/20 transition-all bg-white appearance-none cursor-pointer"
              >
                {eventOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  );
                })}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
          className="relative group"
        >
          <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Message</label>
          <div className="relative">
            <MessageSquare className="absolute left-3 top-3 text-desi-orange/80 group-focus-within:text-desi-orange transition-colors" size={20} />
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="How can we help you?"
              required
              rows={4}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-desi-orange focus:ring-2 focus:ring-desi-orange/20 transition-all bg-white"
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
          className="flex items-center space-x-2"
        >
          <input
            type="checkbox"
            id="subscribe_newsletter"
            name="subscribe_newsletter"
            checked={formData.subscribe_newsletter}
            onChange={(e) => setFormData(prev => ({ ...prev, subscribe_newsletter: e.target.checked }))}
            className="h-5 w-5 rounded border-gray-300 text-desi-orange focus:ring-desi-orange"
          />
          <label htmlFor="subscribe_newsletter" className="text-sm text-desi-black">
            Subscribe to our newsletter for exclusive promotions and special offers.
          </label>
        </motion.div>

        <AnimatePresence>
          {submitStatus.type && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`p-4 rounded-lg flex items-center gap-3 ${
                submitStatus.type === 'success' 
                  ? 'bg-green-50 text-green-800 border border-green-200' 
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}
            >
              {submitStatus.type === 'success' ? (
                <Check className="w-5 h-5 text-green-500" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-500" />
              )}
              <p className="text-sm font-medium">{submitStatus.message}</p>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.6 }}
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-desi-orange hover:bg-desi-orange/90 text-white px-8 py-4 rounded-full 
            font-medium transition-all shadow-sm hover:shadow-md transform hover:-translate-y-0.5
            disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
        >
          <span className="relative z-10 flex items-center justify-center gap-2">
            {isSubmitting ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                />
                Sending...
              </>
            ) : (
              <>
                Send Message
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-desi-orange to-desi-orange/80 opacity-0 group-hover:opacity-100 transition-opacity" />
        </motion.button>
      </form>
    </motion.div>
  );
};

export default ContactForm; 
