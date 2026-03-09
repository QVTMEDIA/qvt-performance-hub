import type { Metadata } from 'next';
import { Montserrat } from 'next/font/google';
import './globals.css';

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-montserrat',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'QVT Media Performance Hub',
  description: 'Performance appraisal management system for QVT Media',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={montserrat.variable}>
      <body style={{ margin: 0, padding: 0, fontFamily: 'var(--font-montserrat), Montserrat, sans-serif', background: '#04111e' }}>
        {children}
      </body>
    </html>
  );
}
