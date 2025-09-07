import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us - Desi Flavors Katy',
  description: 'Learn about Desi Flavors Katy, your authentic Indian street food truck in Katy, TX. Discover our story, mission, and commitment to serving traditional Indian cuisine.',
  keywords: [
    'about Desi Flavors Katy',
    'Indian food truck Katy TX',
    'authentic Indian cuisine story',
    'Desi food truck history',
    'Indian restaurant Katy Texas'
  ],
  openGraph: {
    title: 'About Us - Desi Flavors Katy',
    description: 'Learn about Desi Flavors Katy, your authentic Indian street food truck in Katy, TX. Discover our story, mission, and commitment to serving traditional Indian cuisine.',
    images: [
      {
        url: 'https://www.desiflavorskaty.com/Truck/truck-4.jpg',
        width: 1200,
        height: 630,
        alt: 'Desi Flavors Katy Food Truck - About Us',
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
