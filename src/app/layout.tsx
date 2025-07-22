import './globals.css';
import { inter, samarkan, displayFont, merriweather } from './fonts';
import LayoutClientWrapper from '@/components/LayoutClientWrapper';

export const metadata = {
  title: 'Desi Flavors Katy | Authentic Indian Street Food',
  description: 'Desi Flavors Katy - Authentic Indian street food served daily from our food truck in Katy, TX. Order online or find us at our next location!',
  openGraph: {
    title: 'Desi Flavors Katy | Authentic Indian Street Food',
    description: 'Desi Flavors Katy - Authentic Indian street food served daily from our food truck in Katy, TX. Order online or find us at our next location!',
    url: 'https://www.desiflavorskaty.com',
    type: 'website',
    images: [
      'https://www.desiflavorskaty.com/Truck/truck-4.jpg',
      'https://www.desiflavorskaty.com/Truck/truck-3.jpg',
      'https://www.desiflavorskaty.com/Truck/IMG-20250603-WA0005.jpg',
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Desi Flavors Katy | Authentic Indian Street Food',
    description: 'Desi Flavors Katy - Authentic Indian street food served daily from our food truck in Katy, TX. Order online or find us at our next location!',
    images: [
      'https://www.desiflavorskaty.com/Truck/truck-4.jpg',
    ],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${samarkan.variable} ${displayFont.variable} ${merriweather.variable}`}> 
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
          "image": [
            "https://www.desiflavorskaty.com/Truck/truck-4.jpg",
            "https://www.desiflavorskaty.com/Truck/truck-3.jpg",
            "https://www.desiflavorskaty.com/Truck/IMG-20250603-WA0005.jpg"
          ],
          "url": "https://www.desiflavorskaty.com",
          "telephone": "+1-346-824-4212",
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
          "openingHours": ["Mo-Su 17:00-01:00"]
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