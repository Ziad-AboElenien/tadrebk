import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Tadrebk — Find Internships in Egypt',
    short_name: 'Tadrebk',
    description:
      'The platform connecting Egyptian university students with verified internship opportunities.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#10b981',
    icons: [
      {
        src: '/images/favicon2.png',
        sizes: 'any',
        type: 'image/png',
      },
    ],
  };
}
