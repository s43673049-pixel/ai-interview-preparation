import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";
import ScoreBadge from "../components/ScoreBadge";
import Spinner from "../components/Spinner";

export default function Dashboard() {
    const { user } = useAuth();
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/api/sessions')
            .then(({data}) => { setSessions(data)
            setLoading(false);
            });
    }, []);

    const completed = sessions.filter((s) => s.status ==='completed' &&  s.overall_score !== null);
    const avgScore = completed.length > 0 ? (completed.reduce((sum, s) => sum + s.overall_score, 0) / completed.length).toFixed(1) : "-";

    return (
       <>
       <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Hi, {user?.name} 👋</h1>
          <p className="text-slate-500">Practice makes offers. Ready for another round?</p>
        </div>
        <Link to="/interview" className="btn-primary">Start new interview</Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="card">
          <p className="text-sm text-slate-500">Total sessions</p>
          <p className="text-3xl font-bold">{sessions.length}</p>
        </div>
        <div className="card">
          <p className="text-sm text-slate-500">Completed</p>
          <p className="text-3xl font-bold">{completed.length}</p>
        </div>
        <div className="card">
          <p className="text-sm text-slate-500">Average score</p>
          <p className="text-3xl font-bold">{avgScore !== null ? avgScore : "–"}</p>
        </div>
      </div>

      <div className="card">
        <h2 className="mb-4 text-lg font-semibold">History</h2>
        {loading ? (
          <Spinner />
        ) : sessions.length === 0 ? (
          <p className="text-slate-500">No interviews yet. Start your first one!</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {sessions.map((s) => (
              <li key={s.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium">{s.role}</p>
                  <p className="text-sm text-slate-500">
                    {s.difficulty} · {new Date(s.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {s.status === "completed" ? (
                    <>
                      <ScoreBadge score={s.overall_score} />
                      <Link to={`/results/${s.id}`} className="text-sm text-brand-600 hover:underline">
                        View
                      </Link>
                    </>
                  ) : (
                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-500">
                      In progress
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
       </>
    );

}
