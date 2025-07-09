'use client';
import Link from 'next/link';
import { Facebook, Instagram, Youtube, Mail, MapPin, Clock, Send } from 'lucide-react';

// Custom X icon component
const XIcon = ({ size = 20 }: { size?: number }) => (
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
  >
    <path d="M4 4l11.733 16h4.267l-11.733 -16z" />
    <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772" />
  </svg>
);

const Footer = () => {
  const currentYear = new Date().getFullYear();
  return <footer className="bg-desi-black text-white pt-12 pb-2">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Logo and Description */}
          <div className="space-y-4">
            <div className="max-w-xs space-y-2">
              <p className="text-gray-300">
                Join our newsletter for the latest updates and exclusive offers.
              </p>
              <form className="mt-2">
                <div className="relative w-64">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="w-full px-4 py-2 pr-12 bg-transparent border border-white-500 rounded-xl text-white placeholder-white-400 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="absolute inset-y-0 right-3 flex items-center justify-center text-white-400 hover:text-desi-orange focus:outline-none"
                  >
                    <Send size={20} />
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-display font-medium mb-4 text-desi-orange">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/" className="text-gray-300 hover:text-desi-orange transition-colors duration-200">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/menu" className="text-gray-300 hover:text-desi-orange transition-colors duration-200">
                  Menu
                </Link>
              </li>
              <li>
                <Link href="/catering" className="text-gray-300 hover:text-desi-orange transition-colors duration-200">
                  Catering
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-gray-300 hover:text-desi-orange transition-colors duration-200">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-300 hover:text-desi-orange transition-colors duration-200">
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-display font-medium mb-4 text-desi-orange">Get in Touch</h3>
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-center">
                <MapPin size={18} className="text-desi-orange mr-2 flex-shrink-0" />
                <a 
                  href="https://maps.app.goo.gl/JURVBywvbtw7Qgja7" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-desi-orange transition-colors"
                >
                  1989 North Fry RD, Katy, Texas, 77449
                </a>
              </li>
              <li className="flex items-center">
                <Mail size={18} className="text-desi-orange mr-2 flex-shrink-0" />
                <a href="mailto:desiflavorskaty@gmail.com" className="hover:text-desi-orange transition-colors">desiflavorskaty@gmail.com</a>
              </li>
              <li className="flex items-center">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="18" 
                  height="18" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                  className="text-desi-orange mr-2 flex-shrink-0"
                >
                  <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" />
                  <path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1Z" />
                  <path d="M14 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1Z" />
                  <path d="M9.5 13.5c.5 1 1.5 1 2.5 1s2-.5 2.5-1" />
                </svg>
                <a href="https://wa.me/13468244212" className="hover:text-desi-orange transition-colors">+1 (346) 824-4212</a>
              </li>
              <li className="flex items-center">
                <Clock size={18} className="text-desi-orange mr-2 flex-shrink-0" />
                <span>
                  Monday - Sunday<br/>
                  5:00 PM - 1:00 AM
                </span>
              </li>
            </ul>
          </div>

          {/* Follow Us */}
          <div>
            <h3 className="text-lg font-display font-medium mb-4 text-desi-orange">Follow Us</h3>
            <div className="flex space-x-4">
                <a href="https://instagram.com/desiflavorskaty" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-desi-orange transition-colors" aria-label="Instagram">
                  <Instagram size={20} />
                </a>
                <a href="https://www.facebook.com/profile.php?id=61574761892311" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-desi-orange transition-colors" aria-label="Facebook">
                  <Facebook size={20} />
                </a>
                <a href="https://x.com/desiflavorskaty" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-desi-orange transition-colors" aria-label="X (formerly Twitter)">
                  <XIcon size={20} />
                </a>
              <a href="https://www.tiktok.com/@desiflavorskaty?lang=en" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-desi-orange transition-colors" aria-label="TikTok">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                </svg>
              </a>
                <a href="https://www.youtube.com/@desiflavorskaty" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-desi-orange transition-colors" aria-label="YouTube">
                  <Youtube size={20} />
                </a>
            </div>
          </div>
        </div>

        <div className="text-center mt-6 mb-2 md:mb-2">
          <Link href="/" className="inline-block">
            <h2 className="flex items-center justify-center w-[85vw] mx-auto">
              <span className="font-samarkan text-[10vw] md:text-[12vw] text-desi-orange leading-none">Desi </span>
              <span className="font-display text-[6vw] md:text-[8vw] font-bold ml-2 tracking-tight text-white leading-none">FlavorsKaty</span>
            </h2>
          </Link>
        </div>
        <div className="border-t border-gray-800 mt-1 pt-2 pb-4 flex flex-col md:flex-row justify-between items-center text-gray-400 text-sm">
          <p className="mb-1 md:mb-0">Designed by Jonathan Thota</p>
          <p>© {currentYear} Desi Flavors Katy. All rights reserved.</p>
        </div>
      </div>
    </footer>;
};
export default Footer;
