// src/components/FeatureTiles.tsx
// Always-on feature tiles styled like the previous EmptyState cards.

import React from "react";

type Tile = {
  icon: React.ReactNode;
  title: string;
  desc: string;
  roadmap?: boolean;
};

export default function FeatureTiles() {
  const data: Tile[] = [
    { icon: "⚡", title: "Fast input", desc: "Add multiple items quickly." },
    { icon: "🧭", title: "Smart grouping", desc: "Auto by aisle/category." },
    { icon: "📶", title: "Offline later", desc: "PWA planned.", roadmap: true },
  ];

  return (
    <section className="mt-5 grid gap-3 sm:grid-cols-3">
      {data.map((f) => (
        <div
          key={f.title}
          className={[
            // EmptyState look & feel:
            "rounded-2xl border border-black/5 bg-white p-4 shadow-sm",
            // Weaken roadmap/teaser tile:
            f.roadmap ? "opacity-70 italic" : "",
          ].join(" ")}
        >
          <div className="flex items-start gap-3">
            <div className="text-2xl leading-none select-none" aria-hidden>
              {f.icon}
            </div>
            <div className="min-w-0">
              <h4 className="font-semibold text-slate-900">{f.title}</h4>
              <p className="text-sm text-slate-500">{f.desc}</p>
            </div>
          </div>
        </div>
      ))}
    </section>
  );
}
