'use client';

import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Clock, ChevronDown } from 'lucide-react';
import Image from 'next/image';

const AboutPage = () => {
  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 }
  };

  const fadeInUpDelay = (delay: number) => ({
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6, delay }
  });

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[70vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/30 z-10"></div>
        <motion.div 
          className="absolute inset-0 z-0 will-change-transform"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          <Image
            src="/Truck/truck-1.jpg"
            alt="Desi Flavors Food Truck"
            fill
            className="object-cover transform-gpu"
            priority
          />
        </motion.div>
        <div className="relative z-20 container mx-auto px-4 max-w-5xl">
          <motion.div 
            className="text-left text-white"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h1 className="text-4xl md:text-6xl font-display font-bold mb-6">
              <span className="block text-white mb-2">The Story Behind</span>
              <span className="bg-gradient-to-r from-desi-orange to-yellow-500 text-transparent bg-clip-text">Our Food Truck</span>
            </h1>
            <p className="text-lg md:text-xl lg:text-2xl font-merriweather text-white leading-relaxed max-w-10xl mb-8">
              Katy's home for bold Indian flavors and timeless recipes.
            </p>
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex text-desi-orange items-center cursor-pointer">
                <span className="mr-2">Scroll to explore</span>
                <ChevronDown className="w-5 h-5" />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Our Culinary Journey Section */}
      <section className="py-20 bg-gradient-to-b from-transparent via-orange-50 to-white relative overflow-hidden">
        {/* Decorative Elements */}
        <Image
          src="/Ingredients/mint-removebg-preview.png"
          alt="Mint"
          width={80}
          height={80}
          className="absolute top-8 left-8 opacity-10 rotate-12 select-none pointer-events-none z-0"
        />
        <Image
          src="/Ingredients/cinamon-removebg-preview.png"
          alt="Cinnamon"
          width={90}
          height={90}
          className="absolute bottom-8 right-8 opacity-10 -rotate-12 select-none pointer-events-none z-0"
        />
        <svg className="absolute right-1 top-1/4 w-40 h-40 opacity-10 z-0" viewBox="0 0 100 100" fill="none">
          <circle cx="50" cy="50" r="48" stroke="#FFD700" strokeWidth="4" fill="none" />
          <path d="M50 10 Q60 30 50 50 Q40 70 50 90" stroke="#FFD700" strokeWidth="2" fill="none" />
        </svg>
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-gradient-to-br from-yellow-200/30 via-yellow-100/10 to-orange-100/0 blur-2xl opacity-40 z-0"></div>

        <div className="container mx-auto px-4 max-w-6xl relative z-10">
          <motion.div className="flex flex-col items-center mb-12 text-center" {...fadeInUp}>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-4">Our Culinary Journey</h2>
            <div className="h-1 w-20 bg-desi-orange mb-6"></div>
            <p className="max-w-4xl text-gray-600 text-lg">Authentic Indian flavors, straight from our kitchen to Katy.</p>
          </motion.div>
          
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="order-2 md:order-1">
              <h3 className="text-xl md:text-2xl font-display font-semibold mb-6">From Home Kitchen to Food Truck</h3>
              <p className="text-gray-800 mb-6 text-lg md:text-xl">
                When we moved to Katy, we noticed something was missing - authentic Indian cuisine that reminded us of home. That's when we decided to bring our passion for Indian food to this vibrant community.
              </p>
              <p className="text-gray-800 text-lg md:text-xl">
                In February 2025, we launched <span className="font-bold"><span className="text-desi-orange font-samarkan text-2xl">Desi</span> Flavors Katy</span> with a simple mission: to serve exceptional Indian dishes that combine traditional recipes with modern culinary expertise. Every recipe we serve is a piece of our heritage, crafted with the same love and care that has been passed down through generations.
              </p>
            </div>
            <div className="order-1 md:order-2">
              <div className="relative">
                <Image
                  src="/Truck/truck-3.jpg"
                  alt="Desi Flavors Food Preparation"
                  width={600}
                  height={400}
                  className="w-full h-auto rounded-xl shadow-lg"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Food Philosophy Section */}
      <section className="py-20 bg-gradient-to-b from-transparent via-orange-50 to-white relative overflow-hidden">
        {/* Decorative circles */}
        <motion.div 
          className="absolute top-0 left-0 w-24 h-24 bg-desi-orange/5 rounded-full -translate-x-1/2 -translate-y-1/2"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 3, repeat: Infinity }}
        />
        <motion.div 
          className="absolute bottom-0 right-0 w-48 h-48 bg-desi-orange/5 rounded-full translate-x-1/3 translate-y-1/3"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 4, repeat: Infinity }}
        />
        <div className="absolute top-1/4 left-10 w-12 h-12 bg-desi-orange/10 rounded-full" />
        <div className="absolute left-10 bottom-20 w-3 h-3 rounded-full bg-desi-orange/40" />
        <div className="absolute right-1/3 top-40 w-4 h-4 rounded-full bg-desi-orange/30" />

        <div className="container mx-auto px-4 max-w-6xl relative">
          <motion.div className="flex flex-col items-center mb-12 text-center" {...fadeInUp}>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-4">Our Food Philosophy</h2>
            <div className="h-1 w-20 bg-desi-orange mb-6"></div>
            <p className="max-w-3xl text-gray-600 text-lg">
              The core values that guide every dish we prepare, ensuring an authentic and memorable dining experience
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <motion.div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all" {...fadeInUpDelay(0.1)}>
              <div className="h-2 w-full bg-gradient-to-r from-orange-500 to-orange-600"></div>
              <div className="p-8">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mr-4">
                    <Image src="/Ingredients/clove-removebg-preview.png" alt="Authentic Recipes" width={24} height={24} className="opacity-70" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Authentic Recipes</h3>
                </div>
                <p className="text-gray-700">
                  We honor traditional recipes passed down through generations, ensuring authentic flavors in every bite.
                </p>
              </div>
            </motion.div>

            <motion.div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all" {...fadeInUpDelay(0.2)}>
              <div className="h-2 w-full bg-gradient-to-r from-green-500 to-green-600"></div>
              <div className="p-8">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mr-4">
                    <Image src="/Ingredients/mint-removebg-preview.png" alt="Premium Ingredients" width={24} height={24} className="opacity-70" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Premium Ingredients</h3>
                </div>
                <p className="text-gray-700">
                  We source the finest ingredients and authentic spices, maintaining the highest standards of quality.
                </p>
              </div>
            </motion.div>

            <motion.div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all" {...fadeInUpDelay(0.3)}>
              <div className="h-2 w-full bg-gradient-to-r from-red-500 to-red-600"></div>
              <div className="p-8">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mr-4">
                    <Image src="/Ingredients/cinamon-removebg-preview.png" alt="Culinary Craftsmanship" width={24} height={24} className="opacity-70" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Culinary Craftsmanship</h3>
                </div>
                <p className="text-gray-700">
                  Our dishes blend time-honored techniques with modern expertise for a unique dining experience.
                </p>
              </div>
            </motion.div>
          </div>

          {/* Quality Commitment */}
          <div className="md:flex">
            <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
              <h3 className="text-3xl font-bold font-display mb-6">Our Quality Commitment</h3>
              <p className="text-gray-900 mb-6 text-lg">
                Every dish at Desi Flavors is prepared with care, using hand-selected ingredients and authentic spices to create the perfect balance of flavors.
              </p>
              <ul className="space-y-4 font-bold">
                <li className="flex items-center text-gray-700">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-desi-orange mr-3 flex-shrink-0">
                    <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"></path>
                  </svg>
                  <span>House-made masala blends crafted daily</span>
                </li>
                <li className="flex items-center text-gray-700">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-desi-orange mr-3 flex-shrink-0">
                    <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"></path>
                  </svg>
                  <span>Locally sourced vegetables for freshness</span>
                </li>
                <li className="flex items-center text-gray-700">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-desi-orange mr-3 flex-shrink-0">
                    <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"></path>
                  </svg>
                  <span>Halal certified meats</span>
                </li>
                <li className="flex items-center text-gray-700">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-desi-orange mr-3 flex-shrink-0">
                    <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"></path>
                  </svg>
                  <span>No artificial preservatives or flavors</span>
                </li>
              </ul>
            </div>
            <div className="md:w-1/2 relative">
              <Image
                src="/Menu_Images/chicken-dum-biryani.jpg"
                alt="Signature Biryani"
                width={600}
                height={600}
                className="w-full h-full object-cover rounded-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Meet Our Team Section */}
      <section className="pt-8 pb-16 md:pt-12 md:pb-20 lg:pt-16 lg:pb-24 bg-gradient-to-b from-transparent via-orange-50 to-white relative overflow-hidden">
        {/* Decorative circles */}
        <motion.div 
          className="absolute top-0 left-0 w-24 h-24 bg-desi-orange/5 rounded-full -translate-x-1/2 -translate-y-1/2"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 3, repeat: Infinity }}
        />
        <motion.div 
          className="absolute bottom-0 right-0 w-48 h-48 bg-desi-orange/5 rounded-full translate-x-1/3 translate-y-1/3"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 4, repeat: Infinity }}
        />
        <div className="absolute top-1/4 right-10 w-12 h-12 bg-desi-orange/10 rounded-full" />
        <div className="absolute left-10 bottom-20 w-3 h-3 rounded-full bg-desi-orange/40" />
        <div className="absolute right-1/3 top-40 w-4 h-4 rounded-full bg-desi-orange/30" />

        <div className="container mx-auto px-4 max-w-6xl relative">
          <motion.div className="flex flex-col items-center mb-12 text-center" {...fadeInUp}>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-4">Meet Our Team</h2>
            <div className="h-1 w-20 bg-desi-orange mb-6"></div>
            <p className="max-w-3xl text-gray-600 text-lg">
              The passionate individuals behind Desi Flavors who bring authentic Indian cuisine to Katy
            </p>
          </motion.div>

          <motion.div className="mt-16 flex justify-center" {...fadeInUp}>
            <div className="max-w-2xl mx-auto">
              <motion.div 
                className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col items-center min-h-[600px] mb-10"
                {...fadeInUpDelay(0.2)}
              >
                <div className="w-72 h-72 rounded-full overflow-hidden mt-8 mb-4 border-4 border-desi-orange/20">
                  <Image
                    src="/Truck/IMG-20250610-WA0005.jpg"
                    alt="Founders"
                    width={288}
                    height={288}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="px-6 pt-6 pb-4 text-center">
                  <h3 className="text-xl font-display font-bold text-desi-black mb-1">Jaladevi & Venu Thota</h3>
                  <p className="text-desi-orange font-medium mb-3">Founders</p>
                  <p className="text-desi-black">
                    With over 20 years of experience in authentic Indian cuisine, Jaladevi brings her family recipes and culinary expertise to Desi Flavors. Venu manages the business operations and ensures every customer receives exceptional service. Together, their vision for authentic Indian flavors has made Desi Flavors a beloved destination for food enthusiasts in Katy.
                  </p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="py-16 bg-gradient-to-b from-transparent via-orange-50 to-white relative overflow-hidden">
        <div className="container mx-auto px-4 md:px-6 relative">
          <motion.div className="flex flex-col items-center mb-12 text-center" {...fadeInUp}>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-4">Our Gallery</h2>
            <div className="h-1 w-20 bg-desi-orange mb-6"></div>
            <p className="max-w-3xl text-gray-600 text-lg">
              A visual journey through our food truck, dishes, and memorable moments
            </p>
          </motion.div>

          <motion.div className="mt-16" {...fadeInUp}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <motion.div className="md:col-span-2 md:row-span-2 overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300" {...fadeInUpDelay(0.1)}>
                <Image
                  src="/Truck/truck-1.jpg"
                  alt="Desi Flavors Food Truck"
                  width={800}
                  height={600}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
              </motion.div>
              <motion.div className="overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300" {...fadeInUpDelay(0.2)}>
                <Image
                  src="/Truck/truck-2.jpg"
                  alt="Food Preparation"
                  width={400}
                  height={300}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
              </motion.div>
              <motion.div className="overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300" {...fadeInUpDelay(0.3)}>
                <Image
                  src="/Truck/truck-3.jpg"
                  alt="Customer Experience"
                  width={400}
                  height={300}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
              </motion.div>
              <motion.div className="overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300" {...fadeInUpDelay(0.4)}>
                <Image
                  src="/Truck/truck-4.jpg"
                  alt="Special Dishes"
                  width={400}
                  height={300}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
              </motion.div>
              <motion.div className="overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300" {...fadeInUpDelay(0.5)}>
                <Image
                  src="/Truck/truck-5.jpg"
                  alt="Food Truck Interior"
                  width={400}
                  height={300}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
              </motion.div>
              <motion.div className="overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300" {...fadeInUpDelay(0.6)}>
                <Image
                  src="/Truck/truck-old.png"
                  alt="Special Events"
                  width={400}
                  height={300}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Visit Our Food Truck Section */}
      <section className="py-20 bg-desi-black relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
        </div>
        
        <div className="container mx-auto px-4 max-w-6xl relative">
          <motion.div className="flex flex-col items-center mb-12 text-center" {...fadeInUp}>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">Visit Our Food Truck</h2>
            <div className="h-1 w-20 bg-desi-orange mb-6"></div>
            <p className="max-w-3xl text-gray-300 text-lg">
              Experience authentic Indian cuisine in the heart of Katy
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <motion.div className="space-y-6" {...fadeInUpDelay(0.2)}>
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
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <path d="M15 3h6v6"></path>
                      <path d="M10 14 21 3"></path>
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                    </svg>
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-desi-orange mt-1 flex-shrink-0" />
                <div>
                  <p className="font-medium text-white">Phone</p>
                  <a 
                    href="tel:+13468244212"
                    className="text-gray-300 hover:text-desi-orange transition-colors flex items-center gap-1 group"
                  >
                    <span>+1 (346) 824-4212</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <path d="M15 3h6v6"></path>
                      <path d="M10 14 21 3"></path>
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                    </svg>
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
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <path d="M15 3h6v6"></path>
                      <path d="M10 14 21 3"></path>
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                    </svg>
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-desi-orange mt-1 flex-shrink-0" />
                <div>
                  <p className="font-medium text-white">Hours</p>
                  <p className="text-gray-300">Monday - Sunday: </p>
                  <p className="text-gray-300">5:00 PM - 1:00 AM</p>
                </div>
              </div>

              <div className="pt-8">
                <h3 className="text-xl font-semibold text-white mb-6">Follow Us</h3>
                <div className="flex flex-wrap gap-8">
                  <a href="https://www.facebook.com/profile.php?id=61574761892311" target="_blank" rel="noopener noreferrer" className="text-white hover:text-desi-orange transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                    </svg>
                  </a>
                  <a href="https://instagram.com/desiflavorskaty" target="_blank" rel="noopener noreferrer" className="text-white hover:text-desi-orange transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                      <rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect>
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line>
                    </svg>
                  </a>
                  <a href="https://x.com/desiflavorskaty" target="_blank" rel="noopener noreferrer" className="text-white hover:text-desi-orange transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                      <path d="M4 4l11.733 16h4.267l-11.733 -16z"></path>
                      <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772"></path>
                    </svg>
                  </a>
                  <a href="https://www.tiktok.com/@desiflavorskaty?lang=en" target="_blank" rel="noopener noreferrer" className="text-white hover:text-desi-orange transition-colors">
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"></path>
                    </svg>
                  </a>
                  <a href="https://www.youtube.com/@desiflavorskaty" target="_blank" rel="noopener noreferrer" className="text-white hover:text-desi-orange transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                      <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"></path>
                      <path d="m10 15 5-3-5-3z"></path>
                    </svg>
                  </a>
                </div>
              </div>
            </motion.div>

            <motion.div className="space-y-8">
              <motion.div 
                className="bg-white rounded-lg shadow-md overflow-hidden"
                {...fadeInUpDelay(0.3)}
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
            </motion.div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default AboutPage;
