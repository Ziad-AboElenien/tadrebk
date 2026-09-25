export default function PostInternshipLoading() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 animate-pulse">
      <div className="mb-6 space-y-2">
        <div className="h-8 w-64 rounded-lg bg-slate-100" />
        <div className="h-4 w-96 max-w-full rounded-full bg-slate-100" />
      </div>
      <div className="space-y-4 rounded-3xl border border-slate-100 bg-white p-6">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="space-y-2">
            <div className="h-3 w-28 rounded-full bg-slate-100" />
            <div className="h-11 rounded-xl bg-slate-100" />
          </div>
        ))}
        <div className="h-11 w-full rounded-xl bg-slate-100" />
      </div>
    </div>
  );
}
