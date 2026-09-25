export default function CompanySettingsLoading() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 animate-pulse">
      <div className="mb-6 h-8 w-48 rounded-lg bg-slate-100" />
      <div className="space-y-4 rounded-3xl border border-slate-100 bg-white p-6">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="space-y-2">
            <div className="h-3 w-28 rounded-full bg-slate-100" />
            <div className="h-11 rounded-xl bg-slate-100" />
          </div>
        ))}
        <div className="h-11 w-40 rounded-xl bg-slate-100" />
      </div>
    </div>
  );
}
