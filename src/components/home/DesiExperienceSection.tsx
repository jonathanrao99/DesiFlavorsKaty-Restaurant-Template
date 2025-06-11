import { motion } from 'framer-motion';
import { BookOpen, Leaf, Star } from 'lucide-react';
import Image from 'next/image';
import { Card, CardHeader, CardBody } from '@heroui/react';

const pillars = [
  {
    icon: <BookOpen className="w-8 h-8 text-desi-orange" />,
    title: 'Authenticity',
    desc: 'Traditional recipes, prepared with care and respect for Indian heritage.'
  },
  {
    icon: <Leaf className="w-8 h-8 text-desi-orange" />,
    title: 'Quality Ingredients',
    desc: 'Only the freshest, premium ingredients—locally sourced and halal-certified.'
  },
  {
    icon: <Star className="w-8 h-8 text-desi-orange" />,
    title: 'Exceptional Experience',
    desc: 'Friendly service, consistent flavors, and a memorable food truck experience.'
  },
];

export default function DesiExperienceSection() {
  return (
    <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-white via-orange-50 to-desi-cream">
      {/* Soft gradient background with faint spice overlay */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-tr from-desi-orange/10 via-white/60 to-yellow-100/40" />
        <Image
          src="/Ingredients/mint-removebg-preview.png"
          alt="Spice watermark"
          width={112}
          height={112}
          className="absolute top-8 left-16 w-28 h-auto opacity-10 select-none pointer-events-none"
          loading="lazy"
        />
        <Image
          src="/Ingredients/cinamon-removebg-preview.png"
          alt="Spice watermark"
          width={128}
          height={128}
          className="absolute bottom-8 right-16 w-32 h-auto opacity-10 select-none pointer-events-none"
          loading="lazy"
        />
      </div>
      <div className="relative z-10 w-full max-w-5xl mx-auto px-4 py-20 flex flex-col items-center text-center">
        <motion.h2
          className="text-3xl md:text-4xl font-display font-bold mb-4 text-desi-black"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, type: 'spring' }}
        >
          Our Promise to You
        </motion.h2>
        <motion.p
          className="text-lg md:text-xl text-gray-700 mb-12 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15, type: 'spring' }}
        >
          Every plate is a commitment to quality, authenticity, and your satisfaction.
        </motion.p>
        {/* Pillar Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 w-full">
          {pillars.map((pillar, i) => (
            <motion.div
              key={pillar.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 + i * 0.12, type: 'spring' }}
            >
              <Card className="rounded-2xl px-8 py-10 shadow-lg border border-desi-orange/10 hover:shadow-2xl hover:scale-[1.03] transition-all duration-300 flex flex-col items-center text-center bg-white">
                <CardHeader className="mb-4 flex flex-col items-center">
                  {pillar.icon}
                </CardHeader>
                <CardBody>
                  <div className="text-xl font-semibold text-desi-black mb-2">{pillar.title}</div>
                  <div className="text-gray-700 text-base">{pillar.desc}</div>
                </CardBody>
              </Card>
            </motion.div>
          ))}
        </div>
        {/* Testimonial or Reviews Button */}
        <motion.div
          className="mt-4 flex flex-col items-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5, type: 'spring' }}
        >
          <div className="text-desi-orange font-semibold text-lg mb-2">See what our customers say</div>
          <div className="bg-white/90 border border-desi-orange/10 rounded-xl px-6 py-4 shadow text-gray-700 max-w-xl italic">
            "Desi Flavors never disappoints! The food is always fresh and the staff is so welcoming."
          </div>
          {/* <a href="#reviews" className="mt-4 inline-block text-desi-orange font-medium hover:underline transition-colors">Read Reviews</a> */}
        </motion.div>
      </div>
    </section>
  );
} 
 