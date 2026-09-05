import { Search, Bell, ChevronDown, UserCircle2 } from 'lucide-react';

type TopBarProps = {
  title: string;
  accountName?: string;
  accountRole?: string;
  actions?: React.ReactNode;
};

export default function TopBar({
  title,
  accountName = 'Company Admin',
  accountRole = 'Admin',
  actions,
}: TopBarProps) {
  return (
    <header className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-8 py-5">
      <h1 className="text-xl font-semibold text-slate-900">{title}</h1>

      <div className="flex items-center gap-4">
        {actions}

        <div className="relative hidden sm:block">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            placeholder="Search interns, tasks..."
            className="w-64 rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-600 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
          />
        </div>

        <button
          type="button"
          aria-label="Notifications"
          className="relative rounded-full p-2 text-slate-500 hover:bg-slate-100"
        >
          <Bell size={19} />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-slate-50" />
        </button>

        <button
          type="button"
          className="flex items-center gap-2 rounded-lg py-1 pl-1 pr-2 hover:bg-slate-100"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-700 text-white">
            <UserCircle2 size={18} />
          </div>
          <div className="text-left leading-tight">
            <p className="text-sm font-medium text-slate-900">{accountName}</p>
            <p className="text-xs text-slate-400">{accountRole}</p>
          </div>
          <ChevronDown size={16} className="text-slate-400" />
        </button>
      </div>
    </header>
  );
}