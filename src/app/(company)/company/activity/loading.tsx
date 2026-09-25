export default function CompanyActivityLoading() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 animate-pulse">
      <div className="mb-6 space-y-2">
        <div className="h-8 w-48 rounded-lg bg-slate-100" />
        <div className="h-4 w-72 max-w-full rounded-full bg-slate-100" />
      </div>
      <div className="space-y-6">
        {[0, 1].map((i) => (
          <div key={i} className="overflow-hidden rounded-3xl border border-slate-100 bg-white">
            <div className="flex items-center gap-3 p-5">
              <div className="h-12 w-12 shrink-0 rounded-2xl bg-slate-100" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-40 rounded-full bg-slate-100" />
                <div className="h-3 w-24 rounded-full bg-slate-100" />
              </div>
            </div>
            <div className="space-y-2 px-5 pb-6">
              <div className="h-5 w-2/3 rounded-lg bg-slate-100" />
              <div className="h-4 w-1/2 rounded-lg bg-slate-100" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
