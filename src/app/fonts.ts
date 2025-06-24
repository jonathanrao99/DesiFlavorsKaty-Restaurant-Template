import { Inter } from 'next/font/google';
import localFont from 'next/font/local';

export const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

export const samarkan = localFont({
  src: '../../public/Fonts/samarkan/saman___.ttf',
  variable: '--font-samarkan',
});

export const displayFont = localFont({
  src: '../../public/Fonts/against_2/against-regular.ttf',
  variable: '--font-display',
  display: 'swap',
});

export const butler = localFont({
  src: '../../public/Fonts/butler/Butler/butler-light.otf',
  variable: '--font-butler',
}); 