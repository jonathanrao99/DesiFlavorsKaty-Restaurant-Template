import { Facebook, Instagram, Youtube, Phone } from 'lucide-react';

// Custom X icon component
const XIcon = ({ size = 18 }: { size?: number }) => (
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

interface SocialLinksProps {
  iconSize?: number;
  spacing?: string;
  iconColor?: string;
}

const SocialLinks = ({ iconSize = 18, spacing = "space-x-2", iconColor = "text-gray-600" }: SocialLinksProps) => {
  return (
    <div className={`flex ${spacing}`}>
      <a
        href="https://facebook.com/yourflavors"
        target="_blank"
        rel="noopener noreferrer"
        className={`${iconColor} hover:text-your-orange transition-colors`}
        aria-label="Facebook"
      >
        <Facebook size={iconSize} />
      </a>
      <a
        href="https://instagram.com/yourflavors"
        target="_blank"
        rel="noopener noreferrer"
        className={`${iconColor} hover:text-your-orange transition-colors`}
        aria-label="Instagram"
      >
        <Instagram size={iconSize} />
      </a>
      <a
        href="https://x.com/yourflavors"
        target="_blank"
        rel="noopener noreferrer"
        className={`${iconColor} hover:text-your-orange transition-colors`}
        aria-label="X (formerly Twitter)"
      >
        <XIcon size={iconSize} />
      </a>
      <a
        href="https://youtube.com/yourflavors"
        target="_blank"
        rel="noopener noreferrer"
        className={`${iconColor} hover:text-your-orange transition-colors`}
        aria-label="YouTube"
      >
        <Youtube size={iconSize} />
      </a>
      <a
        href="https://wa.me/13468244212"
        target="_blank"
        rel="noopener noreferrer"
        className={`${iconColor} hover:text-your-orange transition-colors`}
        aria-label="WhatsApp"
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width={iconSize} 
          height={iconSize} 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" />
          <path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1Z" />
          <path d="M14 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1Z" />
          <path d="M9.5 13.5c.5 1 1.5 1 2.5 1s2-.5 2.5-1" />
        </svg>
      </a>
    </div>
  );
};

export default SocialLinks;
