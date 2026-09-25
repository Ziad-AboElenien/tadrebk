export default function MyApplicationsLoading() {
  return (
    <div className="mx-auto w-full max-w-6xl flex-1 space-y-4 px-[2.5%] py-6 sm:px-6 sm:py-10 animate-pulse">
      <div className="h-8 w-56 rounded-full bg-slate-200" />
      <div className="h-12 rounded-2xl bg-slate-100" />
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-20 rounded-2xl bg-slate-100" />
      ))}
    </div>
  );
}
