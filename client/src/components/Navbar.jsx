import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="border-b border-slate-200 bg-white">
      <nav className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
        <Link to="/dashboard" className="text-lg font-bold text-brand-600">
          InterviewAI
        </Link>
        <div className="flex items-center gap-4 text-sm">
          {user ? (
            <>
              <Link to="/dashboard" className="text-slate-600 hover:text-slate-900">Dashboard</Link>
              <Link to="/interview" className="text-slate-600 hover:text-slate-900">New Interview</Link>
              <span className="hidden text-slate-400 sm:inline">|</span>
              <span className="hidden text-slate-700 sm:inline">{user.name}</span>
              <button onClick={handleLogout} className="btn-secondary !py-1 text-sm">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-slate-600 hover:text-slate-900">Log in</Link>
              <Link to="/register" className="btn-primary !py-1 text-sm">Sign up</Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}