// src/components/FeatureTiles.tsx
// Footer tiles with concise UX guidance for swipe + undo.
// - Keep visual style lightweight (white cards, subtle shadow/border)
// - Accessible labels + clear arrow semantics

export default function FeatureTiles() {
  const tiles = [
    {
      icon: "⚡",
      title: "Fast input",
      desc: "Add multiple items quickly.",
    },
    {
      icon: "🧭",
      title: "Smart grouping",
      desc: "Auto by aisle/category.",
    },
    {
      icon: "🛒",
      title: "Swipe to complete",
      desc: (
        <>
          <span className="inline-block mr-1" aria-hidden>
            ➜
          </span>
          <strong>Right</strong> = move to <em>In cart</em>.{" "}
          <span className="inline-block ml-2 mr-1" aria-hidden>
            ⇠
          </span>
          <strong>Left</strong> = move to <em>Later</em>.
        </>
      ),
    },
    {
      icon: "↩️",
      title: "Quick undo",
      desc: (
        <>
          In <em>In cart</em> or <em>Later</em>: swipe <strong>right</strong> to
          send back to <em>Open</em>.
        </>
      ),
    },
    {
      icon: "✏️",
      title: "Edit & delete",
      desc: "Use the pencil to edit details, the bin to remove an item.",
    },
  ];

  return (
    <section
      aria-label="How it works"
      className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
    >
      {tiles.map((t) => (
        <article
          key={t.title}
          className="rounded-xl border border-black/10 bg-white shadow-sm p-4"
        >
          <div className="flex items-start gap-3">
            <div className="text-xl" aria-hidden>
              {t.icon}
            </div>
            <div className="min-w-0">
              <h4 className="font-semibold">{t.title}</h4>
              <p className="text-sm text-slate-600 mt-0.5">{t.desc}</p>
            </div>
          </div>
        </article>
      ))}
    </section>
  );
}
