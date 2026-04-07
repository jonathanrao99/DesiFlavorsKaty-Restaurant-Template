import './globals.css';
import '../index.css';
import type { Metadata, Viewport } from 'next';
import { inter, merriweather } from './fonts';
import LayoutClientWrapper from '@/components/LayoutClientWrapper';
import { SITE_URL, siteConfig } from '@/config/site';
import { getStructuredDataGraph } from '@/config/structuredData';

const structuredDataGraph = getStructuredDataGraph();

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: siteConfig.themeColor,
};

export const metadata: Metadata = {
  title: {
    default: `${siteConfig.businessName} | ${siteConfig.titleSuffix}`,
    template: `%s | ${siteConfig.businessName}`,
  },
  description: siteConfig.description,
  keywords: siteConfig.keywords,
  authors: [{ name: siteConfig.businessName }],
  creator: siteConfig.businessName,
  publisher: siteConfig.businessName,
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
    title: `${siteConfig.businessName} | ${siteConfig.titleSuffix}`,
    description: siteConfig.description,
    url: SITE_URL,
    siteName: siteConfig.businessName,
    type: 'website',
    locale: 'en_US',
    images: [
      {
        url: `${SITE_URL}/Truck/truck-4.jpg`,
        width: 1200,
        height: 630,
        alt: `${siteConfig.businessName} — food`,
      },
      {
        url: `${SITE_URL}/Food/foodtable.webp`,
        width: 1200,
        height: 630,
        alt: `Menu and food at ${siteConfig.businessName}`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${siteConfig.businessName} | ${siteConfig.titleSuffix}`,
    description: siteConfig.description,
    images: [`${SITE_URL}/Truck/truck-4.jpg`],
    creator: siteConfig.twitterCreator,
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
    'geo.region': siteConfig.geoRegionMeta,
    'geo.placename': siteConfig.geoPlacename,
    'geo.position': `${siteConfig.latitude};${siteConfig.longitude}`,
    ICBM: `${siteConfig.latitude}, ${siteConfig.longitude}`,
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
          className="skip-link sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 bg-your-orange text-white px-4 py-2 rounded shadow transition-all"
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
