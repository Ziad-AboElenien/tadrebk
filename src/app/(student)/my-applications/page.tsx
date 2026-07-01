import { redirect } from 'next/navigation';

export default function MyApplicationsRedirect() {
  redirect('/dashboard');
}
