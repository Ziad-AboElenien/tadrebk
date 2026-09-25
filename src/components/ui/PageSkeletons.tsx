export function AuthFormSkeleton() {
  return (
    <div className="mx-auto w-full max-w-md px-4 py-12 animate-pulse">
      <div className="mx-auto mb-4 h-12 w-12 rounded-2xl bg-slate-100" />
      <div className="mx-auto mb-8 h-6 w-48 rounded-full bg-slate-100" />
      <div className="space-y-4 rounded-3xl border border-slate-100 bg-white p-6">
        <div className="h-11 rounded-xl bg-slate-100" />
        <div className="h-11 rounded-xl bg-slate-100" />
        <div className="h-12 rounded-xl bg-slate-100" />
      </div>
    </div>
  );
}

export function ArticleSkeleton() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 animate-pulse">
      <div className="mx-auto mb-4 h-6 w-28 rounded-full bg-slate-100" />
      <div className="mx-auto mb-4 h-12 w-3/4 rounded-xl bg-slate-100" />
      <div className="mx-auto mb-10 h-4 w-1/2 rounded-full bg-slate-100" />
      <div className="space-y-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-40 rounded-3xl bg-slate-100" />
        ))}
      </div>
    </div>
  );
}

export function ListingPageSkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-pulse space-y-6">
      <div className="h-8 w-56 rounded bg-slate-100" />
      <div className="flex gap-3">
        <div className="h-10 flex-1 rounded-xl bg-slate-100" />
        <div className="h-10 w-32 rounded-xl bg-slate-100" />
      </div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="rounded-2xl border border-slate-100 bg-white p-4">
            <div className="h-36 rounded-xl bg-slate-100" />
            <div className="mt-3 h-5 w-3/4 rounded bg-slate-100" />
            <div className="mt-2 h-4 w-1/2 rounded bg-slate-100" />
          </div>
        ))}
      </div>
    </div>
  );
}
