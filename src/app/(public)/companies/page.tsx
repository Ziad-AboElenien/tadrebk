import type { Metadata } from 'next';
import CompaniesListingScreen from '@/features/company/screens/companies-listing.screen';

export const metadata: Metadata = {
  title: 'Our Partners',
  description:
    'Browse verified companies hiring interns through Tadrebk across Egypt.',
};

export default function CompaniesPage() {
  return <CompaniesListingScreen />;
}
