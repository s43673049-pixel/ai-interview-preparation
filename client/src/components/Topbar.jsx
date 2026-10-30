import { Bell, Menu, Search } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Topbar({ onMenuClick }) {
  const { user } = useAuth();
  const initials = user?.name?.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <header className="flex items-center justify-between border-b border-slate-100 bg-white px-4 py-3 lg:px-6">
      <div className="flex items-center gap-3">
        <button onClick={onMenuClick} className="rounded-lg p-2 hover:bg-slate-100 lg:hidden">
          <Menu size={20} />
        </button>
        <div className="hidden items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-400 sm:flex">
          <Search size={16} />
          <span>Search anything...</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="rounded-lg p-2 hover:bg-slate-100">
          <Bell size={18} className="text-slate-500" />
        </button>
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700">
            {initials || "U"}
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium leading-tight">{user?.name}</p>
            <p className="text-xs text-slate-400 leading-tight">{user?.email}</p>
          </div>
        </div>
      </div>
    </header>
  );
}