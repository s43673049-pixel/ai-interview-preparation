import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/client";
import ScoreBadge from "../components/ScoreBadge";
import Spinner from "../components/Spinner";

const DIFFICULTIES = ["easy", "medium", "hard"];

export default function Interview() {
  const navigate = useNavigate();

  // setup state
  const [setup, setSetup] = useState({ role: "", difficulty: "medium", count: 5, topics: "" });
  const [starting, setStarting] = useState(false);

  // interview state
  const [session, setSession] = useState(null); // { id, questions: [{id, question_text}] }
  const [current, setCurrent] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const startInterview = async (e) => {
    e.preventDefault();
    setError("");
    setStarting(true);
    try {
      const topics = setup.topics.split(",").map((t) => t.trim()).filter(Boolean);
      const { data } = await api.post("/interview/sessions", {
        role: setup.role,
        difficulty: setup.difficulty,
        count: Number(setup.count),
        topics,
      });
      setSession({ id: data.sessionId, questions: data.questions });
    } catch (err) {
      setError(err.response?.data?.error || "Could not start interview");
    } finally {
      setStarting(false);
    }
  };

  const submitAnswer = async () => {
    if (!answer.trim()) return;
    setError("");
    setSubmitting(true);
    try {
      const q = session.questions[current];
      const { data } = await api.post(`/interview/questions/${q.id}/answer`, { answer });
      setFeedback(data);
    } catch (err) {
      setError(err.response?.data?.error || "Could not evaluate answer");
    } finally {
      setSubmitting(false);
    }
  };

  const nextQuestion = async () => {
    const isLast = current === session.questions.length - 1;
    if (isLast) {
      await api.post(`/interview/sessions/${session.id}/complete`);
      navigate(`/results/${session.id}`);
      return;
    }
    setFeedback(null);
    setAnswer("");
    setCurrent((c) => c + 1);
  };

  /* ---------- Setup screen ---------- */
  if (!session) {
    return (
      <div className="mx-auto max-w-lg">
        <form onSubmit={startInterview} className="card space-y-4">
          <h1 className="text-2xl font-bold">Start a mock interview</h1>
          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

          <div>
            <label className="mb-1 block text-sm font-medium">Target role</label>
            <input
              className="input" required placeholder="e.g. Backend Developer"
              value={setup.role}
              onChange={(e) => setSetup({ ...setup, role: e.target.value })}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Focus topics (optional)</label>
            <input
              className="input" placeholder="e.g. Node.js, SQL, system design"
              value={setup.topics}
              onChange={(e) => setSetup({ ...setup, topics: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Difficulty</label>
              <select
                className="input capitalize" value={setup.difficulty}
                onChange={(e) => setSetup({ ...setup, difficulty: e.target.value })}
              >
                {DIFFICULTIES.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Questions</label>
              <select
                className="input" value={setup.count}
                onChange={(e) => setSetup({ ...setup, count: e.target.value })}
              >
                {[3, 5, 8, 10].map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
          </div>

          <button type="submit" disabled={starting} className="btn-primary w-full">
            {starting ? "Generating questions..." : "Start interview"}
          </button>
        </form>
      </div>
    );
  }

  /* ---------- Interview screen ---------- */
  const total = session.questions.length;
  const progress = ((current + (feedback ? 1 : 0)) / total) * 100;

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div>
        <div className="mb-1 flex justify-between text-sm text-slate-500">
          <span>Question {current + 1} of {total}</span>
          <span>{setup.role}</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-slate-200">
          <div className="h-full bg-brand-600 transition-all" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="card space-y-4">
        <p className="text-lg font-medium">{session.questions[current].question_text}</p>

        <textarea
          rows={7} className="input" placeholder="Type your answer here..."
          value={answer} disabled={!!feedback || submitting}
          onChange={(e) => setAnswer(e.target.value)}
        />

        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

        {!feedback && (
          submitting ? (
            <Spinner label="AI is evaluating your answer..." />
          ) : (
            <button onClick={submitAnswer} disabled={!answer.trim()} className="btn-primary">
              Submit answer
            </button>
          )
        )}
      </div>

      {feedback && (
        <div className="card space-y-4 border-brand-100 bg-brand-50/40">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Feedback</h3>
            <ScoreBadge score={feedback.score} size="lg" />
          </div>
          <p className="text-slate-700">{feedback.feedback}</p>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="mb-1 text-sm font-semibold text-green-700">Strengths</p>
              <ul className="space-y-1 text-sm text-slate-700">
                {feedback.strengths?.map((s, i) => <li key={i}>✓ {s}</li>)}
              </ul>
            </div>
            <div>
              <p className="mb-1 text-sm font-semibold text-amber-700">To improve</p>
              <ul className="space-y-1 text-sm text-slate-700">
                {feedback.improvements?.map((s, i) => <li key={i}>△ {s}</li>)}
              </ul>
            </div>
          </div>

          {feedback.keywords_matched?.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {feedback.keywords_matched.map((k) => (
                <span key={k} className="rounded-full bg-brand-100 px-2.5 py-0.5 text-xs text-brand-700">
                  {k}
                </span>
              ))}
            </div>
          )}

          <button onClick={nextQuestion} className="btn-primary">
            {current === total - 1 ? "Finish & view results" : "Next question"}
          </button>
        </div>
      )}
    </div>
  );
}