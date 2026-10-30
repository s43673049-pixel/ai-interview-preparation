import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { CheckCircle2, AlertTriangle } from "lucide-react";
import api from "../api/client";
import Layout from "../components/Layout";
import Spinner from "../components/Spinner";

export default function Results() {
  const { sessionId } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get(`/interview/sessions/${sessionId}`).then((res) => setData(res.data)).catch(() => setError("Could not load results"));
  }, [sessionId]);

  if (error) return <Layout><p className="text-red-600">{error}</p></Layout>;
  if (!data) return <Layout><Spinner /></Layout>;

  const { session, items } = data;
  const overall = Number(session.overall_score || 0) * 10;
  const pieData = [{ value: overall }, { value: 100 - overall }];

  return (
    <Layout>
      <div className="mb-2 text-center">
        <h1 className="text-xl font-bold">Interview Completed! 🎉</h1>
        <p className="text-sm text-slate-500">Here are your results and personalized feedback.</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="card flex flex-col items-center justify-center">
          <div className="relative h-36 w-36">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} dataKey="value" innerRadius={48} outerRadius={64} startAngle={90} endAngle={-270}>
                  <Cell fill="#6a5cf0" />
                  <Cell fill="#e2e8f0" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold">{overall.toFixed(0)}%</span>
              <span className="text-xs text-slate-400">Overall Score</span>
            </div>
          </div>
          <span className="pill mt-3 bg-green-50 text-green-700">Excellent</span>
        </div>

        <div className="card lg:col-span-2">
          <h2 className="mb-4 font-semibold">Score Breakdown</h2>
          <div className="space-y-3">
            {items.slice(0, 5).map((item, i) => (
              <div key={i}>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="text-slate-600">Q{i + 1}</span>
                  <span className="font-medium">{((item.score || 0) * 10).toFixed(0)}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-brand-600" style={{ width: `${(item.score || 0) * 10}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="card">
          <h3 className="mb-3 flex items-center gap-2 font-semibold text-green-700">
            <CheckCircle2 size={16} /> Strengths
          </h3>
          <ul className="space-y-2 text-sm">
            {items.flatMap((i) => i.strengths).slice(0, 5).map((s, i) => <li key={i}>✓ {s}</li>)}
          </ul>
        </div>
        <div className="card">
          <h3 className="mb-3 flex items-center gap-2 font-semibold text-amber-700">
            <AlertTriangle size={16} /> Areas to Improve
          </h3>
          <ul className="space-y-2 text-sm">
            {items.flatMap((i) => i.improvements).slice(0, 5).map((s, i) => <li key={i}>△ {s}</li>)}
          </ul>
        </div>
      </div>

      <div className="mt-4 flex justify-center gap-3">
        <Link to="/interview" className="btn-primary">Practice Again</Link>
        <Link to="/dashboard" className="btn-secondary">Back to Dashboard</Link>
      </div>
    </Layout>
  );
}