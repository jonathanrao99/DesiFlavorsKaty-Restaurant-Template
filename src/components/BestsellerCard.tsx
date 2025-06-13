'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import Image from 'next/image';

interface BestsellerCardProps {
  title: string;
  description: string;
  price: string;
  imageSrc: string;
  isSpecial?: boolean;
  delay?: number;
  itemId?: number;
}

const BestsellerCard = ({ 
  title, 
  description, 
  price, 
  imageSrc, 
  isSpecial = false,
  delay = 0,
  itemId 
}: BestsellerCardProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const router = useRouter();

  const handleOrderClick = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push(`/menu?itemId=${itemId}`);
  };

  return (
    <div
      className="group bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2"
      style={{ 
        opacity: 0, 
        animation: 'fade-in 0.5s ease-out forwards', 
        animationDelay: `${delay}ms` 
      }}
    >
      <div className="relative h-48 overflow-hidden">
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse" />
        )}
        <Image
          src={imageSrc}
          alt={title}
          fill
          className={`object-cover transition-all duration-500 group-hover:scale-110 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setImageLoaded(true)}
          loading="lazy"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
      </div>
      
      <div className="p-4">
        <h3 className="font-display font-medium text-xl mb-2 group-hover:text-desi-orange transition-colors duration-300">{title}</h3>
        <p className="text-gray-600 text-sm line-clamp-2 mb-4 group-hover:text-gray-700 transition-colors duration-300">{description}</p>
        
        <div className="flex items-center justify-between">
          <span className="font-medium text-desi-orange group-hover:text-orange-600 transition-colors duration-300">{price}</span>
          <button 
            onClick={handleOrderClick}
            className="inline-flex items-center text-desi-black group-hover:text-desi-orange transition-colors duration-300 text-sm"
          >
            <span>Order Now</span>
            <ChevronRight size={16} className="ml-1 transform group-hover:translate-x-1 transition-transform duration-300" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default BestsellerCard;
