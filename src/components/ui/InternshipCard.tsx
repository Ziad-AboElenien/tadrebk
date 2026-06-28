'use client';

import Link from 'next/link';
import { Internship } from '@/types/internship';
import Badge from './Badge';
import Button from './Button';
import { useCallback, useState } from 'react';
import { toast } from 'react-toastify';

interface InternshipCardProps {
  internship: Internship;
  compact?: boolean;
}

export default function InternshipCard({
  internship,
  compact = false,
}: InternshipCardProps) {
  const [saved, setSaved] = useState(false);

  const handleSave = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toast.info('Bookmark feature coming soon', {
      position: 'bottom-right',
      autoClose: 3000,
    });
  }, []);

  const handleApply = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toast.info('Apply feature coming soon', {
      position: 'bottom-right',
      autoClose: 3000,
    });
  }, []);

  const locationEmojis: Record<string, string> = {
    'on-site': '📍',
    remote: '🌐',
    hybrid: '🔀',
  };

  if (compact) {
    return (
      <Link href={`/internships/${internship._id}`}>
        <div className="p-4 border border-slate-200 rounded-lg hover:shadow-md transition-shadow">
          <h3 className="font-semibold text-slate-900 line-clamp-2 mb-2">
            {internship.title}
          </h3>
          <div className="flex flex-wrap gap-2 mb-3">
            <Badge variant="info">{locationEmojis[internship.location]} {internship.location}</Badge>
            <Badge variant="info">⏰ {internship.workingTime}</Badge>
          </div>
          <p className="text-sm text-slate-600 line-clamp-2 mb-3">
            {internship.description}
          </p>
          <div className="flex flex-wrap gap-1">
            {internship.technicalSkills.slice(0, 2).map((skill) => (
              <span
                key={skill}
                className="inline-block px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded"
              >
                {skill}
              </span>
            ))}
            {internship.technicalSkills.length > 2 && (
              <span className="inline-block px-2 py-1 text-xs text-slate-500">
                +{internship.technicalSkills.length - 2}
              </span>
            )}
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/internships/${internship._id}`}>
      <div className="p-6 border border-slate-200 rounded-lg hover:shadow-lg transition-all duration-200">
        <div className="flex justify-between items-start mb-4">
          <h3 className="font-bold text-lg text-slate-900 flex-1 line-clamp-2">
            {internship.title}
          </h3>
          <button
            onClick={handleSave}
            className="ml-2 text-xl hover:scale-110 transition-transform"
            aria-label="Save internship"
          >
            {saved ? '❤️' : '🤍'}
          </button>
        </div>

        <p className="text-sm text-slate-600 mb-4 line-clamp-3">
          {internship.description}
        </p>

        <div className="flex flex-wrap gap-2 mb-4">
          <Badge variant="info">{locationEmojis[internship.location]} {internship.location}</Badge>
          <Badge variant="info">⏰ {internship.workingTime}</Badge>
          {internship.closed && (
            <Badge variant="danger">Closed</Badge>
          )}
        </div>

        <div className="mb-4">
          <p className="text-xs text-slate-500 mb-2">Technical Skills:</p>
          <div className="flex flex-wrap gap-2">
            {internship.technicalSkills.map((skill) => (
              <span
                key={skill}
                className="inline-block px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        <div className="flex gap-2 pt-4 border-t border-slate-100">
          <Button
            variant="primary"
            size="md"
            onClick={handleApply}
            className="flex-1"
          >
            Apply Now
          </Button>
          <Button
            variant="outline"
            size="md"
            onClick={handleSave}
            className="flex-1"
          >
            Save
          </Button>
        </div>
      </div>
    </Link>
  );
}
