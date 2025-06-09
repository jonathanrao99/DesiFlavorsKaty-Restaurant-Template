import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Phone, User, MessageSquare, Calendar, Check, AlertCircle, ArrowRight } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

const ContactForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
    event_type: 'general',
    subscribe_newsletter: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus({ type: null, message: '' });

    try {
      // Save to Supabase
      const { error: supabaseError } = await supabase
        .from('contact_submissions')
        .insert([{
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          message: formData.message,
          event_type: formData.event_type,
          subscribe_newsletter: formData.subscribe_newsletter,
          created_at: new Date().toISOString()
        }]);

      if (supabaseError) throw supabaseError;

      // Prepare email content
      const now = new Date().toLocaleString();
      // Use public base URL for assets (falls back to current origin)
      const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL as string) || window.location.origin;
      // Customer email template
      const customerHtml = `
        <body style="margin:0;padding:0;background-color:#f4f4f4;">
          <div style="max-width:600px;margin:20px auto;background:#ffffff;border-radius:8px;overflow:hidden;font-family:Arial,sans-serif;">
            <div style="background:#d35400;padding:20px;text-align:center;">
              <img src="${baseUrl}/logo.png" alt="Desi Flavors Katy" width="200" style="display:block;margin:0 auto;" />
            </div>
            <div style="padding:20px;color:#333333;font-size:16px;line-height:1.5;">
              <p>Hi ${formData.name},</p>
              <p>Thanks for submitting your information on DesiFlavorsKaty.com! We've received your request and can't wait to spice up your day with our authentic Indian flavors.</p>
              <p>In the meantime, feel free to explore more about us:</p>
              <ul>
                <li><a href="${baseUrl}/menu" style="color:#d35400;text-decoration:none;">View Our Menu</a></li>
                <li><a href="https://instagram.com/desiflavorskaty" style="color:#d35400;text-decoration:none;">Follow Us on Social</a></li>
              </ul>
              <p>If you're planning a catering order or special event but haven't finalized the details yet, here are a few handy links to help you get started:</p>
              <ul>
                <li><a href="${baseUrl}/catering" style="color:#d35400;text-decoration:none;">Catering Guide</a></li>
                <li><a href="${baseUrl}/menu" style="color:#d35400;text-decoration:none;">Order Online</a></li>
                <li><a href="${baseUrl}/about" style="color:#d35400;text-decoration:none;">FAQs & Policies</a></li>
              </ul>
              <p>We're here to help every step of the way. If you have any questions or need assistance, visit our <a href="${baseUrl}/support" style="color:#d35400;text-decoration:none;">Support & FAQ</a> page or reply directly to this email.</p>
              <p>Thank you again for connecting with us. We look forward to serving you soon!</p>
              <p>Warm regards,<br/>The Desi Flavors Katy Team</p>
            </div>
            <div style="background:#f4f4f4;padding:20px;text-align:center;font-size:14px;color:#888888;">
              <div style="margin-bottom:10px;">
                <a href="https://instagram.com/desiflavorskaty" style="margin:0 5px;color:#888888;text-decoration:none;">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style="vertical-align:middle;"><path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2zm0 1.5A4.25 4.25 0 0 0 3.5 7.75v8.5A4.25 4.25 0 0 0 7.75 20.5h8.5A4.25 4.25 0 0 0 20.5 16.25v-8.5A4.25 4.25 0 0 0 16.25 3.5h-8.5zM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0 1.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7zm5.5-.75a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5z"/></svg>
                </a>
                <a href="https://www.facebook.com/profile.php?id=61574761892311" style="margin:0 5px;color:#888888;text-decoration:none;">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style="vertical-align:middle;"><path d="M22 12a10 10 0 1 0-11.5 9.9v-7h-2.4V12h2.4v-1.7c0-2.4 1.4-3.7 3.5-3.7 1 0 2 .1 2 .1v2.3h-1.2c-1.2 0-1.5.7-1.5 1.5V12h2.5l-.4 2.9h-2.1v7A10 10 0 0 0 22 12z"/></svg>
                </a>
                <a href="https://x.com/desiflavorskaty" style="margin:0 5px;color:#888888;text-decoration:none;">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style="vertical-align:middle;"><path d="M23 3a10.9 10.9 0 0 1-3.1.9A4.9 4.9 0 0 0 22.4.4a9.9 9.9 0 0 1-3.1 1.2A4.9 4.9 0 0 0 16.6 0c-2.7 0-4.9 2.2-4.9 4.9 0 .4 0 .8.1 1.1A13.9 13.9 0 0 1 1.7 1.2a4.9 4.9 0 0 0-.7 2.4c0 1.7.9 3.2 2.3 4.1A4.9 4.9 0 0 1 .9 7v.1c0 2.4 1.7 4.4 4 4.8a4.9 4.9 0 0 1-2.2.1 4.9 4.9 0 0 0 4.6 3.4A9.9 9.9 0 0 1 0 18.5a14 14 0 0 0 7.6 2.2c9.1 0 14.1-7.5 14.1-14.1l-.1-.6A10 10 0 0 0 23 3z"/></svg>
                </a>
                <a href="https://www.youtube.com/@desiflavorskaty" style="margin:0 5px;color:#888888;text-decoration:none;">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style="vertical-align:middle;"><path d="M23.5 6.2s-.2-1.7-.8-2.4c-.8-.8-1.7-.8-2.1-.9C17.4 2.5 12 2.5 12 2.5h0s-5.4 0-8.6.4c-.4 0-1.3.1-2.1.9-.6.7-.8 2.4-.8 2.4S0 8.1 0 9.9v4.3c0 1.8.2 3.7.2 3.7s.2 1.7.8 2.4c.8.8 1.9.8 2.4.9 1.7.2 7.3.3 7.3.3s5.4 0 8.6-.4c.4 0 1.3-.1 2.1-.9.6-.7.8-2.4.8-2.4s.2-1.9.2-3.7V9.9c0-1.8-.2-3.7-.2-3.7zM9.8 15.6V8.4l6.3 3.6-6.3 3.6z"/></svg>
                </a>
              </div>
              <p style="margin:4px 0;">Desi Flavors Katy | 1989 North Fry Rd, Katy, TX 77449 | (346)-824-4212</p>
              <p style="margin:4px 0;"><a href="${baseUrl}" style="color:#d35400;text-decoration:none;font-weight:bold;">desiflavorskaty.com</a></p>
            </div>
          </div>
        </body>
      `;
      const customerText = `
Hi ${formData.name},

Thanks for submitting your information on DesiFlavorsKaty.com! We've received your request and can't wait to spice up your day with our authentic Indian flavors.

In the meantime, feel free to explore more about us:

View Our Menu: https://desiflavorskaty.com/menu
Follow Us on Social: https://instagram.com/desiflavorskaty

If you're planning a catering order or special event but haven't finalized the details yet, here are a few handy links to help you get started:

Catering Guide: https://desiflavorskaty.com/catering
Order Online: https://desiflavorskaty.com/menu

FAQs & Policies: https://desiflavorskaty.com/about


We're here to help every step of the way. If you have any questions or need assistance, visit our Support & FAQ page: https://desiflavorskaty.com/support or reply directly to this email.

Thank you again for connecting with us. We look forward to serving you soon!

Warm regards,
The Desi Flavors Katy Team

Desi Flavors Katy
1989 North Fry Rd, Katy, TX 77449
(346)-824-4212 · https://desiflavorskaty.com
      `;
      // Send customer email
      await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: formData.email,
          subject: 'Thanks for reaching out to Desi Flavors Katy',
          html: customerHtml,
          text: customerText
        })
      });
      // Admin email template
      const adminHtml = `
        <p>Hello Desi Flavors Katy Team,</p>
        <p>You've just received a new response from the contact form on your website. Details are as follows:</p>
        <ul>
          <li><strong>Submission Date:</strong> ${now}</li>
          <li><strong>Name:</strong> ${formData.name}</li>
          <li><strong>Email:</strong> ${formData.email}</li>
          <li><strong>Phone:</strong> ${formData.phone || 'N/A'}</li>
          <li><strong>Event Type:</strong> ${formData.event_type}</li>
          <li><strong>Subscribed to Newsletter:</strong> ${formData.subscribe_newsletter ? 'Yes' : 'No'}</li>
          <li><strong>Message:</strong><br/>${formData.message}</li>
        </ul>
      `;
      const adminText = `
Hello Desi Flavors Katy Team,

You've just received a new response from the contact form on your website. Details are as follows:

Submission Date: ${now}
Name: ${formData.name}
Email: ${formData.email}
Phone: ${formData.phone || 'N/A'}
Event Type: ${formData.event_type}
Subscribed to Newsletter: ${formData.subscribe_newsletter ? 'Yes' : 'No'}
Message:
${formData.message}
      `;
      await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: 'info@desiflavorskaty.com',
          subject: 'New Submission by ' + formData.name,
          html: adminHtml,
          text: adminText
        })
      });

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
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:border-desi-orange focus:ring-2 focus:ring-desi-orange/20 transition-all bg-white"
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
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:border-desi-orange focus:ring-2 focus:ring-desi-orange/20 transition-all bg-white"
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
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:border-desi-orange focus:ring-2 focus:ring-desi-orange/20 transition-all bg-white"
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
            className="relative group"
          >
            <label htmlFor="eventType" className="block text-sm font-medium text-gray-700 mb-1">Event Type</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-desi-orange/80 group-focus-within:text-desi-orange transition-colors z-10" size={20} />
              <select
                id="eventType"
                name="event_type"
                value={formData.event_type}
                onChange={handleChange}
                className="w-full pl-10 pr-10 py-3 rounded-lg border border-gray-200 focus:border-desi-orange focus:ring-2 focus:ring-desi-orange/20 transition-all appearance-none bg-white"
              >
                <option value="general">General Inquiry</option>
                <option value="private">Private Event</option>
                <option value="corporate">Corporate Event</option>
                <option value="festival">Festival Catering</option>
              </select>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
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
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:border-desi-orange focus:ring-2 focus:ring-desi-orange/20 transition-all bg-white"
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
          className="flex items-start space-x-3"
        >
          <input
            type="checkbox"
            id="subscribe_newsletter"
            name="subscribe_newsletter"
            checked={formData.subscribe_newsletter}
            onChange={(e) => setFormData(prev => ({ ...prev, subscribe_newsletter: e.target.checked }))}
            className="mt-1 h-4 w-4 rounded border-gray-300 text-desi-orange focus:ring-desi-orange"
          />
          <label htmlFor="subscribe_newsletter" className="text-sm text-gray-600">
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
