export default function ScoreBadge({ score, size = "md" }) {
  if (score === null || score === undefined) {
    return <span className="text-slate-400">–</span>;
  }
  const n = Number(score);
  const color =
    n >= 8 ? "bg-green-100 text-green-700"
    : n >= 5 ? "bg-amber-100 text-amber-700"
    : "bg-red-100 text-red-700";
  const sizing = size === "lg" ? "px-4 py-2 text-2xl" : "px-2.5 py-0.5 text-sm";

  return (
    <span className={`inline-block rounded-full font-semibold ${color} ${sizing}`}>
      {n.toFixed(1)}/10
    </span>
  );
}