import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Target, FileText, Award } from "lucide-react";
import { LineChart, Line, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";
import Layout from "../components/Layout";
import StatCard from "../components/StatCard";
import ScoreBadge from "../components/ScoreBadge";
import Spinner from "../components/Spinner";

export default function Dashboard() {
    const { user } = useAuth();
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
   useEffect(() => {
    api.get("/interview/sessions").then(({ data }) => setSessions(data)).finally(() => setLoading(false));
  }, []);

  const completed = sessions.filter((s) => s.status === "completed");
  const avg = completed.length
    ? completed.reduce((sum, s) => sum + Number(s.overall_score || 0), 0) / completed.length
    : 0;

  const chartData = [...completed].reverse().slice(0, 10).map((s, i) => ({
    name: `#${i + 1}`,
    score: Number(s.overall_score || 0) * 10,
  }));

  return (
    <Layout>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Good morning, {user?.name?.split(" ")[0]}! 👋</h1>
          <p className="text-slate-500">Keep going! You're doing great. Here's your progress.</p>
        </div>
        <Link to="/interview" className="btn-primary">Start Interview</Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={FileText} label="Total Interviews" value={sessions.length} delta="+2 this week" />
        <StatCard icon={Target} label="Average Score" value={`${avg.toFixed(0)}%`} delta="+5% this week" color="green" />
        <StatCard icon={Award} label="Total Questions" value={completed.length * 5} delta="+12 this week" color="amber" />
        <div className="card flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500">Your Progress</p>
            <p className="mt-1 text-xs font-medium text-green-600">Improvement +18%</p>
          </div>
          <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 text-sm font-bold text-brand-700">
            {avg.toFixed(0)}%
          </div>
        </div>
      </div>

  <div className="card lg:col-span-2">
  <h2 className="mb-4 font-semibold">Performance Overview</h2>
  {chartData.length === 0 ? (
    <p className="py-10 text-center text-sm text-slate-400">Complete an interview to see your trend.</p>
  ) : chartData.length === 1 ? (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <p className="text-2xl font-bold text-brand-600">{chartData[0].score}%</p>
      <p className="mt-1 text-sm text-slate-400">Complete another interview to see your trend</p>
    </div>
  ) : (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={chartData}>
        <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
        <Tooltip />
        <Line
          type="monotone" dataKey="score" stroke="#6a5cf0" strokeWidth={2.5}
          dot={{ r: 4, fill: "#6a5cf0" }}
        />
      </LineChart>
    </ResponsiveContainer>
  )}
</div>

        <div className="card">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold">Recent Interviews</h2>
            <Link to="/history" className="text-xs font-medium text-brand-600">View all</Link>
          </div>
          {loading ? (
            <Spinner />
          ) : (
            <ul className="space-y-3">
              {sessions.slice(0, 4).map((s) => (
                <li key={s.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{s.role}</p>
                    <p className="text-xs text-slate-400">{new Date(s.created_at).toLocaleDateString()}</p>
                  </div>
                  <ScoreBadge score={s.overall_score} />
                </li>
              ))}
              {sessions.length === 0 && <p className="text-sm text-slate-400">No interviews yet.</p>}
            </ul>
          )}
        </div>
    </Layout>
  );
}