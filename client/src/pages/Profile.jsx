import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, AlertTriangle, Lock, Trash2 } from "lucide-react";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";
import Layout from "../components/Layout";
import Spinner from "../components/Spinner";

const PREFS = [
  ["emailNotifs", "Email Notifications"],
  ["reminders", "Interview Reminders"],
  ["weeklyReport", "Weekly Progress Report"],
];

function Notice({ notice }) {
  if (!notice) return null;
  const ok = notice.type === "success";
  return (
    <p className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${
      ok ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
    }`}>
      {ok ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />} {notice.text}
    </p>
  );
}

function Toggle({ checked, onChange }) {
  return (
    <button
      type="button" role="switch" aria-checked={checked} onClick={onChange}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border transition-colors
        ${checked ? "border-brand-600 bg-brand-600" : "border-slate-300 bg-slate-200"}`}
    >
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform
        ${checked ? "translate-x-6" : "translate-x-1"}`} />
    </button>
  );
}

export default function Profile() {
  const { updateUser, logout } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(null);            // last saved profile, used to detect changes
  const [form, setForm] = useState({ name: "", email: "", bio: "" });
  const [prefs, setPrefs] = useState({});
  const [stats, setStats] = useState(null);
  const [memberSince, setMemberSince] = useState("");

  const [saving, setSaving] = useState(false);
  const [profileNotice, setProfileNotice] = useState(null);
  const [prefNotice, setPrefNotice] = useState(null);

  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });
  const [pwSaving, setPwSaving] = useState(false);
  const [pwNotice, setPwNotice] = useState(null);

  const [showDelete, setShowDelete] = useState(false);
  const [deletePw, setDeletePw] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteNotice, setDeleteNotice] = useState(null);

  useEffect(() => {
    api.get("/profile")
      .then(({ data }) => {
        const p = { name: data.user.name, email: data.user.email, bio: data.user.bio || "" };
        setForm(p);
        setSaved(p);
        setPrefs(data.preferences);
        setStats(data.stats);
        setMemberSince(new Date(data.user.created_at).toLocaleDateString(undefined, { month: "long", year: "numeric" }));
      })
      .catch(() => setProfileNotice({ type: "error", text: "Could not load your profile" }))
      .finally(() => setLoading(false));
  }, []);

  const dirty = saved && (form.name !== saved.name || form.email !== saved.email || form.bio !== saved.bio);
  const initials = form.name.split(" ").filter(Boolean).map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  const saveProfile = async (e) => {
    e.preventDefault();
    setProfileNotice(null);
    setSaving(true);
    try {
      const { data } = await api.put("/profile", form);
      const p = { name: data.user.name, email: data.user.email, bio: data.user.bio };
      setForm(p);
      setSaved(p);
      updateUser({ name: p.name, email: p.email });
      setProfileNotice({ type: "success", text: "Profile updated" });
    } catch (err) {
      setProfileNotice({ type: "error", text: err.response?.data?.error || "Could not save changes" });
    } finally {
      setSaving(false);
    }
  };

  const togglePref = async (key) => {
    const previous = prefs;
    const next = { ...prefs, [key]: !prefs[key] };
    setPrefs(next);                                    // optimistic
    setPrefNotice(null);
    try {
      await api.put("/profile/preferences", { [key]: next[key] });
    } catch {
      setPrefs(previous);                              // revert on failure
      setPrefNotice({ type: "error", text: "Could not save preference" });
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    setPwNotice(null);
    if (pw.next !== pw.confirm) {
      return setPwNotice({ type: "error", text: "New passwords don't match" });
    }
    setPwSaving(true);
    try {
      await api.put("/profile/password", { currentPassword: pw.current, newPassword: pw.next });
      setPw({ current: "", next: "", confirm: "" });
      setPwNotice({ type: "success", text: "Password updated" });
    } catch (err) {
      setPwNotice({ type: "error", text: err.response?.data?.error || "Could not update password" });
    } finally {
      setPwSaving(false);
    }
  };

  const deleteAccount = async (e) => {
    e.preventDefault();
    setDeleteNotice(null);
    setDeleting(true);
    try {
      await api.delete("/profile", { data: { password: deletePw } });
      logout();
      navigate("/");
    } catch (err) {
      setDeleteNotice({ type: "error", text: err.response?.data?.error || "Could not delete account" });
      setDeleting(false);
    }
  };

  if (loading) return <Layout><Spinner /></Layout>;

  const statRows = [
    ["Interviews Completed", stats?.interviews ?? 0],
    ["Questions Answered", stats?.questionsAnswered ?? 0],
    ["Average Score", stats?.averageScore != null ? `${stats.averageScore}%` : "–"],
    ["Best Score", stats?.bestScore != null ? `${stats.bestScore}%` : "–"],
  ];

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Profile Information</h1>
        <p className="text-slate-500">Update your personal details and preferences.</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {/* Profile details */}
          <form onSubmit={saveProfile} className="card space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-100 text-lg font-semibold text-brand-700">
                {initials || "U"}
              </div>
              <div>
                <p className="font-semibold">{saved?.name}</p>
                {memberSince && <p className="text-sm text-slate-400">Member since {memberSince}</p>}
              </div>
            </div>

            <Notice notice={profileNotice} />

            <div>
              <label className="mb-1 block text-sm font-medium">Full Name</label>
              <input className="input" required maxLength={100} value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Email Address</label>
              <input type="email" className="input" required value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Bio</label>
              <textarea rows={3} maxLength={500} className="input"
                placeholder="Tell us about your target role or goals..."
                value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
              <p className="mt-1 text-right text-xs text-slate-400">{form.bio.length}/500</p>
            </div>

            <div className="flex gap-2">
              <button type="submit" disabled={!dirty || saving} className="btn-primary">
                {saving ? "Saving..." : "Save Changes"}
              </button>
              {dirty && (
                <button type="button" className="btn-secondary" onClick={() => setForm(saved)}>
                  Discard
                </button>
              )}
            </div>
          </form>

          {/* Password */}
          <form onSubmit={changePassword} className="card space-y-4">
            <h3 className="flex items-center gap-2 font-semibold"><Lock size={16} /> Change Password</h3>
            <Notice notice={pwNotice} />
            <div>
              <label className="mb-1 block text-sm font-medium">Current Password</label>
              <input type="password" className="input" required autoComplete="current-password"
                value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium">New Password</label>
                <input type="password" className="input" required minLength={6} autoComplete="new-password"
                  value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Confirm New Password</label>
                <input type="password" className="input" required minLength={6} autoComplete="new-password"
                  value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} />
              </div>
            </div>
            <button type="submit" disabled={pwSaving} className="btn-secondary">
              {pwSaving ? "Updating..." : "Update Password"}
            </button>
          </form>

          {/* Danger zone */}
          <div className="card border-red-100">
            <h3 className="flex items-center gap-2 font-semibold text-red-700"><Trash2 size={16} /> Delete Account</h3>
            <p className="mt-1 text-sm text-slate-500">
              Permanently removes your account and all interview history. This can't be undone.
            </p>
            {!showDelete ? (
              <button className="mt-3 rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
                onClick={() => setShowDelete(true)}>
                Delete my account
              </button>
            ) : (
              <form onSubmit={deleteAccount} className="mt-3 space-y-3">
                <Notice notice={deleteNotice} />
                <input type="password" className="input" required placeholder="Enter your password to confirm"
                  value={deletePw} onChange={(e) => setDeletePw(e.target.value)} />
                <div className="flex gap-2">
                  <button type="submit" disabled={deleting}
                    className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50">
                    {deleting ? "Deleting..." : "Permanently delete"}
                  </button>
                  <button type="button" className="btn-secondary"
                    onClick={() => { setShowDelete(false); setDeletePw(""); setDeleteNotice(null); }}>
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Side column */}
        <div className="space-y-4">
          <div className="card">
            <h3 className="mb-3 font-semibold">Quick Stats</h3>
            <dl className="space-y-2 text-sm">
              {statRows.map(([label, value]) => (
                <div key={label} className="flex justify-between">
                  <dt className="text-slate-500">{label}</dt>
                  <dd className="font-medium">{value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="card">
            <h3 className="mb-3 font-semibold">Preferences</h3>
            <div className="space-y-4">
              <Notice notice={prefNotice} />
              {PREFS.map(([key, label]) => (
                <div key={key} className="flex items-center justify-between text-sm">
                  <span className="text-slate-700">{label}</span>
                  <Toggle checked={!!prefs[key]} onChange={() => togglePref(key)} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}