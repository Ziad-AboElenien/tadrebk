import type { MetadataRoute } from 'next';

const BASE = 'https://tadrebk.vercel.app';
const BACKEND =
  process.env.BACKEND_PROXY_TARGET || 'https://tadreebak-e285.onbelmo.uk/api/v1';

const STATIC_ROUTES = [
  '',
  '/internships',
  '/companies',
  '/guide/student',
  '/guide/company',
  '/about',
  '/contact',
  '/faq',
  '/help',
  '/terms',
  '/privacy',
];

async function fetchIds(path: string, pick: (json: unknown) => string[]): Promise<string[]> {
  try {
    const res = await fetch(`${BACKEND}${path}`, { next: { revalidate: 86400 } });
    if (!res.ok) return [];
    const json = await res.json();
    return pick(json);
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const [internshipIds, companyIds] = await Promise.all([
    fetchIds('/internships?limit=100', (json) => {
      const data = (json as { data?: { internships?: { _id?: string }[] } })?.data;
      return (data?.internships ?? []).map((i) => i._id).filter(Boolean) as string[];
    }),
    fetchIds('/company/?limit=100', (json) => {
      const data = (json as { data?: { companies?: { _id?: string }[] } | { _id?: string }[] })?.data;
      const list = Array.isArray(data) ? data : (data?.companies ?? []);
      return list.map((c) => c._id).filter(Boolean) as string[];
    }),
  ]);

  return [
    ...STATIC_ROUTES.map((route) => ({
      url: `${BASE}${route}`,
      lastModified: now,
      changeFrequency: (route === '' ? 'daily' : 'weekly') as 'daily' | 'weekly',
      priority: route === '' ? 1 : route.startsWith('/internships') || route === '/companies' ? 0.8 : 0.6,
    })),
    ...internshipIds.map((id) => ({
      url: `${BASE}/internships/${id}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })),
    ...companyIds.map((id) => ({
      url: `${BASE}/companies/${id}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })),
  ];
}
