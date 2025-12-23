import { Cinzel } from 'next/font/google';
import localFont from 'next/font/local';

// Cinzel for "R"
export const cinzel = Cinzel({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  display: 'swap',
});

// Futura for "AVEN" (local file)
export const futura = localFont({
  src: [
    {
      path: '../public/fonts/Futura.ttf',
      weight: '400',
      style: 'normal',
    },
  ],
  display: 'swap',
});
