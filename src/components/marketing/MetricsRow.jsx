// src/components/marketing/MetricsRow.jsx
export default function MetricsRow() {
  const items = [
    { label: "anonymous posts shared", value: "120k+" },
    { label: "supportive reactions sent", value: "860k+" },
    { label: "active users this month", value: "18k+" },
  ];

  return (
    <section aria-label="Key metrics" className="mx-auto max-w-7xl px-6 py-10">
      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {items.map((it) => (
          <li
            key={it.label}
            className="rounded-xl border border-secondary/50 bg-card/40 p-6"
          >
            <div className="text-3xl font-semibold text-inverted">{it.value}</div>
            <div className="mt-1 text-sm text-muted">{it.label}</div>
          </li>
        ))}
      </ul>
    </section>
  );
}
