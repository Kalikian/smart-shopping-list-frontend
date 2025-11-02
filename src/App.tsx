import { useMemo, useState } from "react";
import AppHeader from "./components/AppHeader";
import HeroCard from "./components/HeroCard";
import FeatureTiles from "./components/FeatureTiles";
import List from "./components/List";
import Fab from "./components/Fab";
import type { Item } from "./components/ListItem";

export default function App() {
  // Local demo state
  const [items, setItems] = useState<Item[]>([
    { id: "i1", name: "Bananas", qty: "6", done: false },
    { id: "i2", name: "Pasta", qty: "2 × 500g", done: true },
    { id: "i3", name: "Milk", qty: "2 × 1L", done: false },
    { id: "i4", name: "Olive oil", qty: "1", done: true },
  ]);
  const [creating, setCreating] = useState(false);

  // Derive counters for header
  const { total, open } = useMemo(() => {
    const total = items.length;
    const done = items.filter((i) => i.done).length;
    return { total, open: total - done };
  }, [items]);

  // Toggle 'done'
  const toggleItem = (id: string) =>
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, done: !it.done } : it)));

  // Fake create
  const handleCreateList = () => {
    setCreating(true);
    setTimeout(() => setCreating(false), 700);
  };

  return (
    <div className="min-h-screen bg-[hsl(var(--bg))] text-[hsl(var(--text))]">
      {/* FIX: pass correct header numbers (open, total) */}
      <AppHeader open={open} total={total} />

      <main className="mx-auto max-w-screen-sm safe-x pb-28 pt-4">
        <HeroCard creating={creating} onCreate={handleCreateList} />
        <List items={items} onToggle={toggleItem} />
        <FeatureTiles />
      </main>

      <Fab />
    </div>
  );
}
