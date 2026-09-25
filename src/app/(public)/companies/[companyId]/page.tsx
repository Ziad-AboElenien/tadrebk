import type { Metadata } from 'next';
import CompanyDetailsScreen from '@/features/company/screens/company-details.screen';

const BACKEND =
  process.env.BACKEND_PROXY_TARGET || 'https://tadreebak-e285.onbelmo.uk/api/v1';

async function fetchCompany(id: string): Promise<{ name?: string; industry?: string } | null> {
  try {
    const res = await fetch(`${BACKEND}/company/${id}`, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    const json = await res.json();
    return (json?.data?.company ?? json?.data ?? null) as { name?: string; industry?: string } | null;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ companyId: string }>;
}): Promise<Metadata> {
  const { companyId } = await params;
  const company = await fetchCompany(companyId);
  if (!company?.name) return { title: 'Company' };
  return {
    title: company.name,
    description: `Explore ${company.name}'s internships${company.industry ? ` in ${company.industry}` : ''} on Tadrebk.`,
  };
}

export default function PublicCompanyProfilePage() {
  return <CompanyDetailsScreen />;
}
