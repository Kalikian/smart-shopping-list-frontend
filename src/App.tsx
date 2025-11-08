// src/App.tsx
// Orchestrates UI + offline-first data access via listStore.
// Inline Add (in <List />) now persists items correctly.
// FAB no longer creates a dummy item; it scrolls to the list (and can later open the composer).

import { useCallback, useEffect, useMemo, useState } from "react";
import AppHeader from "./components/AppHeader";
import HeroCard from "./components/HeroCard";
import FeatureTiles from "./components/FeatureTiles";
import List from "./components/List";
import Fab from "./components/Fab";
import ThemeSwitcher from "./components/ThemeSwitcher";
import type { Item } from "./components/ListItem";

// Offline-first data layer
import * as listStore from "./data/listStore";

// Small helper to show Hero spinner briefly
function sleep(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}

// Simple id generator for items
function newItemId() {
  return `it-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export default function App() {
  // 1) Load or create a list snapshot (offline-first)
  const stored = listStore.loadSnapshot();
  const [list, setList] = useState(stored ?? listStore.createNewList());

  // 2) Persist on any change (defensive; listStore already persists on ops)
  useEffect(() => {
    listStore.saveSnapshot(list);
  }, [list]);

  const items = list.items;

  // 3) Header counters
  const { total, open } = useMemo(() => {
    const total = items.length;
    const done = items.filter((i) => i.done).length;
    return { total, open: total - done };
  }, [items]);

  // 4) Mutations hooked to listStore (optimistic + persisted)
  const handleToggle = useCallback((id: string) => {
    const snap = listStore.toggleItem(id);
    setList(snap);
  }, []);

  const handlePatch = useCallback((id: string, patch: Partial<Item>) => {
    const snap = listStore.updateItem(id, patch);
    setList(snap);
  }, []);

  // New: Add item coming from <AddItemInline /> (draft without id)
  const handleAdd = useCallback((draft: Omit<Item, "id">) => {
    const item: Item = { id: newItemId(), ...draft };
    const snap = listStore.addItem(item);
    setList(snap);
  }, []);

  // 5) Create a brand new list (used by HeroCard)
  const handleCreateNew = useCallback(async () => {
    await sleep(600);
    const snap = listStore.createNewList();
    setList(snap);
    const el = document.querySelector("#current-list");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const handleOpenExisting = useCallback(async () => {
    // TODO: implement a modal or route to pick older lists
    console.log("Open existing (to be implemented). Current:", list.id);
  }, [list.id]);

  // 6) FAB: no auto-create; just scroll to the list (later: open inline composer programmatically)
  const handleFabClick = useCallback(() => {
    const el = document.querySelector("#current-list");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    // Optional future: dispatch a CustomEvent 'open-add-composer' for the inline component to react to.
    // window.dispatchEvent(new CustomEvent("open-add-composer"));
  }, []);

  return (
    <div className="min-h-dvh bg-app text-[hsl(var(--text))]">
      <AppHeader open={open} total={total} />

      {/* Theme switch */}
      <div className="mx-auto max-w-screen-sm safe-x">
        <ThemeSwitcher />
      </div>

      <main className="mx-auto max-w-screen-sm safe-x pb-28 pt-4">
        <HeroCard onCreateNew={handleCreateNew} onOpenExisting={handleOpenExisting} />

        {/* Current list */}
        <div id="current-list" className="scroll-mt-20">
          <List items={items} onToggle={handleToggle} onChange={handlePatch} onAdd={handleAdd} />
        </div>

        <FeatureTiles />
      </main>

      {/* FAB just navigates to the list area */}
      <Fab onClick={handleFabClick} />
    </div>
  );
}