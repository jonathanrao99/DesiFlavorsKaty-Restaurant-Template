import { Metadata } from 'next';
import { SITE_URL } from '@/lib/siteUrl';

export const metadata: Metadata = {
  title: 'Catering Services - Indian Food Catering Katy TX',
  description: 'Professional Indian food catering services in Katy, TX. Perfect for corporate events, weddings, and private parties. Authentic Indian cuisine delivered to your venue.',
  keywords: [
    'Indian catering Katy TX',
    'corporate catering Katy',
    'wedding catering Indian food',
    'private party catering',
    'Indian food delivery catering',
    'authentic Indian catering services',
    'Desi catering Katy Texas'
  ],
  openGraph: {
    title: 'Catering Services - Indian Food Catering Katy TX | Desi Flavors Katy',
    description: 'Professional Indian food catering services in Katy, TX. Perfect for corporate events, weddings, and private parties.',
    images: [
      {
        url: `${SITE_URL}/Truck/IMG-20250603-WA0005.jpg`,
        width: 1200,
        height: 630,
        alt: 'Indian Food Catering Services at Desi Flavors Katy',
      },
    ],
  },
  alternates: {
    canonical: '/catering',
  },
};

export default function CateringLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
