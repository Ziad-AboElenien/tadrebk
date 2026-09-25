export default function ProfileLoading() {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 animate-pulse">
      <div className="rounded-3xl border border-slate-100 bg-white p-6 sm:p-8">
        <div className="flex flex-col items-center gap-4 sm:flex-row">
          <div className="h-24 w-24 shrink-0 rounded-full bg-slate-100" />
          <div className="flex-1 space-y-2 text-center sm:text-left">
            <div className="mx-auto h-6 w-48 rounded-full bg-slate-100 sm:mx-0" />
            <div className="mx-auto h-4 w-32 rounded-full bg-slate-100 sm:mx-0" />
          </div>
        </div>
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-2xl bg-slate-100" />
          ))}
        </div>
      </div>
    </div>
  );
}
