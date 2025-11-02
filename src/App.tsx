// src/App.tsx
// Mobile-first landing using our design tokens & utility classes.
// Note: App copy and comments are in English.

import { useState } from "react";

export default function App() {
  const [creating, setCreating] = useState(false);

  // Mock handler for primary action (we'll wire real routes later)
  const handleCreateList = () => {
    setCreating(true);
    setTimeout(() => setCreating(false), 700);
  };

  return (
    <div className="min-h-screen bg-[hsl(var(--bg))] text-[hsl(var(--text))]">
      {/* Top App Bar */}
      <header className="appbar safe-x">
        <div className="mx-auto max-w-screen-sm flex items-center justify-between py-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl" aria-hidden>🛒</span>
            <h1 className="text-lg font-semibold tracking-tight">Smart Shopping List</h1>
          </div>

          {/* Placeholder icon button */}
          <button
            type="button"
            className="btn-icon"
            title="Coming soon"
            aria-label="Settings (coming soon)"
            disabled
          >
            ⚙️
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-screen-sm safe-x pb-28 pt-4">
        {/* Hero Card */}
        <section className="card p-5 mt-2">
          <p className="chip">
            <span aria-hidden>✨</span> Quick & simple
          </p>
          <h2 className="mt-3 text-2xl font-bold tracking-tight">
            Build smarter lists in seconds.
          </h2>
          <p className="mt-2 text-[15px] text-[hsl(var(--muted))]">
            Add items fast, group by category, and check them off in-store.
          </p>

          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={handleCreateList}
              disabled={creating}
              className="btn btn-primary"
            >
              {creating ? "Creating…" : "Create new list"}
            </button>
            <button type="button" className="btn btn-ghost" disabled title="Coming soon">
              Open existing
            </button>
          </div>
        </section>

        {/* Lists preview (cards) */}
        <section className="mt-5 grid gap-3">
          {[
            { name: "Weekly Groceries", items: 18, updated: "Today" },
            { name: "BBQ Party", items: 12, updated: "Yesterday" },
            { name: "Pharmacy Run", items: 6, updated: "2 days ago" },
          ].map((list) => (
            <article key={list.name} className="card p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">{list.name}</h3>
                  <p className="text-sm text-[hsl(var(--muted))]">
                    {list.items} items • updated {list.updated}
                  </p>
                </div>
                <span className="chip" aria-label="status">
                  🧾 List
                </span>
              </div>
            </article>
          ))}
        </section>

        {/* Feature tiles */}
        <section className="mt-5 grid gap-3 sm:grid-cols-3">
          {[
            { icon: "⚡", title: "Fast input", desc: "Add multiple items quickly." },
            { icon: "🧭", title: "Smart grouping", desc: "Auto by aisle/category." },
            { icon: "📶", title: "Offline later", desc: "PWA planned." },
          ].map((f) => (
            <div key={f.title} className="card p-4">
              <div className="text-xl" aria-hidden>{f.icon}</div>
              <h4 className="mt-1 font-semibold">{f.title}</h4>
              <p className="text-sm text-[hsl(var(--muted))]">{f.desc}</p>
            </div>
          ))}
        </section>
      </main>

      {/* Floating Action Button (primary mobile action) */}
      <button
        type="button"
        className="fab"
        aria-label="Add item"
        title="Add item (coming soon)"
        disabled
      >
        ＋
      </button>
    </div>
  );
}
