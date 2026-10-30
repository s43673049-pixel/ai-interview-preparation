import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import Layout from "../components/Layout";

export default function Profile() {
  const { user } = useAuth();
  const [form, setForm] = useState({ name: user?.name || "", email: user?.email || "", bio: "" });
  const [prefs, setPrefs] = useState({ emailNotifs: true, reminders: true, weeklyReport: false });
  const initials = user?.name?.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  const toggle = (key) => setPrefs({ ...prefs, [key]: !prefs[key] });

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Profile Information</h1>
        <p className="text-slate-500">Update your personal details and preferences.</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="card lg:col-span-2 space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-100 text-lg font-semibold text-brand-700">
              {initials || "U"}
            </div>
            <button className="btn-secondary">Change Photo</button>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Full Name</label>
            <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Email Address</label>
            <input className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Bio</label>
            <textarea
              rows={3} className="input" placeholder="Aspiring full-stack developer..."
              value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })}
            />
          </div>
          <button className="btn-primary">Save Changes</button>
        </div>

        <div className="space-y-4">
          <div className="card">
            <h3 className="mb-3 font-semibold">Quick Stats</h3>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between"><dt className="text-slate-500">Interviews Taken</dt><dd className="font-medium">12</dd></div>
              <div className="flex justify-between"><dt className="text-slate-500">Average Score</dt><dd className="font-medium">78%</dd></div>
              <div className="flex justify-between"><dt className="text-slate-500">Best Score</dt><dd className="font-medium">92%</dd></div>
            </dl>
          </div>

          <div className="card">
            <h3 className="mb-3 font-semibold">Preferences</h3>
            <div className="space-y-3">
              {[
                ["emailNotifs", "Email Notifications"],
                ["reminders", "Interview Reminders"],
                ["weeklyReport", "Weekly Progress Report"],
              ].map(([key, label]) => (
                 <div key={key} className="flex items-center justify-between text-sm">
        <span className="text-slate-700">{label}</span>
        <button
          type="button"
          role="switch"
          aria-checked={prefs[key]}
          onClick={() => toggle(key)}
          className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border transition-colors duration-200
            ${prefs[key] ? "border-brand-600 bg-brand-600" : "border-slate-300 bg-slate-200"}`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200
              ${prefs[key] ? "translate-x-6" : "translate-x-1"}`}
          />
        </button>
      </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}