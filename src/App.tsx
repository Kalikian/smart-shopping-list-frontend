// src/App.tsx
// Integrate AppHeader and render a simple interactive items list (mock data).
// Mobile-first, minimal logic: toggle 'done' and live counters.

import { useMemo, useState } from "react";
import AppHeader from "./components/AppHeader";

type Item = {
  id: string;
  name: string;
  qty?: string;
  done: boolean;
  category?: string;
};

export default function App() {
  // Initialize once with a literal array (no ESLint deps issue)
  const [items, setItems] = useState<Item[]>([
    { id: "i1", name: "Bananas", qty: "6", done: false },
    { id: "i2", name: "Pasta", qty: "2 × 500g", done: true },
    { id: "i3", name: "Milk", qty: "2 × 1L", done: false },
    { id: "i4", name: "Olive oil", qty: "1", done: true },
  ]);
  const [creating, setCreating] = useState(false);

// derive total and done
const { total, done } = useMemo(() => {
  const total = items.length;
  const done = items.filter((i) => i.done).length;
  return { total, done };
}, [items]);

  // Toggle an item's 'done' flag
  const toggleItem = (id: string) => {
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, done: !it.done } : it))
    );
  };

  const handleCreateList = () => {
    setCreating(true);
    setTimeout(() => setCreating(false), 700);
  };

  return (
    <div className="min-h-screen bg-[hsl(var(--bg))] text-[hsl(var(--text))]">
      <AppHeader open={total} total={done} />

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

        {/* --- Current list (mock items) --- */}
        <section className="mt-5 card p-0 overflow-hidden">
          <header className="px-4 py-3 border-b border-black/5">
            <h3 className="font-semibold">Current list</h3>
            <p className="text-sm text-[hsl(var(--muted))]">
              {total} total • {done} done
            </p>
          </header>

          <ul className="divide-y divide-black/5">
            {items.map((it) => (
              <li key={it.id} className="px-4 py-3">
                <label className="flex items-center gap-3">
                  {/* Checkbox */}
                  <input
                    type="checkbox"
                    className="w-5 h-5 rounded-md accent-[hsl(var(--accent))]"
                    checked={it.done}
                    onChange={() => toggleItem(it.id)}
                    aria-label={`Mark ${it.name} as ${it.done ? "not done" : "done"}`}
                  />

                  {/* Name + Qty */}
                  <div className="flex-1 min-w-0">
                    <div
                      className={`font-medium truncate ${
                        it.done ? "line-through text-black/40" : ""
                      }`}
                    >
                      {it.name}
                    </div>
                    {it.qty && (
                      <div className="text-sm text-[hsl(var(--muted))]">{it.qty}</div>
                    )}
                  </div>

                  {/* Optional category chip (hidden for now if not set) */}
                  {it.category && <span className="chip">{it.category}</span>}
                </label>
              </li>
            ))}
          </ul>
        </section>

        {/* Feature tiles (placeholder) */}
        <section className="mt-5 grid gap-3 sm:grid-cols-3">
          {[
            { icon: "⚡", title: "Fast input", desc: "Add multiple items quickly." },
            { icon: "🧭", title: "Smart grouping", desc: "Auto by aisle/category." },
            { icon: "📶", title: "Offline later", desc: "PWA planned." },
          ].map((f) => (
            <div key={f.title} className="card p-4">
              <div className="text-xl" aria-hidden>
                {f.icon}
              </div>
              <h4 className="mt-1 font-semibold">{f.title}</h4>
              <p className="text-sm text-[hsl(var(--muted))]">{f.desc}</p>
            </div>
          ))}
        </section>
      </main>

      {/* Floating Action Button (placeholder for Add item) */}
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
