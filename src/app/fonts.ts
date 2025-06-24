import { Inter } from 'next/font/google';
import localFont from 'next/font/local';

export const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

export const samarkan = localFont({
  src: '../fonts/samarkan/saman___.ttf',
  variable: '--font-samarkan',
});

export const displayFont = localFont({
  src: '../fonts/against_2/against-regular.ttf',
  variable: '--font-display',
  display: 'swap',
});

export const butler = localFont({
  src: '../fonts/butler/Butler/butler-light.otf',
  variable: '--font-butler',
}); 