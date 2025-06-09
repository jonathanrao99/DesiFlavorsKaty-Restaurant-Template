import { Instagram, Facebook, Twitter, Youtube, MapPin, Clock, Phone, Mail, ExternalLink } from 'lucide-react';
import ContactForm from '../contact/ContactForm';
import { MotionDiv } from '../MotionDiv';
import { motion } from 'framer-motion';
import React from 'react';

const socialLinks = [
  {
    platform: 'Instagram',
    icon: Instagram,
    url: 'https://instagram.com/desiflavorskaty',
    color: 'hover:text-desi-orange'
  },
  {
    platform: 'Facebook',
    icon: Facebook,
    url: 'https://www.facebook.com/profile.php?id=61574761892311',
    color: 'hover:text-desi-orange'
  },
  {
    platform: 'Twitter',
    icon: Twitter,
    url: 'https://x.com/desiflavorskaty',
    color: 'hover:text-desi-orange'
  },
  {
    platform: 'TikTok',
    icon: () => (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
      </svg>
    ),
    url: 'https://www.tiktok.com/@desiflavorskaty?lang=en',
    color: 'hover:text-desi-orange'
  },
  {
    platform: 'YouTube',
    icon: Youtube,
    url: 'https://www.youtube.com/@desiflavorskaty',
    color: 'hover:text-desi-orange'
  }
];

const ConnectSection = () => {
  return (
    <section id="connect" className="py-12 bg-desi-black">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left Grid - Content */}
          <div className="space-y-8">
            <MotionDiv
              type="fadeIn"
              className="text-left"
            >
              <h2 className="text-4xl font-bold text-white mb-4">
                Connect With Us
              </h2>
              <p className="text-gray-300 max-w-2xl">
                Have questions about our menu, catering services, or want to know where we'll be next? 
                Reach out to us through any of the channels below.
              </p>
            </MotionDiv>

            <MotionDiv
              type="slideIn"
              delay={0.2}
              className="space-y-8"
            >
              {/* Contact Info */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="space-y-6"
              >
                <h3 className="text-xl font-display font-bold mb-6 text-white">Contact Information</h3>
                
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-desi-orange mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-white">Location</p>
                    <a 
                      href="https://maps.app.goo.gl/nWvCh23xWfzZfnL86" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-gray-300 hover:text-desi-orange transition-colors flex items-center gap-1 group"
                    >
                      <span>1989 North Fry Rd, Katy, TX 77449</span>
                      <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-desi-orange mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-white">Phone</p>
                    <a 
                      href="https://wa.me/13468244212" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-gray-300 hover:text-desi-orange transition-colors flex items-center gap-1 group"
                    >
                      <span>+1 (346) 824-4212</span>
                      <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-desi-orange mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-white">Email</p>
                    <a 
                      href="mailto:desiflavorskaty@gmail.com" 
                      className="text-gray-300 hover:text-desi-orange transition-colors flex items-center gap-1 group"
                    >
                      <span>desiflavorskaty@gmail.com</span>
                      <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-desi-orange mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-white">Hours</p>
                    <p className="text-gray-300">Monday - Sunday: </p>
                    <p className="text-gray-300">1:00 PM - 12:00 AM</p>
                  </div>
                </div>
              </motion.div>

              {/* Social Media Links */}
              <div className="pt-8">
                <h3 className="text-xl font-semibold text-white mb-6">Follow Us</h3>
                <div className="flex flex-wrap gap-8">
                  {socialLinks.map((social, index) => (
                    <motion.a
                      key={social.platform}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`text-white hover:text-desi-orange transition-colors`}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      {React.isValidElement(social.icon) ? social.icon : <social.icon className="w-6 h-6" />}
                    </motion.a>
                  ))}
                </div>
              </div>
            </MotionDiv>
          </div>

          {/* Right Grid - Contact Form */}
          <MotionDiv
            type="slideIn"
            delay={0.4}
            className="h-full"
          >
            <ContactForm />
          </MotionDiv>
        </div>
      </div>
    </section>
  );
};

export default ConnectSection;

