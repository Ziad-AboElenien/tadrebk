export default function NotificationsLoading() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 animate-pulse">
      <div className="mb-6 h-8 w-48 rounded-lg bg-slate-100" />
      <div className="space-y-3">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-4">
            <div className="h-10 w-10 shrink-0 rounded-full bg-slate-100" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-3/4 rounded-full bg-slate-100" />
              <div className="h-3 w-1/3 rounded-full bg-slate-100" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
