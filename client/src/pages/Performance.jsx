import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { TrendingUp, TrendingDown, Target, Award, FileText, CheckCircle2 } from "lucide-react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import api from "../api/client";
import Layout from "../components/Layout";
import StatCard from "../components/StatCard";
import Spinner from "../components/Spinner";

const QUALITY = [
  ["excellent", "Excellent (9–10)", "bg-green-500"],
  ["good", "Good (7–8)", "bg-brand-600"],
  ["fair", "Fair (5–6)", "bg-amber-400"],
  ["needsWork", "Needs work (0–4)", "bg-red-400"],
];

const axisTick = { fontSize: 12, fill: "#94a3b8" };

export default function Performance() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/interview/performance")
      .then((res) => setData(res.data))
      .catch(() => setError("Could not load your performance data"));
  }, []);

  if (error) return <Layout><p className="text-red-600">{error}</p></Layout>;
  if (!data) return <Layout><Spinner /></Layout>;

  const { summary, trend, byDifficulty, byTopic, distribution, topKeywords, weakest } = data;

  if (summary.interviews === 0) {
    return (
      <Layout>
        <div className="card mx-auto max-w-md py-12 text-center">
          <h1 className="text-xl font-bold">No performance data yet</h1>
          <p className="mt-2 text-sm text-slate-500">
            Complete your first interview to see trends, strengths and weak spots here.
          </p>
          <Link to="/interview" className="btn-primary mt-5">Start an interview</Link>
        </div>
      </Layout>
    );
  }

  const totalAnswers = Object.values(distribution).reduce((a, b) => a + b, 0) || 1;
  const change = summary.change;
  const ChangeIcon = change != null && change < 0 ? TrendingDown : TrendingUp;

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Performance</h1>
        <p className="text-slate-500">See how your answers are improving and where to focus next.</p>
      </div>

      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Target} label="Average Score" value={`${summary.averageScore}%`} color="green" />
        <StatCard icon={Award} label="Best Score" value={`${summary.bestScore}%`} color="amber" />
        <StatCard icon={FileText} label="Interviews" value={summary.interviews}
          delta={`${summary.questionsAnswered} questions answered`} />
        <StatCard
          icon={ChangeIcon}
          label="Recent Change"
          value={change == null ? "–" : `${change > 0 ? "+" : ""}${change}%`}
          delta={change == null ? "Needs 2+ interviews" : "Last 3 vs the 3 before"}
        />
      </div>

      {/* Trend + difficulty */}
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="card lg:col-span-2">
          <h2 className="mb-4 font-semibold">Score Trend</h2>
          {trend.length < 2 ? (
            <p className="py-10 text-center text-sm text-slate-400">
              Complete one more interview to see your trend line.
            </p>
          ) : (
            <div style={{ width: "100%", height: 240 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="name" tick={axisTick} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} tick={axisTick} axisLine={false} tickLine={false} width={32} />
                  <Tooltip
                    formatter={(v) => [`${v}%`, "Score"]}
                    labelFormatter={(_, p) => p?.[0]?.payload?.role || ""}
                  />
                  <Line type="monotone" dataKey="score" stroke="#6a5cf0" strokeWidth={2.5}
                    dot={{ r: 4, fill: "#6a5cf0" }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="card">
          <h2 className="mb-4 font-semibold">By Difficulty</h2>
          <div style={{ width: "100%", height: 240 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byDifficulty}>
                <XAxis dataKey="name" tick={axisTick} axisLine={false} tickLine={false}
                  tickFormatter={(v) => v.charAt(0).toUpperCase() + v.slice(1)} />
                <YAxis domain={[0, 100]} tick={axisTick} axisLine={false} tickLine={false} width={32} />
                <Tooltip formatter={(v, _, p) => [`${v}% (${p.payload.count} interviews)`, "Average"]} />
                <Bar dataKey="score" fill="#6a5cf0" radius={[6, 6, 0, 0]} maxBarSize={48} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Topics + quality */}
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="card">
          <h2 className="mb-4 font-semibold">By Topic</h2>
          <div className="space-y-3">
            {byTopic.map((t) => (
              <div key={t.name}>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="text-slate-600">
                    {t.name} <span className="text-slate-400">· {t.count}×</span>
                  </span>
                  <span className="font-medium">{t.score}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-brand-600" style={{ width: `${t.score}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h2 className="mb-4 font-semibold">Answer Quality</h2>
          <div className="space-y-3">
            {QUALITY.map(([key, label, color]) => {
              const n = distribution[key];
              return (
                <div key={key}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="text-slate-600">{label}</span>
                    <span className="font-medium">{n}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div className={`h-full rounded-full ${color}`} style={{ width: `${(n / totalAnswers) * 100}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Keywords + weakest */}
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="card">
          <h2 className="mb-1 flex items-center gap-2 font-semibold">
            <CheckCircle2 size={16} className="text-green-600" /> Terms You Use Well
          </h2>
          <p className="mb-4 text-xs text-slate-400">Technical terms the AI recognized in your answers.</p>
          {topKeywords.length === 0 ? (
            <p className="text-sm text-slate-400">No keywords detected yet.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {topKeywords.map(({ word, count }) => (
                <span key={word} className="pill bg-brand-50 text-brand-700">
                  {word}{count > 1 && <span className="ml-1 text-brand-500">×{count}</span>}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <h2 className="mb-1 font-semibold">Focus Areas</h2>
          <p className="mb-4 text-xs text-slate-400">Your lowest-scoring questions. Open one to review the feedback.</p>
          <ul className="space-y-3">
            {weakest.map((w, i) => (
              <li key={i} className="flex items-start justify-between gap-3">
                <Link to={`/results/${w.session_id}`} className="text-sm text-slate-700 hover:text-brand-600">
                  {w.question_text}
                </Link>
                <span className={`pill shrink-0 ${w.score < 50 ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700"}`}>
                  {w.score}%
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Layout>
  );
}