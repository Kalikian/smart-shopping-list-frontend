// src/App.tsx
// Orchestrates UI + offline-first data access via listStore.
// Inline Add persists items; Delete is now wired through listStore.

import { useCallback, useEffect, useMemo, useState } from "react";
import AppHeader from "./components/AppHeader";
import HeroCard from "./components/HeroCard";
import FeatureTiles from "./components/FeatureTiles";
import List from "./components/List";
import Fab from "./components/Fab";
import ThemeSwitcher from "./components/ThemeSwitcher";
import type { Item } from "./components/ListItem";

import * as listStore from "./data/listStore";

function sleep(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}

function newItemId() {
  return `it-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export default function App() {
  // Load or create snapshot
  const stored = listStore.loadSnapshot();
  const [list, setList] = useState(stored ?? listStore.createNewList());

  // Persist defensively on changes
  useEffect(() => {
    listStore.saveSnapshot(list);
  }, [list]);

  const items = list.items;

  // Header counters
  const { total, open } = useMemo(() => {
    const total = items.length;
    const done = items.filter((i) => i.done).length;
    return { total, open: total - done };
  }, [items]);

  // Mutations
  const handleToggle = useCallback((id: string) => {
    const snap = listStore.toggleItem(id);
    setList(snap);
  }, []);

  const handlePatch = useCallback((id: string, patch: Partial<Item>) => {
    const snap = listStore.updateItem(id, patch);
    setList(snap);
  }, []);

  const handleAdd = useCallback((draft: Omit<Item, "id">) => {
    const item: Item = { id: newItemId(), ...draft };
    const snap = listStore.addItem(item);
    setList(snap);
  }, []);

  // NEW: Delete item
  const handleDelete = useCallback((id: string) => {
    const snap = listStore.removeItem(id);
    setList(snap);
  }, []);

  // Hero actions
  const handleCreateNew = useCallback(async () => {
    await sleep(600);
    const snap = listStore.createNewList();
    setList(snap);
    document.querySelector("#current-list")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const handleOpenExisting = useCallback(async () => {
    console.log("Open existing (to be implemented). Current:", list.id);
  }, [list.id]);

  // FAB: scroll to list (no auto-create)
  const handleFabClick = useCallback(() => {
    document.querySelector("#current-list")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  return (
    <div className="min-h-dvh bg-app text-[hsl(var(--text))]">
      <AppHeader open={open} total={total} />

      <div className="mx-auto max-w-screen-sm safe-x">
        <ThemeSwitcher />
      </div>

      <main className="mx-auto max-w-screen-sm safe-x pb-28 pt-4">
        <HeroCard onCreateNew={handleCreateNew} onOpenExisting={handleOpenExisting} />

        {/* Current list */}
        <div id="current-list" className="scroll-mt-20">
          <List
            items={items}
            onToggle={handleToggle}
            onChange={handlePatch}
            onAdd={handleAdd}
            onDelete={handleDelete}
          />
        </div>

        <FeatureTiles />
      </main>

      <Fab onClick={handleFabClick} />
    </div>
  );
}