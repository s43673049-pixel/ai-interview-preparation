import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, CheckCircle2, Clock, Code2, Type } from "lucide-react";
import api from "../api/client";
import Layout from "../components/Layout";
import ScoreBadge from "../components/ScoreBadge";
import Spinner from "../components/Spinner";
import CodeEditorAnswer from "../components/CodeEditorAnswer";
import MicButton from "../components/MicButton";

const TYPES = ["Technical", "HR", "Behavioral", "Mixed"];
const DIFFICULTIES = ["Easy", "Medium", "Hard"];
const COUNTS = [5, 10, 15];

export default function Interview() {
  const navigate = useNavigate();

  const [setup, setSetup] = useState({
    type: "Technical",
    topic: "",
    difficulty: "Medium",
    count: 10,
  });
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState("");

  const [session, setSession] = useState(null);
  const [current, setCurrent] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [answerMode, setAnswerMode] = useState("text"); // "text" | "code"
  const [codeLanguage, setCodeLanguage] = useState("javascript");

  const startInterview = async (e) => {
    e.preventDefault();
    setError("");
    setStarting(true);
    try {
      const { data } = await api.post("/interview/sessions", {
        role: setup.topic || setup.type,
        difficulty: setup.difficulty.toLowerCase(),
        count: setup.count,
        topics: setup.topic ? [setup.topic] : [],
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
    setSubmitting(true);
    setError("");
    try {
      const q = session.questions[current];
      const { data } = await api.post(`/interview/questions/${q.id}/answer`, {
        answer,
      });
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
      <Layout>
        <div className="grid gap-6 lg:grid-cols-3">
          <form
            onSubmit={startInterview}
            className="card space-y-6 lg:col-span-2"
          >
            <div>
              <h1 className="text-xl font-bold">Start a New Interview</h1>
              <p className="text-sm text-slate-500">
                Customize your interview settings and let AI do the magic.
              </p>
            </div>

            {error && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </p>
            )}

            <div>
              <label className="mb-2 block text-sm font-medium">
                Interview Type
              </label>
              <div className="flex flex-wrap gap-2">
                {TYPES.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setSetup({ ...setup, type: t })}
                    className={`rounded-lg border px-4 py-2 text-sm font-medium transition ${
                      setup.type === t
                        ? "border-brand-600 bg-brand-50 text-brand-700"
                        : "border-slate-200 text-slate-600"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Technology / Topic
              </label>
              <input
                className="input"
                placeholder="e.g. JavaScript, System Design"
                value={setup.topic}
                onChange={(e) => setSetup({ ...setup, topic: e.target.value })}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Difficulty Level
              </label>
              <div className="flex gap-2">
                {DIFFICULTIES.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setSetup({ ...setup, difficulty: d })}
                    className={`rounded-lg border px-4 py-2 text-sm font-medium transition ${
                      setup.difficulty === d
                        ? "border-brand-600 bg-brand-50 text-brand-700"
                        : "border-slate-200 text-slate-600"
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Number of Questions
              </label>
              <div className="flex gap-2">
                {COUNTS.map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setSetup({ ...setup, count: n })}
                    className={`rounded-lg border px-4 py-2 text-sm font-medium transition ${
                      setup.count === n
                        ? "border-brand-600 bg-brand-50 text-brand-700"
                        : "border-slate-200 text-slate-600"
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={starting}
              className="btn-primary w-full"
            >
              {starting ? "Generating Questions..." : "Generate Questions →"}
            </button>
          </form>

          <div className="card bg-navy-900 text-white">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
              <Sparkles size={18} className="text-brand-300" />
            </div>
            <p className="mb-4 text-sm text-slate-300">
              AI will generate personalized questions based on your selection.
            </p>
            <ul className="space-y-2 text-sm">
              {[
                "Relevant to your target role",
                "Real interview-style questions",
                "Instant feedback & scoring",
              ].map((t) => (
                <li key={t} className="flex items-center gap-2 text-slate-200">
                  <CheckCircle2 size={14} className="text-green-400" /> {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Layout>
    );
  }

  /* ---------- Question screen ---------- */
  const total = session.questions.length;
  const progress = ((current + (feedback ? 1 : 0)) / total) * 100;

  return (
    <Layout>
      <div className="mx-auto max-w-2xl space-y-4">
        <div className="flex items-center justify-between text-sm text-slate-500">
          <span>
            Question {current + 1} of {total}
          </span>
          <span className="flex items-center gap-1">
            <Clock size={14} /> In progress
          </span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full rounded-full bg-brand-600 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="card space-y-4">
          <div className="flex gap-2">
            <span className="pill bg-brand-50 text-brand-700">
              {setup.type}
            </span>
            {setup.topic && (
              <span className="pill bg-slate-100 text-slate-600">
                {setup.topic}
              </span>
            )}
          </div>
          <p className="text-lg font-medium">
            {session.questions[current].question_text}
          </p>

          <div className="flex items-center justify-between">
            <div className="flex gap-1 rounded-lg bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => setAnswerMode("text")}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition ${
                  answerMode === "text"
                    ? "bg-white shadow-sm"
                    : "text-slate-500"
                }`}
              >
                <Type size={14} /> Text
              </button>
              <button
                type="button"
                onClick={() => setAnswerMode("code")}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition ${
                  answerMode === "code"
                    ? "bg-white shadow-sm"
                    : "text-slate-500"
                }`}
              >
                <Code2 size={14} /> Code
              </button>
            </div>

            {answerMode === "text" && (
              <MicButton
                disabled={!!feedback || submitting}
                onTranscript={(text) =>
                  setAnswer((prev) => (prev ? `${prev} ${text}` : text))
                }
              />
            )}
          </div>

          {answerMode === "text" ? (
            <textarea
              rows={7}
              className="input"
              placeholder="Type your answer here, or use the mic..."
              value={answer}
              disabled={!!feedback || submitting}
              onChange={(e) => setAnswer(e.target.value)}
            />
          ) : (
            <CodeEditorAnswer
              value={answer}
              onChange={setAnswer}
              language={codeLanguage}
              onLanguageChange={setCodeLanguage}
              disabled={!!feedback || submitting}
            />
          )}

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}

          {!feedback &&
            (submitting ? (
              <Spinner label="AI is evaluating your answer..." />
            ) : (
              <button
                onClick={submitAnswer}
                disabled={!answer.trim()}
                className="btn-primary"
              >
                Next Question →
              </button>
            ))}
        </div>

        {feedback && (
          <div className="card space-y-4 border-brand-100 bg-brand-50/30">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Feedback</h3>
              <ScoreBadge score={feedback.score} size="lg" />
            </div>
            <p className="text-sm text-slate-700">{feedback.feedback}</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <ul className="space-y-1 text-sm">
                {feedback.strengths?.map((s, i) => (
                  <li key={i} className="text-green-700">
                    ✓ {s}
                  </li>
                ))}
              </ul>
              <ul className="space-y-1 text-sm">
                {feedback.improvements?.map((s, i) => (
                  <li key={i} className="text-amber-700">
                    △ {s}
                  </li>
                ))}
              </ul>
            </div>
            <button onClick={nextQuestion} className="btn-primary">
              {current === total - 1
                ? "Finish & View Results"
                : "Next Question"}
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
}