'use client';
import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Clock, Star, Instagram, Facebook, Youtube } from 'lucide-react';
import { useState } from 'react';

const About = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Simple animation variants
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-8"
          >
            <h1 className="text-5xl md:text-6xl font-bold text-gray-800 mb-6">
              Our Story
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover the passion, tradition, and flavors that make Desi Flavors Hub 
              the premier destination for authentic Indian cuisine in Katy, Texas.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
            variants={fadeInUp}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              className="space-y-6"
            >
              <h2 className="text-4xl font-bold text-gray-800">Our Journey</h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                Founded with a deep love for authentic Indian flavors, Desi Flavors Hub 
                began as a dream to bring the rich culinary traditions of India to the 
                heart of Katy, Texas. Our journey started in the kitchens of our 
                grandmothers, where we learned the secrets of perfect spice blends, 
                traditional cooking methods, and the art of creating memorable dining experiences.
              </p>
              <p className="text-lg text-gray-600 leading-relaxed">
                Today, we continue to honor those traditions while embracing modern 
                culinary innovation, ensuring every dish tells a story of heritage, 
                passion, and excellence.
              </p>
            </motion.div>
            
            <motion.div
              variants={fadeInUp}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              className="relative"
            >
              <img
                src="/Menu_Images/chicken-dum-biryani.jpg"
                alt="Traditional Indian Biryani"
                className="rounded-2xl shadow-2xl w-full h-96 object-cover"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 px-4 bg-orange-50">
        <div className="container mx-auto text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-4xl font-bold text-gray-800 mb-12"
          >
            Our Values
          </motion.h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Authenticity",
                description: "Every dish is prepared using traditional recipes and authentic spices imported directly from India.",
                icon: "🌶️"
              },
              {
                title: "Quality",
                description: "We source only the finest ingredients and maintain the highest standards in food preparation.",
                icon: "⭐"
              },
              {
                title: "Community",
                description: "Building lasting relationships with our customers and becoming an integral part of the Katy community.",
                icon: "🤝"
              }
            ].map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="bg-white p-8 rounded-2xl shadow-lg"
              >
                <div className="text-4xl mb-4">{value.icon}</div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </motion.div>
            ))}
            </div>
        </div>
      </section>

      {/* Contact & Visit Section */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-4xl font-bold text-gray-800 mb-12"
          >
            Visit Us
          </motion.h2>
          
          <div className="grid md:grid-cols-2 gap-12 max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-center space-x-3">
                <MapPin className="w-6 h-6 text-orange-500" />
                <span className="text-lg text-gray-700">1989 North Fry Rd, Katy, TX 77449</span>
              </div>
              
              <div className="flex items-center justify-center space-x-3">
                <Phone className="w-6 h-6 text-orange-500" />
                <span className="text-lg text-gray-700">+1 (346) 824-4212</span>
              </div>
              
              <div className="flex items-center justify-center space-x-3">
                <Mail className="w-6 h-6 text-orange-500" />
                <span className="text-lg text-gray-700">info@desiflavorskaty.com</span>
              </div>
              
              <div className="flex items-center justify-center space-x-3">
                <Clock className="w-6 h-6 text-orange-500" />
                <span className="text-lg text-gray-700">Open Daily 11:00 AM - 10:00 PM</span>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Follow Us</h3>
              <div className="flex justify-center space-x-6">
                <a href="#" className="text-orange-500 hover:text-orange-600 transition-colors">
                  <Instagram className="w-8 h-8" />
                </a>
                <a href="#" className="text-orange-500 hover:text-orange-600 transition-colors">
                  <Facebook className="w-8 h-8" />
                </a>
                <a href="#" className="text-orange-500 hover:text-orange-600 transition-colors">
                  <Youtube className="w-8 h-8" />
                </a>
              </div>
              
              <div className="mt-8">
                <h4 className="text-xl font-semibold text-gray-800 mb-3">Customer Reviews</h4>
                <div className="flex items-center justify-center space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="w-6 h-6 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mt-2">4.8/5 from 500+ reviews</p>
                </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
