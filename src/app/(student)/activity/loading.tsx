export default function ActivityLoading() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-slate-100" />
        <div className="mt-2 h-4 w-72 animate-pulse rounded-full bg-slate-100" />
      </div>
      <div className="mb-8 flex gap-2">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-9 w-24 animate-pulse rounded-full bg-slate-100" />
        ))}
      </div>
      <div className="relative">
        <div className="absolute left-[15px] top-3 bottom-3 w-0.5 bg-slate-100" />
        <div className="space-y-5">
          {[0, 1, 2].map((i) => (
            <div key={i} className="relative pl-12">
              <span className="absolute left-[7px] top-7 h-[18px] w-[18px] animate-pulse rounded-full bg-slate-200" />
              <div className="animate-pulse rounded-3xl border border-slate-100 bg-white p-5 sm:p-6">
                <div className="h-5 w-24 rounded-full bg-slate-100" />
                <div className="mt-3 h-6 w-3/4 rounded-lg bg-slate-100" />
                <div className="mt-2 h-4 w-1/2 rounded-full bg-slate-100" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
