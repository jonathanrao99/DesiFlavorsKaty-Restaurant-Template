'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, X, ShoppingCart } from 'lucide-react';
import { useCart } from '@/context/CartContext';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCartBouncing, setIsCartBouncing] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const {
    cartItems
  } = useCart();

  // Check if we're on home or about page
  const isHomeOrAbout = pathname === '/' || pathname === '/about';

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle navigation and scroll
  const handleNavClick = (path: string) => {
    setIsMobileMenuOpen(false);
    if (pathname === path) {
      // If we're already on the page, scroll to top immediately
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    } else {
      // If we're navigating to a different page, navigate first
      router.push(path);
      // The useScrollToTopOnNavClick hook will handle scrolling to top
    }
  };

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Handle cart bounce animation when items change
  useEffect(() => {
    if (cartItems.length > 0) {
      setIsCartBouncing(true);
      const timer = setTimeout(() => setIsCartBouncing(false), 500);
      return () => clearTimeout(timer);
    }
  }, [cartItems]);

  // Prevent hydration mismatch for cart badge
  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => {
    setHasMounted(true);
  }, []);

  // Count total items in cart
  const itemCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  // On cart/payment pages, always use white bg and desi-black text, even before hydration or scroll
  const isCartPage = pathname === '/cart';
  const isPaymentPage = pathname === '/payment';
  // On cart/payment pages, always use white bg and desi-black text, even before hydration or scroll
  const forceDesiBlack = isCartPage || isPaymentPage;
  const useDarkText = forceDesiBlack || isScrolled;
  
  return <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${useDarkText ? 'bg-white/90 backdrop-blur-md shadow-sm py-3' : 'bg-transparent py-5'}`}>
      <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
        {/* Left Nav */}
        <nav className="hidden md:flex items-center space-x-8 flex-1 justify-start">
          <Link 
            href="/menu" 
            className={`font-display font-semibold uppercase tracking-wider text-md px-2 py-1 rounded transition-colors duration-300 ${forceDesiBlack ? 'text-desi-black hover:text-desi-orange' : useDarkText ? 'text-gray-900 hover:text-desi-orange' : 'text-white hover:text-desi-orange'} ${forceDesiBlack ? '!text-desi-black !hover:text-desi-orange' : ''}`}
            onClick={(e) => {
              e.preventDefault();
              handleNavClick('/menu');
            }}
          >
            Menu
          </Link>
          <Link 
            href="/catering" 
            className={`font-display font-semibold uppercase tracking-wider text-md px-2 py-1 rounded transition-colors duration-300 ${forceDesiBlack ? 'text-desi-black hover:text-desi-orange' : useDarkText ? 'text-gray-900 hover:text-desi-orange' : 'text-white hover:text-desi-orange'} ${forceDesiBlack ? '!text-desi-black !hover:text-desi-orange' : ''}`}
            onClick={(e) => {
              e.preventDefault();
              handleNavClick('/catering');
            }}
          >
            Catering
          </Link>
        </nav>

        {/* Centered Logo/Title */}
        <div className="flex-1 flex justify-center">
          <Link 
            href="/" 
            className="flex items-center"
            onClick={(e) => {
              e.preventDefault();
              handleNavClick('/');
            }}
          >
            <span className="font-samarkan text-4xl text-desi-orange">Desi</span>
            <span className={`font-display text-2xl font-bold ml-2 tracking-wide transition-colors duration-300 ${forceDesiBlack ? 'text-desi-black' : useDarkText ? 'text-gray-900' : 'text-white'} ${forceDesiBlack ? '!text-desi-black' : ''}`}>FlavorsKaty</span>
          </Link>
        </div>

        {/* Right Nav */}
        <nav className="hidden md:flex items-center space-x-8 flex-1 justify-end">
          <Link 
            href="/about" 
            className={`font-display font-semibold uppercase tracking-wider text-md px-2 py-1 rounded transition-colors duration-300 ${forceDesiBlack ? 'text-desi-black hover:text-desi-orange' : useDarkText ? 'text-gray-900 hover:text-desi-orange' : 'text-white hover:text-desi-orange'} ${forceDesiBlack ? '!text-desi-black !hover:text-desi-orange' : ''}`}
            onClick={(e) => {
              e.preventDefault();
              handleNavClick('/about');
            }}
          >
            About Us
          </Link>
          <Link href="/cart" className="font-medium relative group">
            <ShoppingCart 
              size={20} 
              className={`transition-all duration-300 group-hover:-rotate-12 group-hover:text-desi-orange ${isCartBouncing ? 'animate-bounce' : ''} ${forceDesiBlack ? 'text-desi-black' : useDarkText ? 'text-gray-900' : 'text-white'} ${forceDesiBlack ? '!text-desi-black' : ''}`}
            />
            {hasMounted && itemCount > 0 && <span className="absolute -top-2 -right-2 bg-desi-orange text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {itemCount}
              </span>}
          </Link>
        </nav>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center space-x-4">
          <Link href="/cart" className="relative mr-2">
            <ShoppingCart 
              size={20} 
              className={`transition-colors duration-300 ${forceDesiBlack ? 'text-desi-black' : useDarkText ? 'text-gray-900' : 'text-white'} ${isCartBouncing ? 'animate-bounce' : ''} ${forceDesiBlack ? '!text-desi-black' : ''}`}
            />
            {hasMounted && itemCount > 0 && <span className="absolute -top-2 -right-2 bg-desi-orange text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {itemCount}
              </span>}
          </Link>
          <button 
            className={`transition-colors duration-300 ${forceDesiBlack ? 'text-desi-black hover:text-desi-orange' : useDarkText ? 'text-gray-900 hover:text-desi-orange' : 'text-white hover:text-desi-orange'} ${forceDesiBlack ? '!text-desi-black !hover:text-desi-orange' : ''}`} 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation - Updated Order */}
      {isMobileMenuOpen && <div className="md:hidden absolute top-full left-0 right-0 bg-white/95 backdrop-blur-md shadow-md animate-fade-in">
          <nav className="container mx-auto px-4 py-6 flex flex-col space-y-4">
            <Link 
              href="/" 
              className="px-4 py-2 hover:bg-desi-orange/10 rounded-md transition-colors text-desi-black hover:text-desi-orange"
              onClick={(e) => {
                e.preventDefault();
                handleNavClick('/');
              }}
            >
              Home
            </Link>
            <Link 
              href="/menu" 
              className="px-4 py-2 hover:bg-desi-orange/10 rounded-md transition-colors text-desi-black hover:text-desi-orange"
              onClick={(e) => {
                e.preventDefault();
                handleNavClick('/menu');
              }}
            >
              Menu
            </Link>
            <Link 
              href="/catering" 
              className="px-4 py-2 hover:bg-desi-orange/10 rounded-md transition-colors text-desi-black hover:text-desi-orange"
              onClick={(e) => {
                e.preventDefault();
                handleNavClick('/catering');
              }}
            >
              Catering
            </Link>
            <Link 
              href="/about" 
              className="px-4 py-2 hover:bg-desi-orange/10 rounded-md transition-colors text-desi-black hover:text-desi-orange"
              onClick={(e) => {
                e.preventDefault();
                handleNavClick('/about');
              }}
            >
              About Us
            </Link>
          </nav>
        </div>}
    </header>;
};

export default Navbar;
