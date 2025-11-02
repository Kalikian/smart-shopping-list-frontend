// Tiny static feature grid
export default function FeatureTiles() {
  const data = [
    { icon: "⚡", title: "Fast input", desc: "Add multiple items quickly." },
    { icon: "🧭", title: "Smart grouping", desc: "Auto by aisle/category." },
    { icon: "📶", title: "Offline later", desc: "PWA planned." },
  ];
  return (
    <section className="mt-5 grid gap-3 sm:grid-cols-3">
      {data.map((f) => (
        <div key={f.title} className="card p-4">
          <div className="text-xl" aria-hidden>
            {f.icon}
          </div>
          <h4 className="mt-1 font-semibold">{f.title}</h4>
          <p className="text-sm text-[hsl(var(--muted))]">{f.desc}</p>
        </div>
      ))}
    </section>
  );
}
