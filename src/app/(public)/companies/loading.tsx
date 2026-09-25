export default function CompaniesLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-16 animate-pulse">
      <div className="mx-auto mb-10 max-w-xl space-y-4 text-center">
        <div className="mx-auto h-6 w-32 rounded-full bg-slate-100" />
        <div className="mx-auto h-10 w-72 rounded-xl bg-slate-100" />
        <div className="mx-auto h-4 w-96 max-w-full rounded-full bg-slate-100" />
      </div>
      <div className="mx-auto mb-10 flex max-w-2xl flex-col gap-3 sm:flex-row">
        <div className="h-12 flex-1 rounded-xl bg-slate-100" />
        <div className="h-12 w-40 rounded-xl bg-slate-100" />
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="rounded-3xl border border-gray-50 bg-white p-6">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 shrink-0 rounded-2xl bg-slate-100" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 rounded-full bg-slate-100" />
                <div className="h-3 w-1/3 rounded-full bg-slate-100" />
              </div>
            </div>
            <div className="mt-5 space-y-2 border-t border-gray-50 pt-5">
              <div className="h-3 w-2/3 rounded-full bg-slate-100" />
              <div className="h-3 w-1/2 rounded-full bg-slate-100" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
