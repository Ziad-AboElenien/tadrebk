'use client';

export interface StudentCardData {
  name: string;
  university: string;
  major: string;
  graduation: string;
  email: string;
  avatarUrl?: string | null;
}

export default function StudentProfileCard({ student }: { student: StudentCardData }) {
  const fields = [
    { label: 'MAJOR', value: student.major },
    { label: 'GRADUATION', value: student.graduation },
    { label: 'EMAIL', value: student.email },
  ];

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="relative h-28 bg-gradient-to-r from-emerald-500 to-emerald-400">
        <div className="absolute -bottom-12 left-1/2 -translate-x-1/2">
          {student.avatarUrl ? (
            <img
              src={student.avatarUrl}
              alt={student.name}
              loading="lazy"
              decoding="async"
              className="h-24 w-24 rounded-2xl border-4 border-white object-cover shadow-lg"
            />
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded-2xl border-4 border-white bg-slate-200 text-2xl font-bold text-slate-400 shadow-lg">
              {student.name.split(' ').map((w) => w[0]).slice(0, 2).join('')}
            </div>
          )}
        </div>
      </div>

      <div className="px-6 pb-6 pt-16 text-center">
        <h3 className="break-words text-2xl font-bold text-slate-900">{student.name}</h3>
        <p className="break-words text-sm text-slate-400">{student.university}</p>
      </div>

      <div className="grid grid-cols-1 gap-3 px-6 pb-6 sm:grid-cols-2">
        {fields.map((f) => (
          <div key={f.label} className="rounded-xl bg-slate-50 px-4 py-3 text-left">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{f.label}</p>
            <p className="mt-0.5 break-words text-sm font-semibold text-slate-900">{f.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
