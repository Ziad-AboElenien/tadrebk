import type { Metadata } from 'next';
import AboutScreen from '@/features/home/screens/about.screen';

export const metadata: Metadata = {
  title: 'About Us',
  description:
    'Learn about Tadrebk — the platform connecting Egyptian university students with verified internship opportunities.',
};

export default function AboutPage() {
  const orgJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Tadrebk',
    url: 'https://tadrebk.vercel.app',
    description:
      'The first platform in Egypt connecting university students with internship opportunities from top companies.',
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }} />
      <AboutScreen />
    </>
  );
}
