import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, PlayCircle, History, BarChart3, User, Settings, LogOut, Sparkles,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/interview", label: "Start Interview", icon: PlayCircle },
  { to: "/history", label: "History", icon: History },
  { to: "/performance", label: "Performance", icon: BarChart3 },
  { to: "/profile", label: "Profile", icon: User },
];

export default function Sidebar({ open, onClose }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-30 bg-black/30 lg:hidden" onClick={onClose} />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-navy-900 px-4 py-6 transition-transform
          lg:static lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="mb-8 flex items-center gap-2 px-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600">
            <Sparkles size={16} className="text-white" />
          </div>
          <span className="font-semibold text-white">AI Interview Prep</span>
        </div>

        <nav className="flex-1 space-y-1">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? "sidebar-link-active" : ""}`
              }
            >
               {({ isActive }) => (
        <>
          <Icon size={18} className={isActive ? "text-white" : "text-slate-400"} />
          <span>{label}</span>
        </>
               )}
            </NavLink>
          ))}
        </nav>

        <div className="space-y-1 border-t border-white/10 pt-4">
          <NavLink to="/profile" className="sidebar-link">
            <Settings size={18} className="text-slate-400" />
            <span>Settings</span>
          </NavLink>
          <button onClick={handleLogout} className="sidebar-link w-full">
            <LogOut size={18} className="text-slate-400" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}