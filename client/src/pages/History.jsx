import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Search } from "lucide-react";
import api from "../api/client";
import Layout from "../components/Layout";
import ScoreBadge from "../components/ScoreBadge";
import Spinner from "../components/Spinner";

export default function History() {
  const [sessions, setSessions] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/interview/sessions").then(({ data }) => setSessions(data)).finally(() => setLoading(false));
  }, []);

  const filtered = sessions.filter((s) => s.role.toLowerCase().includes(query.toLowerCase()));

  return (
    <Layout>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Your Interview History</h1>
          <p className="text-slate-500">Track your progress and see how you're improving.</p>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2">
          <Search size={16} className="text-slate-400" />
          <input
            placeholder="Search interviews..." className="text-sm outline-none"
            value={query} onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="card overflow-x-auto p-0">
        {loading ? <Spinner /> : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-slate-400">
                <th className="px-5 py-3 font-medium">Date</th>
                <th className="px-5 py-3 font-medium">Topic</th>
                <th className="px-5 py-3 font-medium">Difficulty</th>
                <th className="px-5 py-3 font-medium">Score</th>
                <th className="px-5 py-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={s.id} className="border-b border-slate-50 last:border-0">
                  <td className="px-5 py-3 text-slate-500">{new Date(s.created_at).toLocaleDateString()}</td>
                  <td className="px-5 py-3 font-medium">{s.role}</td>
                  <td className="px-5 py-3 capitalize text-slate-500">{s.difficulty}</td>
                  <td className="px-5 py-3"><ScoreBadge score={s.overall_score} /></td>
                  <td className="px-5 py-3">
                    {s.status === "completed" ? (
                      <Link to={`/results/${s.id}`} className="font-medium text-brand-600">View</Link>
                    ) : (
                      <span className="text-slate-400">In progress</span>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={5} className="px-5 py-8 text-center text-slate-400">No interviews found.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </Layout>
  );
}