import { Metadata } from 'next';
import { SITE_URL, siteConfig } from '@/config/site';

export const metadata: Metadata = {
  title: `Catering Services - ${siteConfig.businessName}`,
  description: `Professional catering by ${siteConfig.businessName}. Corporate events, weddings, and private parties.`,
  keywords: [
    'catering',
    'corporate catering',
    'wedding catering',
    'private party catering',
    siteConfig.addressCity,
  ].filter(Boolean),
  openGraph: {
    title: `Catering | ${siteConfig.businessName}`,
    description: `Catering services — ${siteConfig.description}`,
    images: [
      {
        url: `${SITE_URL}/Truck/IMG-20250603-WA0005.jpg`,
        width: 1200,
        height: 630,
        alt: `Catering — ${siteConfig.businessName}`,
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
