// VisitTruckSection for Home Page
// Matches About page's Visit Our Food Truck section, with Catering & Events style background
// Author: AI-generated for Desi Flavors Hub
import { MapPin, Phone, Mail, Clock, ExternalLink, Facebook, Instagram, Youtube } from 'lucide-react';
import { motion, useScroll } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';

const XIcon = ({ size = 20, className = "" }: { size?: number, className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    className={className}
  >
    <path d="M4 4l11.733 16h4.267l-11.733 -16z" />
    <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772" />
  </svg>
);

const VisitTruckSection = () => {
  const sectionRef = useRef(null);
  const [hasAnimated, setHasAnimated] = useState(false);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start end", "end start"] });

  useEffect(() => {
    const timer = setTimeout(() => { setHasAnimated(true); }, 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section ref={sectionRef} className="pt-8 pb-16 md:pt-12 md:pb-20 lg:pt-16 lg:pb-24 bg-gradient-to-b from-transparent via-orange-50 to-white relative overflow-hidden">
      {/* Decorative elements with parallax */}
      <motion.div 
        className="absolute top-0 left-0 w-24 h-24 bg-desi-orange/5 rounded-full -translate-x-1/2 -translate-y-1/2"
        style={{ y: scrollYProgress ? scrollYProgress.get() * 20 : 0 }}
      />
      <motion.div 
        className="absolute bottom-0 right-0 w-48 h-48 bg-desi-orange/5 rounded-full translate-x-1/3 translate-y-1/3"
        style={{ y: scrollYProgress ? -scrollYProgress.get() * 20 : 0 }}
      />
      <motion.div 
        className="absolute top-1/4 right-10 w-12 h-12 bg-desi-orange/10 rounded-full"
        style={{ y: scrollYProgress ? scrollYProgress.get() * 10 : 0 }}
      />
      <motion.div 
        className="absolute left-10 bottom-20 w-3 h-3 rounded-full bg-desi-orange/40"
        animate={hasAnimated ? { y: 0, opacity: 0.6 } : { y: [0, -15, 0], opacity: [0.4, 0.8, 0.4] }}
        transition={{ duration: 3, repeat: hasAnimated ? 0 : Infinity, ease: "easeInOut" }}
        viewport={{ once: true }}
      />
      <motion.div 
        className="absolute right-1/3 top-40 w-4 h-4 rounded-full bg-desi-orange/30"
        animate={hasAnimated ? { y: 0, opacity: 0.5 } : { y: [0, -20, 0], opacity: [0.3, 0.7, 0.3] }}
        transition={{ duration: 4, repeat: hasAnimated ? 0 : Infinity, ease: "easeInOut", delay: 1 }}
        viewport={{ once: true }}
      />
      <div className="container mx-auto px-4 max-w-6xl relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center mb-12 text-center"
        >
          <h2 className="text-3xl md:text-4xl font-display font-bold text-desi-black mb-4">
            Visit Our Food Truck
          </h2>
          <div className="h-1 w-20 bg-desi-orange mb-6"></div>
          <p className="max-w-3xl text-gray-800 text-lg">
            Experience authentic Indian cuisine in the heart of Katy
          </p>
        </motion.div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left Column - Contact Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-6"
          >
            <h3 className="text-xl font-display font-bold mb-6 text-desi-black">Contact Information</h3>
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-desi-orange mt-1 flex-shrink-0" />
              <div>
                <p className="font-medium text-desi-black">Location</p>
                <a 
                  href="https://maps.app.goo.gl/nWvCh23xWfzZfnL86" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-800 hover:text-desi-orange transition-colors flex items-center gap-1 group"
                >
                  <span>1989 North Fry Rd, Katy, TX 77449</span>
                  <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-desi-orange" />
                </a>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="w-5 h-5 text-desi-orange mt-1 flex-shrink-0" />
              <div>
                <p className="font-medium text-desi-black">Phone</p>
                <a 
                  href="tel:+13468244212"
                  className="text-gray-800 hover:text-desi-orange transition-colors flex items-center gap-1 group"
                >
                  <span>+1 (346) 824-4212</span>
                  <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-desi-orange" />
                </a>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-desi-orange mt-1 flex-shrink-0" />
              <div>
                <p className="font-medium text-desi-black">Email</p>
                <a 
                  href="mailto:desiflavorskaty@gmail.com"
                  className="text-gray-800 hover:text-desi-orange transition-colors flex items-center gap-1 group"
                >
                  <span>desiflavorskaty@gmail.com</span>
                  <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-desi-orange" />
                </a>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-desi-orange mt-1 flex-shrink-0" />
              <div>
                <p className="font-medium text-desi-black">Hours</p>
                <p className="text-gray-800">Monday - Sunday: </p>
                <p className="text-gray-800">5:00 PM - 1:00 AM</p>
              </div>
            </div>
            {/* Social Media Links */}
            <div className="pt-8">
              <h3 className="text-xl font-semibold text-desi-black mb-6">Follow Us</h3>
              <div className="flex flex-wrap gap-8">
                <a
                  href="https://www.facebook.com/profile.php?id=61574761892311"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-desi-black hover:text-desi-orange transition-colors"
                >
                  <Facebook className="w-6 h-6" />
                </a>
                <a
                  href="https://instagram.com/desiflavorskaty"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-desi-black hover:text-desi-orange transition-colors"
                >
                  <Instagram className="w-6 h-6" />
                </a>
                <a
                  href="https://x.com/desiflavorskaty"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-desi-black hover:text-desi-orange transition-colors"
                >
                  <XIcon className="w-6 h-6" />
                </a>
                <a
                  href="https://www.tiktok.com/@desiflavorskaty?lang=en"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-desi-black hover:text-desi-orange transition-colors"
                >
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                  </svg>
                </a>
                <a
                  href="https://www.youtube.com/@desiflavorskaty"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-desi-black hover:text-desi-orange transition-colors"
                >
                  <Youtube className="w-6 h-6" />
                </a>
              </div>
            </div>
          </motion.div>
          {/* Right Column - Map */}
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-lg shadow-md overflow-hidden"
            >
              <div className="h-[400px]">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d891.9331375493595!2d-95.72059509999999!3d29.7958849!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8641210045d45d63%3A0x3a9eebb90dacf13b!2sDesi%20Flavors%20(Food%20Truck)!5e0!3m2!1sen!2sus!4v1711409649044!5m2!1sen!2sus"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VisitTruckSection; 