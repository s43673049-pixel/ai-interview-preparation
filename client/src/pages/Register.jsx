import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      <div className="hidden w-[380px] flex-col justify-center bg-navy-900 px-10 text-white lg:flex">
        <div className="mb-10 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600">
            <Sparkles size={16} />
          </div>
          <span className="font-semibold">AI Interview Prep</span>
        </div>
        <h2 className="text-3xl font-bold leading-tight">Better Practice.<br />Better Results.</h2>
        <p className="mt-4 text-sm text-slate-300">
          AI-generated questions, instant feedback, and progress tracking built for real interviews.
        </p>
      </div>

      <div className="flex flex-1 items-center justify-center bg-slate-50 px-6 py-10">
        <form onSubmit={handleSubmit} className="w-full max-w-sm">
          <h1 className="text-2xl font-bold">Create your account</h1>
          <p className="mt-1 text-sm text-slate-500">Start your journey to interview success</p>

          {error && (
            <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
          )}

          <div className="mt-6 space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Full Name</label>
              <input
                className="input" required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Email Address</label>
              <input
                type="email" className="input" required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Password</label>
              <input
                type="password" minLength={6} className="input" required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary mt-6 w-full">
            {loading ? "Creating..." : "Create Account"}
          </button>

          <p className="mt-6 text-center text-sm text-slate-500">
            Already have an account? <Link to="/login" className="font-medium text-brand-600">Login</Link>
          </p>
        </form>
      </div>
    </div>
  );
}