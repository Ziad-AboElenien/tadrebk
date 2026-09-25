import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/dashboard',
          '/profile',
          '/my-applications',
          '/my-tasks',
          '/activity',
          '/student/onboarding',
          '/notifications',
          '/settings',
          '/company/',
          '/admin/',
          '/login',
          '/signup',
          '/get-started',
          '/confirm-email',
          '/forgot-password',
          '/reset-password',
          '/change-email',
          '/change-password',
          '/certificate',
        ],
      },
    ],
    sitemap: 'https://tadrebk.vercel.app/sitemap.xml',
  };
}
