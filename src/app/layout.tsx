import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import Providers from './providers';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: {
    default: 'Tadrebk — Find Internships in Egypt',
    template: '%s | Tadrebk',
  },
  description:
    'The first platform in Egypt that connects university students with internship opportunities from top companies. Find, apply, and launch your career with Tadrebk.',
  keywords: ['internship', 'egypt', 'students', 'tadrebk', 'تدريب', 'مصر'],
  authors: [{ name: 'Tadrebk Team' }],
  creator: 'Tadrebk',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://tadrebk.com',
    siteName: 'Tadrebk',
    title: 'Tadrebk — Find Internships in Egypt',
    description:
      'The first platform in Egypt connecting students with top internship opportunities.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tadrebk — Find Internships in Egypt',
    description:
      'The first platform in Egypt connecting students with top internship opportunities.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable} data-scroll-behavior="smooth">
      <head />
      <body className="min-h-screen flex flex-col antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
