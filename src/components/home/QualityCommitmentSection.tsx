import { Truck, Clock, MapPin, Star, Utensils, Tag, Quote, Calendar, Users, PartyPopper, ChefHat } from 'lucide-react';
import { motion } from 'framer-motion';
import Image from 'next/image';

const FoodTruckExperience = () => {
  const features = [
    {
      icon: <Truck className="w-8 h-8 text-desi-orange" />,
      title: "Mobile Dining",
      description: "Follow us to different locations across the city. Check our schedule to find us near you."
    },
    {
      icon: <Clock className="w-8 h-8 text-desi-orange" />,
      title: "Quick Service",
      description: "Fresh, hot meals served quickly without compromising on quality or taste."
    },
    {
      icon: <MapPin className="w-8 h-8 text-desi-orange" />,
      title: "Easy Access",
      description: "Conveniently located at popular spots, making authentic Indian food more accessible."
    },
    {
      icon: <Star className="w-8 h-8 text-desi-orange" />,
      title: "Customer Favorite",
      description: "Rated as one of the best food trucks in the city for authentic Indian cuisine."
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-white via-desi-cream/80 to-desi-cream relative overflow-hidden">
      {/* Background decoration */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="absolute inset-0 bg-gradient-to-br from-desi-orange/5 via-gray-50/50 to-transparent"
      />
      
      <div className="container mx-auto px-4 md:px-6 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4 text-desi-black">
            The Food Truck Experience
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Bringing authentic Indian flavors to your neighborhood with our mobile kitchen.
            Follow our journey as we serve delicious meals across the city.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 hover:scale-105"
            >
              <div className="flex justify-center mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-display font-semibold mb-2 text-center text-desi-black">
                {feature.title}
              </h3>
              <p className="text-gray-600 text-center">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Location Schedule */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <p className="text-gray-600 mb-4">
            Want to know where we'll be next?
          </p>
          <a
            href="/locations"
            className="inline-flex items-center justify-center px-6 py-3 bg-desi-orange hover:bg-desi-orange/90 text-white rounded-full 
              font-medium transition-all shadow-sm hover:shadow-md transform hover:-translate-y-0.5 transition-transform duration-300 hover:scale-105"
          >
            View Our Schedule
          </a>
        </motion.div>
      </div>
    </section>
  );
};

const SignatureDishes = () => {
  const dishes = [
    {
      name: "Chicken Biryani",
      description: "Fragrant basmati rice cooked with tender chicken pieces, aromatic spices, and fresh herbs.",
      image: "/lovable-uploads/0e914dde-161a-4d12-bd85-4803d3a6dca2.png",
      rating: 4.9,
      prepTime: "20 mins",
      isVegetarian: false
    },
    {
      name: "Butter Chicken",
      description: "Tender chicken pieces in a rich, creamy tomato sauce with aromatic spices.",
      image: "/lovable-uploads/0e914dde-161a-4d12-bd85-4803d3a6dca2.png",
      rating: 4.8,
      prepTime: "15 mins",
      isVegetarian: false
    },
    {
      name: "Paneer Tikka Masala",
      description: "Grilled paneer cubes in a creamy, spiced tomato sauce with fresh herbs.",
      image: "/lovable-uploads/0e914dde-161a-4d12-bd85-4803d3a6dca2.png",
      rating: 4.7,
      prepTime: "15 mins",
      isVegetarian: true
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-white via-desi-cream/80 to-desi-cream relative overflow-hidden">
      {/* Background decoration */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="absolute inset-0 bg-gradient-to-br from-desi-orange/5 via-gray-50/50 to-transparent"
      />
      
      <div className="container mx-auto px-4 md:px-6 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4 text-desi-black">
            Our Signature Dishes
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover our most popular dishes, crafted with authentic recipes and premium ingredients.
            Each dish tells a story of tradition and flavor.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {dishes.map((dish, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 group"
            >
              {/* Image Container */}
              <div className="relative h-48 overflow-hidden">
                <Image
                  src={dish.image}
                  alt={dish.name}
                  className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                  width={200}
                  height={200}
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                {/* Vegetarian Badge */}
                {dish.isVegetarian && (
                  <span className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    Veg
                  </span>
                )}
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-display font-semibold text-desi-black">
                    {dish.name}
                  </h3>
                  <div className="flex items-center text-yellow-400">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="ml-1 text-sm font-medium text-gray-600">{dish.rating}</span>
                  </div>
                </div>

                <p className="text-gray-600 mb-4">
                  {dish.description}
                </p>

                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    <span>{dish.prepTime}</span>
                  </div>
                  <div className="flex items-center">
                    <Utensils className="w-4 h-4 mr-1" />
                    <span>{dish.isVegetarian ? 'Vegetarian' : 'Non-Vegetarian'}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* View Menu Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <a
            href="/menu"
            className="inline-flex items-center justify-center px-8 py-4 bg-desi-orange hover:bg-desi-orange/90 text-white rounded-full 
              font-medium transition-all shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
          >
            View Full Menu
          </a>
        </motion.div>
      </div>
    </section>
  );
};

const DailySpecials = () => {
  const specials = [
    {
      name: "Lunch Combo",
      description: "Any biryani with a side of raita and a drink",
      price: "$12.99",
      originalPrice: "$15.99",
      time: "11:00 AM - 2:00 PM",
      days: "Mon-Fri",
      rating: 4.8
    },
    {
      name: "Family Pack",
      description: "Two biryanis, two curries, and four naans",
      price: "$29.99",
      originalPrice: "$35.99",
      time: "All Day",
      days: "Weekends",
      rating: 4.9
    },
    {
      name: "Student Special",
      description: "Any curry with rice and a drink",
      price: "$8.99",
      originalPrice: "$11.99",
      time: "2:00 PM - 5:00 PM",
      days: "Mon-Fri",
      rating: 4.7
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-white via-desi-cream/80 to-desi-cream relative overflow-hidden">
      {/* Background decoration */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="absolute inset-0 bg-gradient-to-br from-desi-orange/5 via-gray-50/50 to-transparent"
      />
      
      <div className="container mx-auto px-4 md:px-6 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4 text-desi-black">
            Daily Specials
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Check out our daily specials and promotions. Great food at great prices!
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {specials.map((special, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-display font-semibold text-desi-black">
                    {special.name}
                  </h3>
                  <div className="flex items-center text-yellow-400">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="ml-1 text-sm font-medium text-gray-600">{special.rating}</span>
                  </div>
                </div>

                <p className="text-gray-600 mb-4">
                  {special.description}
                </p>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <span className="text-2xl font-bold text-desi-orange">{special.price}</span>
                    <span className="ml-2 text-sm text-gray-500 line-through">{special.originalPrice}</span>
                  </div>
                  <span className="bg-desi-orange/10 text-desi-orange px-3 py-1 rounded-full text-sm font-medium">
                    Save ${(parseFloat(special.originalPrice.replace('$', '')) - parseFloat(special.price.replace('$', ''))).toFixed(2)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    <span>{special.time}</span>
                  </div>
                  <div className="flex items-center">
                    <Tag className="w-4 h-4 mr-1" />
                    <span>{special.days}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* View Menu Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <a
            href="/menu"
            className="inline-flex items-center justify-center px-8 py-4 bg-desi-orange hover:bg-desi-orange/90 text-white rounded-full 
              font-medium transition-all shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
          >
            View All Specials
          </a>
        </motion.div>
      </div>
    </section>
  );
};

const CustomerReviews = () => {
  const reviews = [
    {
      name: "Sarah M.",
      role: "Food Blogger",
      content: "The chicken biryani from Desi Flavors is hands down the best I've had in Houston. The flavors are authentic and the portion sizes are generous!",
      rating: 5,
      image: "/images/review-1.jpg"
    },
    {
      name: "Michael R.",
      role: "Regular Customer",
      content: "I've been coming to Desi Flavors for their butter chicken for years. The consistency in taste and quality is impressive. A must-try for Indian food lovers!",
      rating: 5,
      image: "/images/review-2.jpg"
    },
    {
      name: "Priya K.",
      role: "Local Resident",
      content: "As someone who grew up in India, I can vouch for the authenticity of their dishes. The spices and flavors take me back home. Highly recommended!",
      rating: 5,
      image: "/images/review-3.jpg"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-white via-desi-cream/80 to-desi-cream relative overflow-hidden">
      {/* Background decoration */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="absolute inset-0 bg-gradient-to-br from-desi-orange/5 via-gray-50/50 to-transparent"
      />
      
      <div className="container mx-auto px-4 md:px-6 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4 text-desi-black">
            What Our Customers Say
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Don't just take our word for it. Here's what our satisfied customers have to say about their experience with Desi Flavors.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {reviews.map((review, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-white rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow duration-300 relative"
            >
              <Quote className="absolute top-6 right-6 text-desi-orange/20 w-12 h-12" />
              
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
                  <Image
                    src={review.image}
                    alt={review.name}
                    className="w-full h-full object-cover"
                    width={48}
                    height={48}
                    loading="lazy"
                  />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-desi-black">{review.name}</h3>
                  <p className="text-gray-500 text-sm">{review.role}</p>
                </div>
              </div>

              <div className="flex mb-4">
                {[...Array(review.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>

              <p className="text-gray-600 italic">
                "{review.content}"
              </p>
            </motion.div>
          ))}
        </div>

        {/* Leave Review Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <a
            href="/reviews"
            className="inline-flex items-center justify-center px-8 py-4 bg-desi-orange hover:bg-desi-orange/90 text-white rounded-full 
              font-medium transition-all shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
          >
            Leave a Review
          </a>
        </motion.div>
      </div>
    </section>
  );
};

const CateringAndEvents = () => {
  const services = [
    {
      icon: <Calendar className="w-8 h-8 text-desi-orange" />,
      title: "Private Events",
      description: "Make your special occasions memorable with our authentic Indian cuisine. Perfect for birthdays, anniversaries, and corporate events."
    },
    {
      icon: <Users className="w-8 h-8 text-desi-orange" />,
      title: "Corporate Catering",
      description: "Impress your clients and employees with our professional catering services. Customizable menus for meetings and office parties."
    },
    {
      icon: <PartyPopper className="w-8 h-8 text-desi-orange" />,
      title: "Festival Catering",
      description: "Celebrate cultural festivals with our traditional Indian dishes. Special menus available for Diwali, Holi, and other celebrations."
    },
    {
      icon: <ChefHat className="w-8 h-8 text-desi-orange" />,
      title: "Custom Menus",
      description: "Tailored menus to suit your event's theme and dietary requirements. Vegetarian, vegan, and gluten-free options available."
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-white via-desi-cream/80 to-desi-cream relative overflow-hidden">
      {/* Background decoration */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="absolute inset-0 bg-gradient-to-br from-desi-orange/5 via-gray-50/50 to-transparent"
      />
      
      <div className="container mx-auto px-4 md:px-6 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4 text-desi-black">
            Catering & Events
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Bring the authentic taste of India to your next event. Our food truck is available for private parties, 
            corporate events, and special celebrations.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
          {services.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-white p-4 md:p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300"
            >
              <div className="flex justify-center mb-2 md:mb-4">
                {service.icon}
              </div>
              <h3 className="text-lg md:text-xl font-display font-semibold mb-1 md:mb-2 text-center text-desi-black">
                {service.title}
              </h3>
              <p className="text-sm md:text-base text-gray-600 text-center">
                {service.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <a
            href="/catering"
            className="inline-flex items-center justify-center px-8 py-4 bg-desi-orange hover:bg-desi-orange/90 text-white rounded-full 
              font-medium transition-all shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
          >
            Book Your Event
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default CateringAndEvents;
