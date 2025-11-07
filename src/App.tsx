// src/App.tsx
// Orchestrates UI: header counters, local demo state, and handlers.
// Uses structured fields: amount (number), unit (string), category (Category).

import { useCallback, useEffect, useMemo, useState } from "react";
import AppHeader from "./components/AppHeader";
import HeroCard from "./components/HeroCard";
import FeatureTiles from "./components/FeatureTiles";
import List from "./components/List";
import Fab from "./components/Fab";
import type { Item } from "./components/ListItem";
import ThemeSwitcher from "./components/ThemeSwitcher";

const STORAGE_KEY = "ssl.currentList";

type SavedList = {
  id: string;
  createdAt: string;
  items: Item[];
};

// Helper: load from localStorage (safe)
function loadList(): SavedList | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as SavedList;
  } catch {
    return null;
  }
}

// Helper: save to localStorage (safe)
function saveList(list: SavedList) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    // ignore quota errors for now
  }
}

// tiny delay to show spinner
function sleep(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}

export default function App() {
  // 1) initial items: load from storage or fall back to demo
  const stored = loadList();
  const [listId, setListId] = useState<string>(
    stored?.id ?? "demo-list"
  );
  const [createdAt, setCreatedAt] = useState<string>(
    stored?.createdAt ?? new Date().toISOString()
  );
  const [items, setItems] = useState<Item[]>(
    stored?.items ?? [
      { id: "i1", name: "Bananas",   amount: 6, unit: "pcs",  category: "Produce",      done: false },
      { id: "i2", name: "Pasta",     amount: 2, unit: "pack", category: "Pantry (Dry)", done: true  },
      { id: "i3", name: "Milk",      amount: 2, unit: "L",    category: "Dairy",        done: false },
      { id: "i4", name: "Olive oil", amount: 1, unit: "L",    category: "Pantry (Dry)", done: true  },
    ]
  );

  // 2) persist whenever list changes
  useEffect(() => {
    saveList({ id: listId, createdAt, items });
  }, [listId, createdAt, items]);

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

  // 3) Create new list: reset items, new id, persist
  const handleCreateList = useCallback(async () => {
    // spinner kurz sichtbar lassen
    await sleep(700);

    const newId = `list-${Date.now()}`;
    const created = new Date().toISOString();

    setListId(newId);
    setCreatedAt(created);
    setItems([]); // start empty

    // smooth scroll zum Listenbereich (optional)
    const el = document.querySelector("#current-list");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    console.log("Created new list:", newId);
  }, []);

  const handleOpenExisting = useCallback(async () => {
    // später: Modal/Route zu "Alle Listen" o.ä.
    console.log("Open existing (to be implemented). Current list:", listId);
  }, [listId]);

  return (
    <div className="min-h-dvh bg-app text-[hsl(var(--text))]">
      <AppHeader open={open} total={total} />

      {/* Theme switch */}
      <div className="mx-auto max-w-screen-sm safe-x">
        <ThemeSwitcher />
      </div>

      <main className="mx-auto max-w-screen-sm safe-x pb-28 pt-4">
        <HeroCard
          onCreateNew={handleCreateList}
          onOpenExisting={handleOpenExisting}
        />

        {/* Listenbereich (mit anchor für smooth scroll) */}
        <div id="current-list" className="scroll-mt-20">
          <List items={items} onToggle={toggleItem} onChange={updateItem} />
        </div>

        <FeatureTiles />
      </main>

      <Fab />
    </div>
  );
}