export default function CompanyProfileLoading() {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 animate-pulse">
      <div className="h-40 rounded-3xl bg-slate-100" />
      <div className="-mt-10 px-6">
        <div className="h-20 w-20 rounded-2xl bg-slate-200" />
        <div className="mt-3 h-6 w-56 rounded-full bg-slate-100" />
        <div className="mt-2 h-4 w-40 rounded-full bg-slate-100" />
      </div>
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-28 rounded-2xl bg-slate-100" />
        ))}
      </div>
    </div>
  );
}
