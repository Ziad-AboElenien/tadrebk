'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { userService } from '@/services/user.service';
import { User, getUserImgUrl } from '@/types/user';
import { getFileProxyUrl } from '@/lib/file-proxy';
import Spinner from '@/components/ui/Spinner';
import Button from '@/components/ui/Button';
import { getErrorMessage } from '@/lib/axios';
import { toast } from 'react-toastify';
import Link from 'next/link';

function formatDate(dateStr?: string): string {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
}

export default function ApplicantProfilePage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.userId as string;

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await userService.getUserProfile(userId);
        setUser(data);
      } catch (err) {
        toast.error(getErrorMessage(err));
        router.back();
      } finally {
        setLoading(false);
      }
    })();
  }, [userId, router]);

  if (loading) {
    return <div className="flex justify-center py-20"><Spinner /></div>;
  }

  if (!user) return null;

  const displayName = `${user.firstName} ${user.lastName}`.trim();

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="mx-auto max-w-4xl px-4 sm:px-8 py-8">
        <button onClick={() => router.back()} className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline">
          <i className="fas fa-arrow-left text-xs" /> Back to applications
        </button>

        {/* Cover */}
        <div className="relative h-48 sm:h-56 md:h-64 rounded-3xl overflow-hidden bg-gradient-to-r from-sky-500/20 via-blue-500/20 to-indigo-500/20">
            {getUserImgUrl(user.coverPicture) ? (
            <img src={getUserImgUrl(user.coverPicture)!} alt="Cover" className="absolute inset-0 w-full h-full object-cover" />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-r from-sky-500/10 via-blue-500/10 to-indigo-500/10" />
          )}
        </div>

        {/* Avatar + header */}
        <div className="relative px-4 sm:px-6 -mt-14 mb-8">
          <div className="flex items-end gap-4 flex-wrap">
            {getUserImgUrl(user.profilePicture) ? (
              <div className="w-32 h-32 rounded-full overflow-hidden ring-4 ring-white shadow-xl shrink-0">
                <img src={getUserImgUrl(user.profilePicture)!} alt={displayName} className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center ring-4 ring-white shadow-xl shrink-0">
                <span className="text-4xl font-bold text-white select-none">
                  {displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                </span>
              </div>
            )}
            <div className="pb-1">
              <h1 className="text-2xl sm:text-3xl font-black text-dark">{displayName}</h1>
              <p className="text-gray-500 flex items-center gap-1.5 mt-0.5">
                <i className="fas fa-envelope text-xs" />{user.email}
              </p>
              {user.phoneNumber && (
                <p className="text-gray-500 flex items-center gap-1.5 mt-0.5">
                  <i className="fas fa-phone text-xs" />{user.phoneNumber}
                </p>
              )}
            </div>
          </div>

          {user.headline && (
            <p className="text-gray-600 mt-4 flex items-center gap-2">
              <i className="fas fa-briefcase text-gray-300 text-xs" />{user.headline}
            </p>
          )}

          <div className="flex flex-wrap gap-5 mt-4 text-sm text-gray-500">
            {user.address && (
              <span className="flex items-center gap-1.5"><i className="fas fa-location-dot text-gray-300 text-xs" />{user.address}</span>
            )}
            {user.dateOfBirth && (
              <span className="flex items-center gap-1.5"><i className="fas fa-cake-candles text-gray-300 text-xs" />{formatDate(user.dateOfBirth)}</span>
            )}
            {user.createdAt && (
              <span className="flex items-center gap-1.5"><i className="fas fa-calendar text-gray-300 text-xs" />Joined {formatDate(user.createdAt)}</span>
            )}
          </div>
        </div>

        {/* Bio */}
        {user.bio && (
          <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-sm mb-6">
            <h2 className="font-bold text-dark text-lg mb-3 flex items-center gap-2"><i className="fas fa-user-pen text-primary text-base" />About</h2>
            <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{user.bio}</p>
          </div>
        )}

        {/* Skills */}
        {user.skills && user.skills.length > 0 && (
          <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-sm mb-6">
            <h2 className="font-bold text-dark text-lg mb-4 flex items-center gap-2"><i className="fas fa-star text-primary text-base" />Skills</h2>
            <div className="flex flex-wrap gap-2">
              {user.skills.map((skill) => (
                <span key={skill} className="px-4 py-1.5 bg-sky-50 text-primary text-sm font-semibold rounded-full border border-sky-100">{skill}</span>
              ))}
            </div>
          </div>
        )}

        {/* Experience */}
        {user.experience && user.experience.length > 0 && (
          <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-sm mb-6">
            <h2 className="font-bold text-dark text-lg mb-4 flex items-center gap-2"><i className="fas fa-briefcase text-primary text-base" />Experience</h2>
            <div className="space-y-5">
              {user.experience.map((exp, i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-400 to-purple-600 flex items-center justify-center text-white font-bold shrink-0">
                    {exp.company[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-dark">{exp.title}</p>
                    <p className="text-sm text-gray-500">{exp.company}</p>
                    {(exp.startDate || exp.endDate) && (
                      <p className="text-xs text-gray-400 mt-0.5">{formatDate(exp.startDate)} - {exp.endDate ? formatDate(exp.endDate) : 'Present'}</p>
                    )}
                    {exp.description && <p className="text-sm text-gray-600 mt-1">{exp.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        {user.education && user.education.length > 0 && (
          <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-sm mb-6">
            <h2 className="font-bold text-dark text-lg mb-4 flex items-center gap-2"><i className="fas fa-graduation-cap text-primary text-base" />Education</h2>
            <div className="space-y-5">
              {user.education.map((edu, i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center text-white font-bold shrink-0">
                    {edu.institution[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-dark">{edu.institution}</p>
                    {edu.degree && <p className="text-sm text-gray-500">{edu.degree}{edu.field ? `, ${edu.field}` : ''}</p>}
                    {(edu.startDate || edu.endDate) && (
                      <p className="text-xs text-gray-400 mt-0.5">{formatDate(edu.startDate)} - {edu.endDate ? formatDate(edu.endDate) : 'Present'}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Resume */}
        {getUserImgUrl(user.resume) && (
          <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-sm mb-6">
            <h2 className="font-bold text-dark text-lg mb-4 flex items-center gap-2"><i className="fas fa-file-pdf text-primary text-base" />Resume</h2>
            <a
              href={getFileProxyUrl(user.resume)!}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 rounded-xl bg-red-50 p-4 hover:bg-red-100 transition-colors"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100 text-red-500">
                <i className="fas fa-file-pdf" />
              </span>
              <div>
                <p className="text-sm font-semibold text-gray-900">View Resume</p>
                <p className="text-xs text-gray-400">Click to open PDF</p>
              </div>
              <i className="fas fa-external-link-alt text-red-400 ml-auto" />
            </a>
          </div>
        )}

        {/* Contact info */}
        <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-sm mb-6">
          <h2 className="font-bold text-dark text-lg mb-4 flex items-center gap-2"><i className="fas fa-address-card text-primary text-base" />Contact info</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-400 text-xs uppercase tracking-wide font-semibold">Email</p>
              <p className="text-gray-700 mt-0.5">{user.email}</p>
            </div>
            {user.phoneNumber && (
              <div>
                <p className="text-gray-400 text-xs uppercase tracking-wide font-semibold">Phone</p>
                <p className="text-gray-700 mt-0.5">{user.phoneNumber}</p>
              </div>
            )}
            {user.address && (
              <div>
                <p className="text-gray-400 text-xs uppercase tracking-wide font-semibold">Address</p>
                <p className="text-gray-700 mt-0.5">{user.address}</p>
              </div>
            )}
            {user.gender && (
              <div>
                <p className="text-gray-400 text-xs uppercase tracking-wide font-semibold">Gender</p>
                <p className="text-gray-700 mt-0.5 capitalize">{user.gender}</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
