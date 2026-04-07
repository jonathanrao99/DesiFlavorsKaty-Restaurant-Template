/**
 * Site-wide copy and links for this template.
 * Set NEXT_PUBLIC_* variables in `.env.local` (and Vercel → Environment Variables).
 */

function env(key: string, fallback: string): string {
  const v = process.env[key];
  return typeof v === 'string' && v.trim() !== '' ? v.trim() : fallback;
}

/** No trailing slash. Defaults to localhost for dev before you set a real URL. */
export const SITE_URL = env('NEXT_PUBLIC_SITE_URL', 'http://localhost:3000').replace(/\/$/, '');

export const siteConfig = {
  businessName: env('NEXT_PUBLIC_BUSINESS_NAME', 'Your Restaurant'),
  /** Used in footer wordmark split (first part, often script-style) */
  brandWordPrimary: env('NEXT_PUBLIC_BRAND_WORD_PRIMARY', 'Your'),
  /** Second part of footer wordmark */
  brandWordSecondary: env('NEXT_PUBLIC_BRAND_WORD_SECONDARY', 'Brand'),
  titleSuffix: env('NEXT_PUBLIC_TITLE_SUFFIX', 'Street Food & Catering'),
  description: env(
    'NEXT_PUBLIC_SITE_DESCRIPTION',
    'Replace this with a short description of your restaurant, food truck, or cafe.',
  ),
  /** SEO keywords, comma-separated in env */
  keywords: env(
    'NEXT_PUBLIC_SITE_KEYWORDS',
    'restaurant, food truck, catering, local food, your city',
  ).split(',').map((s) => s.trim()).filter(Boolean),
  phoneE164: env('NEXT_PUBLIC_PHONE_E164', '+15555550100'),
  phoneDisplay: env('NEXT_PUBLIC_PHONE_DISPLAY', '+1 (555) 555-0100'),
  /** Digits only, no + — for wa.me links */
  whatsappDigits: env('NEXT_PUBLIC_WHATSAPP_DIGITS', '15555550100'),
  emailContact: env('NEXT_PUBLIC_EMAIL_CONTACT', 'hello@example.com'),
  orderUrl: env('NEXT_PUBLIC_ORDER_URL', 'https://example.com/order'),
  addressLine: env('NEXT_PUBLIC_ADDRESS_LINE', '123 Main Street'),
  addressCity: env('NEXT_PUBLIC_ADDRESS_CITY', 'Your City'),
  addressRegion: env('NEXT_PUBLIC_ADDRESS_REGION', 'TX'),
  /** Full state name for schema.org, e.g. Texas */
  addressStateName: env('NEXT_PUBLIC_ADDRESS_STATE_NAME', 'Texas'),
  addressPostal: env('NEXT_PUBLIC_ADDRESS_POSTAL', '00000'),
  addressCountry: env('NEXT_PUBLIC_ADDRESS_COUNTRY', 'US'),
  /** Full line for display, e.g. footer */
  addressDisplay: env(
    'NEXT_PUBLIC_ADDRESS_DISPLAY',
    '123 Main Street, Your City, TX 00000',
  ),
  mapsLink: env('NEXT_PUBLIC_MAPS_URL', 'https://maps.google.com'),
  latitude: parseFloat(env('NEXT_PUBLIC_GEO_LAT', '29.76')),
  longitude: parseFloat(env('NEXT_PUBLIC_GEO_LNG', '-95.37')),
  geoRegionMeta: env('NEXT_PUBLIC_GEO_REGION_META', 'US-TX'),
  geoPlacename: env('NEXT_PUBLIC_GEO_PLACENAME', 'Your City'),
  areaServedCity: env('NEXT_PUBLIC_AREA_SERVED_CITY', 'Your City'),
  areaServedMetro: env('NEXT_PUBLIC_AREA_SERVED_METRO', 'Your metro area'),
  openingHoursSchema: env('NEXT_PUBLIC_OPENING_HOURS_SCHEMA', 'Mo-Su 11:00-21:00'),
  hoursLine1: env('NEXT_PUBLIC_HOURS_LINE1', 'Monday - Sunday'),
  hoursLine2: env('NEXT_PUBLIC_HOURS_LINE2', '11:00 AM - 9:00 PM'),
  servesCuisine: env('NEXT_PUBLIC_SERVES_CUISINE', 'Local, Comfort food')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),
  paymentAccepted: env('NEXT_PUBLIC_PAYMENT_METHODS', 'Cash, Credit Card')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),
  social: {
    instagram: env('NEXT_PUBLIC_SOCIAL_INSTAGRAM', 'https://instagram.com'),
    facebook: env('NEXT_PUBLIC_SOCIAL_FACEBOOK', 'https://facebook.com'),
    x: env('NEXT_PUBLIC_SOCIAL_X', 'https://x.com'),
    tiktok: env('NEXT_PUBLIC_SOCIAL_TIKTOK', 'https://tiktok.com'),
    youtube: env('NEXT_PUBLIC_SOCIAL_YOUTUBE', 'https://youtube.com'),
  },
  twitterCreator: env('NEXT_PUBLIC_TWITTER_CREATOR', '@yourbrand'),
  themeColor: env('NEXT_PUBLIC_THEME_COLOR', '#FF6B35'),
  /** Optional: omit from JSON-LD if unset */
  schemaRatingValue: process.env.NEXT_PUBLIC_SCHEMA_RATING_VALUE?.trim(),
  schemaReviewCount: process.env.NEXT_PUBLIC_SCHEMA_REVIEW_COUNT?.trim(),
};

export const sameAsSocial = [
  siteConfig.social.facebook,
  siteConfig.social.instagram,
].filter(Boolean);
