import { Link } from "react-router-dom";
import {
  Sparkles, Zap, TrendingUp, Target, Mic, FileText,
  CheckCircle2, ArrowRight, Star, Menu, X,
} from "lucide-react";
import { useState } from "react";

const FEATURES = [
  { icon: Sparkles, title: "AI-Generated Questions", desc: "Tailored to your role, topic and difficulty — never generic trivia." },
  { icon: Zap, title: "Instant Feedback", desc: "Get a score, strengths, and specific improvements right after each answer." },
  { icon: TrendingUp, title: "Progress Tracking", desc: "See your scores trend over time across every mock interview." },
  { icon: Target, title: "Role-Specific Practice", desc: "Technical, HR, behavioral, or mixed — pick exactly what you need." },
  { icon: Mic, title: "Realistic Format", desc: "Timed, structured questions that mirror a real interview flow." },
  { icon: FileText, title: "Detailed Reports", desc: "A full breakdown per question so you know exactly what to fix." },
];

const STEPS = [
  { num: "01", title: "Pick your setup", desc: "Choose role, topic, difficulty, and how many questions you want." },
  { num: "02", title: "Answer in real time", desc: "AI asks realistic questions one at a time — just like the real thing." },
  { num: "03", title: "Get instant feedback", desc: "Each answer is scored with strengths and concrete improvements." },
  { num: "04", title: "Track your growth", desc: "Watch your average score rise across sessions on your dashboard." },
];

const TESTIMONIALS = [
  { name: "Ananya R.", role: "Backend Developer", quote: "Practiced 15 mock interviews before my actual one. Walked in way calmer than I expected to be." },
  { name: "Daniel K.", role: "Frontend Engineer", quote: "The feedback on my answers was more specific than anything I got from friends or forums." },
  { name: "Priya M.", role: "Data Analyst", quote: "Seeing my score trend upward over two weeks was honestly motivating." },
];

export default function Landing() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600">
              <Sparkles size={16} className="text-white" />
            </div>
            <span className="font-semibold">AI Interview Prep</span>
          </div>

          <nav className="hidden items-center gap-8 text-sm text-slate-600 md:flex">
            <a href="#features" className="hover:text-slate-900">Features</a>
            <a href="#how" className="hover:text-slate-900">How It Works</a>
            <a href="#testimonials" className="hover:text-slate-900">Reviews</a>
            <a href="#pricing" className="hover:text-slate-900">Pricing</a>
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <Link to="/login" className="text-sm font-medium text-slate-600">Login</Link>
            <Link to="/register" className="btn-primary">Get Started</Link>
          </div>

          <button onClick={() => setMenuOpen(!menuOpen)} className="p-2 md:hidden">
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {menuOpen && (
          <div className="space-y-3 border-t border-slate-100 px-6 py-4 md:hidden">
            <a href="#features" className="block text-sm text-slate-600">Features</a>
            <a href="#how" className="block text-sm text-slate-600">How It Works</a>
            <a href="#testimonials" className="block text-sm text-slate-600">Reviews</a>
            <div className="flex gap-3 pt-2">
              <Link to="/login" className="btn-secondary flex-1 text-center">Login</Link>
              <Link to="/register" className="btn-primary flex-1 text-center">Get Started</Link>
            </div>
          </div>
        )}
      </header>

      {/* Hero */}
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-6 py-16 md:grid-cols-2 lg:py-24">
        <div>
          <span className="pill mb-4 inline-flex items-center gap-1.5 bg-brand-50 text-brand-700">
            <Sparkles size={12} /> Your AI-Powered Interview Coach
          </span>
          <h1 className="text-4xl font-bold leading-tight sm:text-5xl">
            Practice Smarter.<br /><span className="text-brand-600">Get Hired Faster.</span>
          </h1>
          <p className="mt-4 max-w-md text-slate-500">
            AI-powered mock interviews, real-time feedback, and personalized suggestions to help you ace your next interview — for any role, any level.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/register" className="btn-primary">
              Get Started Free <ArrowRight size={16} />
            </Link>
            <a href="#how" className="btn-secondary">See How It Works</a>
          </div>

          <div className="mt-10 flex gap-10 text-sm">
            <div><p className="text-xl font-bold">10K+</p><p className="text-slate-400">Active Users</p></div>
            <div><p className="text-xl font-bold">50K+</p><p className="text-slate-400">Questions Generated</p></div>
            <div><p className="text-xl font-bold">95%</p><p className="text-slate-400">User Satisfaction</p></div>
          </div>
        </div>

        <div className="rounded-2xl bg-navy-900 p-8 text-white">
          <p className="mb-1 text-lg font-semibold">Better Practice.</p>
          <p className="mb-6 text-lg font-semibold text-brand-300">Better Results.</p>
          <ul className="space-y-3">
            {["AI Generated Questions", "Instant Feedback", "Track Your Progress", "Personalized Recommendations"].map((t) => (
              <li key={t} className="flex items-center gap-3 rounded-lg bg-white/5 px-3 py-2.5 text-sm">
                <CheckCircle2 size={16} className="text-brand-300" /> {t}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-6xl px-6 py-16">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold">Everything you need to walk in ready</h2>
          <p className="mt-2 text-slate-500">Built around how real interviews actually work.</p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="card">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <Icon size={20} />
              </div>
              <h3 className="font-semibold">{title}</h3>
              <p className="mt-1 text-sm text-slate-500">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="bg-slate-50 py-16">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold">How it works</h2>
            <p className="mt-2 text-slate-500">From setup to feedback in under five minutes.</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map(({ num, title, desc }, i) => (
              <div key={num} className="relative">
                <span className="text-4xl font-bold text-brand-100">{num}</span>
                <h3 className="mt-2 font-semibold">{title}</h3>
                <p className="mt-1 text-sm text-slate-500">{desc}</p>
                {i < STEPS.length - 1 && (
                  <ArrowRight size={18} className="absolute -right-3 top-2 hidden text-slate-300 lg:block" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="mx-auto max-w-6xl px-6 py-16">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold">Loved by candidates who landed offers</h2>
        </div>
        <div className="grid gap-5 sm:grid-cols-3">
          {TESTIMONIALS.map(({ name, role, quote }) => (
            <div key={name} className="card">
              <div className="mb-3 flex gap-0.5 text-amber-400">
                {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
              </div>
              <p className="text-sm text-slate-600">"{quote}"</p>
              <p className="mt-4 text-sm font-semibold">{name}</p>
              <p className="text-xs text-slate-400">{role}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-6 pb-16">
        <div className="rounded-2xl bg-navy-900 px-8 py-14 text-center text-white">
          <h2 className="text-3xl font-bold">Ready to practice smarter?</h2>
          <p className="mt-2 text-slate-300">Start your first mock interview in under a minute. No credit card required.</p>
          <Link to="/register" className="btn-primary mt-6 inline-flex">
            Get Started Free <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 text-sm text-slate-400 sm:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-brand-600">
              <Sparkles size={12} className="text-white" />
            </div>
            <span className="font-medium text-slate-600">AI Interview Prep</span>
          </div>
          <p>© {new Date().getFullYear()} AI Interview Prep. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}