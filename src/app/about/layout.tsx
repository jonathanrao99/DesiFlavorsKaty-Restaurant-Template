import { Metadata } from 'next';
import { SITE_URL, siteConfig } from '@/config/site';

export const metadata: Metadata = {
  title: `About Us - ${siteConfig.businessName}`,
  description: `Learn about ${siteConfig.businessName}: our story, mission, and how we serve our community.`,
  keywords: [
    `about ${siteConfig.businessName}`,
    'food truck',
    'restaurant story',
    'catering',
  ],
  openGraph: {
    title: `About Us - ${siteConfig.businessName}`,
    description: `Learn about ${siteConfig.businessName} and our team.`,
    images: [
      {
        url: `${SITE_URL}/Truck/truck-4.jpg`,
        width: 1200,
        height: 630,
        alt: `${siteConfig.businessName} — About`,
      },
    ],
  },
  alternates: {
    canonical: '/about',
  },
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
