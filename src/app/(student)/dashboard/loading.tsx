export default function DashboardLoading() {
  return (
    <div className="mx-auto w-full max-w-6xl flex-1 space-y-6 px-[2.5%] py-6 sm:px-6 sm:py-10 animate-pulse">
      <div className="h-8 w-64 rounded-full bg-slate-200" />
      <div className="h-40 rounded-2xl bg-slate-100" />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_20rem]">
        <div className="h-48 rounded-2xl bg-slate-100" />
        <div className="h-48 rounded-2xl bg-slate-100" />
      </div>
      <div className="h-56 rounded-2xl bg-slate-100" />
    </div>
  );
}
