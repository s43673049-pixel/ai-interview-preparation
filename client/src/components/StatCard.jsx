export default function StatCard({ icon: Icon, label, value, delta, color = "brand" }) {
  const colors = {
    brand: "bg-brand-50 text-brand-600",
    green: "bg-green-50 text-green-600",
    amber: "bg-amber-50 text-amber-600",
  };

  return (
    <div className="card flex items-start justify-between">
      <div>
        <p className="text-sm text-slate-500">{label}</p>
        <p className="mt-1 text-2xl font-bold">{value}</p>
        {delta && <p className="mt-1 text-xs font-medium text-green-600">{delta}</p>}
      </div>
      <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${colors[color]}`}>
        <Icon size={20} />
      </div>
    </div>
  );
}