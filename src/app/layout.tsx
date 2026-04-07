import './globals.css';
import '../index.css';
import type { Metadata, Viewport } from 'next';
import { inter, merriweather } from './fonts';
import LayoutClientWrapper from '@/components/LayoutClientWrapper';
import { SITE_URL } from '@/lib/siteUrl';

const restaurantJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Restaurant',
  name: 'Desi Flavors Katy',
  description:
    'Authentic Indian street food served daily from our food truck in Katy, TX. Specializing in biryani, curries, and traditional Indian dishes.',
  image: [
    `${SITE_URL}/Truck/truck-4.jpg`,
    `${SITE_URL}/Truck/truck-3.jpg`,
    `${SITE_URL}/Food/foodtable.webp`,
  ],
  url: SITE_URL,
  telephone: '+1-346-824-4212',
  email: 'info@desiflavorskaty.com',
  address: {
    '@type': 'PostalAddress',
    streetAddress: '1989 North Fry Rd',
    addressLocality: 'Katy',
    addressRegion: 'TX',
    postalCode: '77494',
    addressCountry: 'US',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 29.794896,
    longitude: -95.719412,
  },
  areaServed: [
    {
      '@type': 'City',
      name: 'Katy',
      containedInPlace: { '@type': 'State', name: 'Texas' },
    },
    {
      '@type': 'AdministrativeArea',
      name: 'Houston metropolitan area',
    },
  ],
  hasMap:
    'https://www.google.com/maps/search/?api=1&query=1989+North+Fry+Rd,+Katy,+TX+77494',
  openingHours: ['Mo-Su 17:00-01:00'],
  servesCuisine: ['Indian', 'South Asian', 'Desi'],
  priceRange: '$$',
  paymentAccepted: ['Cash', 'Credit Card', 'DoorDash', 'Grubhub', 'Uber Eats'],
  hasMenu: `${SITE_URL}/menu`,
  acceptsReservations: false,
  currenciesAccepted: 'USD',
  sameAs: [
    'https://www.facebook.com/desiflavorskaty',
    'https://www.instagram.com/desiflavorskaty',
  ],
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.8',
    reviewCount: '150',
  },
} as const;

const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Desi Flavors Katy',
  url: SITE_URL,
  description:
    'Authentic Indian street food in Katy, TX — biryani, curries, and Indian street food. Order online or find the food truck.',
  inLanguage: 'en-US',
  publisher: {
    '@type': 'Organization',
    name: 'Desi Flavors Katy',
    url: SITE_URL,
  },
} as const;

const structuredDataGraph = {
  '@context': 'https://schema.org',
  '@graph': [websiteJsonLd, restaurantJsonLd],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#FF6B35',
};

export const metadata: Metadata = {
  title: {
    default: 'Desi Flavors Katy | Authentic Indian Street Food',
    template: '%s | Desi Flavors Katy',
  },
  description:
    'Desi Flavors Katy - Authentic Indian street food served daily from our food truck in Katy, TX. Order online from DoorDash, Grubhub, and Uber Eats or find us at our next location!',
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
    'Uber Eats Katy',
    'Houston Indian food',
    'Katy TX restaurant',
  ],
  authors: [{ name: 'Desi Flavors Katy' }],
  creator: 'Desi Flavors Katy',
  publisher: 'Desi Flavors Katy',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: '/',
  },
  category: 'restaurant',
  openGraph: {
    title: 'Desi Flavors Katy | Authentic Indian Street Food',
    description:
      'Desi Flavors Katy - Authentic Indian street food served daily from our food truck in Katy, TX. Order online from DoorDash, Grubhub, and Uber Eats!',
    url: SITE_URL,
    siteName: 'Desi Flavors Katy',
    type: 'website',
    locale: 'en_US',
    images: [
      {
        url: `${SITE_URL}/Truck/truck-4.jpg`,
        width: 1200,
        height: 630,
        alt: 'Desi Flavors Katy Food Truck',
      },
      {
        url: `${SITE_URL}/Food/foodtable.webp`,
        width: 1200,
        height: 630,
        alt: 'Authentic Indian Food at Desi Flavors Katy',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Desi Flavors Katy | Authentic Indian Street Food',
    description:
      'Desi Flavors Katy - Authentic Indian street food served daily from our food truck in Katy, TX. Order online from DoorDash, Grubhub, and Uber Eats!',
    images: [`${SITE_URL}/Truck/truck-4.jpg`],
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
  other: {
    'geo.region': 'US-TX',
    'geo.placename': 'Katy',
    'geo.position': '29.794896;-95.719412',
    ICBM: '29.794896, -95.719412',
  },
  ...(process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
    ? {
        verification: {
          google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
        },
      }
    : {}),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${merriweather.variable}`}>
      <head>
        <link rel="alternate" type="text/plain" title="LLM context" href="/llms.txt" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredDataGraph) }}
        />
        <script
          src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places&v=beta&loading=async`}
          async
        />
        <script
          src="https://unpkg.com/@googlemaps/places-autocomplete-element@latest/dist/index.min.js"
          async
        />
      </head>
      <body>
        <a
          href="#main-content"
          className="skip-link sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 bg-desi-orange text-white px-4 py-2 rounded shadow transition-all"
        >
          Skip to main content
        </a>
        <LayoutClientWrapper>
          <main id="main-content" tabIndex={-1}>
            {children}
          </main>
        </LayoutClientWrapper>
      </body>
    </html>
  );
}
