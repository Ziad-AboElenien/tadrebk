'use client';

import Link from 'next/link';
import { useAppSelector } from '@/store/store';
import ComingSoonCard from '@/components/ui/ComingSoonCard';
import Button from '@/components/ui/Button';
import Avatar from '@/components/ui/Avatar';

export default function StudentDashboardPage() {
  const user = useAppSelector((s) => s.user.currentUser);

  const displayName = user
    ? `${user.firstName} ${user.lastName}`.trim()
    : 'Student';

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <div className="bg-white border border-gray-100 rounded-3xl p-8 mb-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center gap-6">
          <Avatar
            src={user?.profilePicture}
            name={displayName}
            size="lg"
          />
          <div className="flex-1">
            <h1 className="text-2xl font-black text-dark mb-1">
              Welcome back, {user?.firstName || 'there'}!
            </h1>
            <p className="text-gray-500 text-sm">
              {user?.email || 'Complete your profile to get better matches.'}
            </p>
          </div>
          <Link href="/profile">
            <Button variant="outline">View Profile</Button>
          </Link>
        </div>
      </div>

      <h2 className="text-lg font-bold text-dark mb-4">Your activity</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ComingSoonCard
          icon="fas fa-paper-plane"
          title="Applications"
          description="Track internships you've applied to."
        />
        <ComingSoonCard
          icon="fas fa-calendar-check"
          title="Interviews"
          description="Manage upcoming interview schedules."
        />
        <ComingSoonCard
          icon="fas fa-bookmark"
          title="Saved Roles"
          description="Bookmark internships for later."
        />
      </div>
    </div>
  );
}
