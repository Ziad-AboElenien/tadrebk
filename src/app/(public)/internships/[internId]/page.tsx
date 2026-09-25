import type { Metadata } from 'next';
import InternshipDetailsScreen from '@/features/internship/screens/internship-details.screen';

const BACKEND =
  process.env.BACKEND_PROXY_TARGET || 'https://tadreebak-e285.onbelmo.uk/api/v1';

interface InternshipPayload {
  _id: string;
  title?: string;
  description?: string;
  location?: string;
  workingTime?: string;
  technicalSkills?: string[];
  createdAt?: string;
  closed?: boolean;
  companyId?: { name?: string } | string | null;
  company?: { name?: string } | null;
}

async function fetchInternship(id: string): Promise<InternshipPayload | null> {
  try {
    const res = await fetch(`${BACKEND}/internships/${id}`, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    const json = await res.json();
    return (json?.data?.internship ?? json?.data ?? null) as InternshipPayload | null;
  } catch {
    return null;
  }
}

function companyNameOf(intern: InternshipPayload): string {
  if (intern.company && typeof intern.company === 'object' && intern.company.name) return intern.company.name;
  if (intern.companyId && typeof intern.companyId === 'object' && intern.companyId.name) return intern.companyId.name;
  return 'Company';
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ internId: string }>;
}): Promise<Metadata> {
  const { internId } = await params;
  const intern = await fetchInternship(internId);
  if (!intern) return { title: 'Internship' };
  return {
    title: intern.title || 'Internship',
    description: (intern.description || '').slice(0, 160) || `Apply for ${intern.title} at ${companyNameOf(intern)} on Tadrebk.`,
  };
}

export default async function InternshipDetailsPage({
  params,
}: {
  params: Promise<{ internId: string }>;
}) {
  const { internId } = await params;
  const intern = await fetchInternship(internId);

  const jobJsonLd = intern
    ? {
        '@context': 'https://schema.org',
        '@type': 'JobPosting',
        title: intern.title,
        description: (intern.description || intern.title) ?? '',
        datePosted: intern.createdAt,
        employmentType:
          intern.workingTime === 'full-time' ? 'FULL_TIME' : intern.workingTime === 'part-time' ? 'PART_TIME' : undefined,
        hiringOrganization: {
          '@type': 'Organization',
          name: companyNameOf(intern),
        },
        jobLocationType: intern.location === 'remote' ? 'TELECOMMUTE' : undefined,
        validThrough: undefined,
      }
    : null;

  return (
    <>
      {jobJsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jobJsonLd) }} />
      )}
      {intern && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'BreadcrumbList',
              itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://tadrebk.vercel.app/' },
                { '@type': 'ListItem', position: 2, name: 'Internships', item: 'https://tadrebk.vercel.app/internships' },
                { '@type': 'ListItem', position: 3, name: intern.title },
              ],
            }),
          }}
        />
      )}
      <InternshipDetailsScreen key={internId} />
    </>
  );
}
