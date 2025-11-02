// Orchestrates UI: header counters, local demo state, and handlers.
// Uses structured fields: amount (number), unit (string), category (Category).

import { useMemo, useState } from "react";
import AppHeader from "./components/AppHeader";
import HeroCard from "./components/HeroCard";
import FeatureTiles from "./components/FeatureTiles";
import List from "./components/List";
import Fab from "./components/Fab";
import type { Item } from "./components/ListItem";

export default function App() {
  // Demo data (EN categories)
  const [items, setItems] = useState<Item[]>([
    { id: "i1", name: "Bananas",   amount: 6, unit: "pcs",  category: "Produce",        done: false },
    { id: "i2", name: "Pasta",     amount: 2, unit: "pack", category: "Pantry (Dry)",    done: true  },
    { id: "i3", name: "Milk",      amount: 2, unit: "L",    category: "Dairy",           done: false },
    { id: "i4", name: "Olive oil", amount: 1, unit: "L",    category: "Pantry (Dry)",    done: true  },
  ]);

  const [creating, setCreating] = useState(false);

  // Header counters
  const { total, open } = useMemo(() => {
    const total = items.length;
    const done = items.filter((i) => i.done).length;
    return { total, open: total - done };
  }, [items]);

  // Toggle 'done'
  const toggleItem = (id: string) =>
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, done: !it.done } : it)));

  // Inline edit patch
  const updateItem = (id: string, patch: Partial<Item>) =>
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)));

  // Fake "create list" loader
  const handleCreateList = () => {
    setCreating(true);
    setTimeout(() => setCreating(false), 700);
  };

  return (
    <div className="min-h-screen bg-[hsl(var(--bg))] text-[hsl(var(--text))]">
      <AppHeader open={open} total={total} />

      <main className="mx-auto max-w-screen-sm safe-x pb-28 pt-4">
        <HeroCard creating={creating} onCreate={handleCreateList} />
        <List items={items} onToggle={toggleItem} onChange={updateItem} />
        <FeatureTiles />
      </main>

      <Fab />
    </div>
  );
}
