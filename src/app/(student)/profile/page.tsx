'use client';

import Link from 'next/link';
import { useAppSelector } from '@/store/store';
import Avatar from '@/components/ui/Avatar';
import Button from '@/components/ui/Button';

export default function StudentProfilePage() {
  const user = useAppSelector((s) => s.user.currentUser);

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-500 mb-4">Please sign in to view your profile.</p>
        <Link href="/login/student">
          <Button>Sign In</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm">
        <div className="flex items-center gap-4 mb-8">
          <Avatar
            src={user.profilePicture}
            name={`${user.firstName} ${user.lastName}`}
            size="lg"
          />
          <div>
            <h1 className="text-2xl font-black text-dark">
              {user.firstName} {user.lastName}
            </h1>
            <p className="text-gray-500">{user.email}</p>
          </div>
        </div>

        <dl className="space-y-4 text-sm">
          {user.headline && (
            <div>
              <dt className="font-semibold text-gray-700">Headline</dt>
              <dd className="text-gray-600">{user.headline}</dd>
            </div>
          )}
          {user.phoneNumber && (
            <div>
              <dt className="font-semibold text-gray-700">Phone</dt>
              <dd className="text-gray-600">{user.phoneNumber}</dd>
            </div>
          )}
          {user.bio && (
            <div>
              <dt className="font-semibold text-gray-700">Bio</dt>
              <dd className="text-gray-600">{user.bio}</dd>
            </div>
          )}
          {user.skills && user.skills.length > 0 && (
            <div>
              <dt className="font-semibold text-gray-700 mb-2">Skills</dt>
              <dd className="flex flex-wrap gap-2">
                {user.skills.map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1 bg-emerald-50 text-primary text-xs font-semibold rounded-full"
                  >
                    {skill}
                  </span>
                ))}
              </dd>
            </div>
          )}
        </dl>

        <p className="text-xs text-gray-400 mt-8">
          Profile editing will be available in the next update.
        </p>
      </div>
    </div>
  );
}
