import './globals.css';
import '../index.css';
import { inter, merriweather } from './fonts';
import LayoutClientWrapper from '@/components/LayoutClientWrapper';

export const metadata = {
  title: {
    default: 'Desi Flavors Katy | Authentic Indian Street Food',
    template: '%s | Desi Flavors Katy'
  },
  description: 'Desi Flavors Katy - Authentic Indian street food served daily from our food truck in Katy, TX. Order online from DoorDash, Grubhub, and Uber Eats or find us at our next location!',
  keywords: [
    'Indian food Katy TX',
    'Indian restaurant Katy',
    'Desi food truck',
    'authentic Indian cuisine',
    'Indian street food',
    'biryani Katy',
    'curry Katy',
    'food delivery Katy',
    'DoorDash Katy',
    'Grubhub Katy',
    'Uber Eats Katy'
  ],
  authors: [{ name: 'Desi Flavors Katy' }],
  creator: 'Desi Flavors Katy',
  publisher: 'Desi Flavors Katy',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://www.desiflavorskaty.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Desi Flavors Katy | Authentic Indian Street Food',
    description: 'Desi Flavors Katy - Authentic Indian street food served daily from our food truck in Katy, TX. Order online from DoorDash, Grubhub, and Uber Eats!',
    url: 'https://www.desiflavorskaty.com',
    siteName: 'Desi Flavors Katy',
    type: 'website',
    locale: 'en_US',
    images: [
      {
        url: 'https://www.desiflavorskaty.com/Truck/truck-4.jpg',
        width: 1200,
        height: 630,
        alt: 'Desi Flavors Katy Food Truck',
      },
      {
        url: 'https://www.desiflavorskaty.com/Food/foodtable.webp',
        width: 1200,
        height: 630,
        alt: 'Authentic Indian Food at Desi Flavors Katy',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Desi Flavors Katy | Authentic Indian Street Food',
    description: 'Desi Flavors Katy - Authentic Indian street food served daily from our food truck in Katy, TX. Order online from DoorDash, Grubhub, and Uber Eats!',
    images: [
      'https://www.desiflavorskaty.com/Truck/truck-4.jpg',
    ],
    creator: '@desiflavorskaty',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${merriweather.variable}`}> 
      <head>
        <meta name="description" content="Desi Flavors Katy - Authentic Indian street food served daily from our food truck in Katy, TX. Order online or find us at our next location!" />
        <meta property="og:title" content="Desi Flavors Katy | Authentic Indian Street Food" />
        <meta property="og:description" content="Desi Flavors Katy - Authentic Indian street food served daily from our food truck in Katy, TX. Order online or find us at our next location!" />
        <meta property="og:image" content="https://www.desiflavorskaty.com/Truck/truck-4.jpg" />
        <meta property="og:url" content="https://www.desiflavorskaty.com" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Desi Flavors Katy | Authentic Indian Street Food" />
        <meta name="twitter:description" content="Desi Flavors Katy - Authentic Indian street food served daily from our food truck in Katy, TX. Order online or find us at our next location!" />
        <meta name="twitter:image" content="https://www.desiflavorskaty.com/Truck/truck-4.jpg" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: `{
          "@context": "https://schema.org",
          "@type": "Restaurant",
          "name": "Desi Flavors Katy",
          "description": "Authentic Indian street food served daily from our food truck in Katy, TX. Specializing in biryani, curries, and traditional Indian dishes.",
          "image": [
            "https://www.desiflavorskaty.com/Truck/truck-4.jpg",
            "https://www.desiflavorskaty.com/Truck/truck-3.jpg",
            "https://www.desiflavorskaty.com/Food/foodtable.webp"
          ],
          "url": "https://www.desiflavorskaty.com",
          "telephone": "+1-346-824-4212",
          "email": "info@desiflavorskaty.com",
          "address": {
            "@type": "PostalAddress",
            "streetAddress": "1989 North Fry Rd",
            "addressLocality": "Katy",
            "addressRegion": "TX",
            "postalCode": "77494",
            "addressCountry": "US"
          },
          "geo": {
            "@type": "GeoCoordinates",
            "latitude": 29.794896,
            "longitude": -95.719412
          },
          "openingHours": ["Mo-Su 17:00-01:00"],
          "servesCuisine": ["Indian", "South Asian", "Desi"],
          "priceRange": "$$",
          "paymentAccepted": ["Cash", "Credit Card", "DoorDash", "Grubhub", "Uber Eats"],
          "hasMenu": "https://www.desiflavorskaty.com/menu",
          "acceptsReservations": false,
          "currenciesAccepted": "USD",
          "sameAs": [
            "https://www.facebook.com/desiflavorskaty",
            "https://www.instagram.com/desiflavorskaty"
          ],
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.8",
            "reviewCount": "150"
          }
        }` }} />
        <script
          src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places&v=beta&loading=async`}
          async
        ></script>
        <script
          src="https://unpkg.com/@googlemaps/places-autocomplete-element@latest/dist/index.min.js"
          async
        ></script>
      </head>
      <body>
        <a href="#main-content" className="skip-link sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 bg-desi-orange text-white px-4 py-2 rounded shadow transition-all">Skip to main content</a>
        <LayoutClientWrapper>
          <main id="main-content" tabIndex={-1}>
            {children}
          </main>
        </LayoutClientWrapper>
      </body>
    </html>
  );
}