import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../api/client";
import ScoreBadge from "../components/ScoreBadge";
import Spinner from "../components/Spinner";

export default function Results() {
  const { sessionId } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get(`/interview/sessions/${sessionId}`)
      .then((res) => setData(res.data))
      .catch(() => setError("Could not load results"));
  }, [sessionId]);

  if (error) return <p className="text-red-600">{error}</p>;
  if (!data) return <Spinner />;

  const { session, items } = data;

  return (
    <div className="space-y-6">
      <div className="card flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{session.role} interview</h1>
          <p className="text-slate-500 capitalize">
            {session.difficulty} · {new Date(session.created_at).toLocaleString()}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-slate-500">Overall score</p>
          <ScoreBadge score={session.overall_score} size="lg" />
        </div>
      </div>

      {items.map((item, i) => (
        <div key={i} className="card space-y-3">
          <div className="flex items-start justify-between gap-4">
            <p className="font-medium">
              <span className="text-slate-400">Q{i + 1}.</span> {item.question_text}
            </p>
            <ScoreBadge score={item.score} />
          </div>

          <div className="rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
            <p className="mb-1 text-xs font-semibold uppercase text-slate-400">Your answer</p>
            {item.answer_text || <em className="text-slate-400">Not answered</em>}
          </div>

          {item.feedback && <p className="text-sm text-slate-700">{item.feedback}</p>}

          <div className="grid gap-3 text-sm sm:grid-cols-2">
            <ul className="space-y-1">
              {item.strengths?.map((s, j) => <li key={j} className="text-green-700">✓ {s}</li>)}
            </ul>
            <ul className="space-y-1">
              {item.improvements?.map((s, j) => <li key={j} className="text-amber-700">△ {s}</li>)}
            </ul>
          </div>
        </div>
      ))}

      <div className="flex gap-3">
        <Link to="/interview" className="btn-primary">Practice again</Link>
        <Link to="/dashboard" className="btn-secondary">Back to dashboard</Link>
      </div>
    </div>
  );
}