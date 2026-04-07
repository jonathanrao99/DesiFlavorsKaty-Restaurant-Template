import { SITE_URL, siteConfig, sameAsSocial } from '@/config/site';

function googleMapsSearchUrl(): string {
  const q = encodeURIComponent(
    `${siteConfig.addressLine}, ${siteConfig.addressCity}, ${siteConfig.addressRegion} ${siteConfig.addressPostal}`,
  );
  return `https://www.google.com/maps/search/?api=1&query=${q}`;
}

export function getStructuredDataGraph() {
  const restaurant: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    name: siteConfig.businessName,
    description: siteConfig.description,
    image: [
      `${SITE_URL}/Truck/truck-4.jpg`,
      `${SITE_URL}/Truck/truck-3.jpg`,
      `${SITE_URL}/Food/foodtable.webp`,
    ],
    url: SITE_URL,
    telephone: siteConfig.phoneE164,
    email: siteConfig.emailContact,
    address: {
      '@type': 'PostalAddress',
      streetAddress: siteConfig.addressLine,
      addressLocality: siteConfig.addressCity,
      addressRegion: siteConfig.addressRegion,
      postalCode: siteConfig.addressPostal,
      addressCountry: siteConfig.addressCountry,
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: siteConfig.latitude,
      longitude: siteConfig.longitude,
    },
    areaServed: [
      {
        '@type': 'City',
        name: siteConfig.areaServedCity,
        containedInPlace: { '@type': 'State', name: siteConfig.addressStateName },
      },
      {
        '@type': 'AdministrativeArea',
        name: siteConfig.areaServedMetro,
      },
    ],
    hasMap: googleMapsSearchUrl(),
    openingHours: [siteConfig.openingHoursSchema],
    servesCuisine: siteConfig.servesCuisine,
    priceRange: '$$',
    paymentAccepted: siteConfig.paymentAccepted,
    hasMenu: `${SITE_URL}/menu`,
    acceptsReservations: false,
    currenciesAccepted: 'USD',
    sameAs: sameAsSocial,
  };

  if (siteConfig.schemaRatingValue && siteConfig.schemaReviewCount) {
    restaurant.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: siteConfig.schemaRatingValue,
      reviewCount: Number.parseInt(siteConfig.schemaReviewCount, 10) || siteConfig.schemaReviewCount,
    };
  }

  const website = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteConfig.businessName,
    url: SITE_URL,
    description: siteConfig.description,
    inLanguage: 'en-US',
    publisher: {
      '@type': 'Organization',
      name: siteConfig.businessName,
      url: SITE_URL,
    },
  };

  return {
    '@context': 'https://schema.org',
    '@graph': [website, restaurant],
  };
}
