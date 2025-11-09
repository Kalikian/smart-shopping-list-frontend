// src/App.tsx
// Orchestrates UI + offline-first data access via listStore.
// Inline create uses theme colors; list renders only after user names it.

import { useCallback, useEffect, useMemo, useState } from "react";
import AppHeader from "./components/AppHeader";
import HeroCard from "./components/HeroCard";
import FeatureTiles from "./components/FeatureTiles";
import List from "./components/List";
import Fab from "./components/Fab";
import ThemeSwitcher from "./components/ThemeSwitcher";
import type { Item } from "./components/ListItem";

import {
  loadSnapshot,
  saveSnapshot,
  createNewList,
  createAndSelectList,
  toggleItem,
  updateItem,
  addItem as addItemStore,
  removeItem as removeItemStore,
  type ListSnapshot,
} from "./data/listStore/index";     // Barrel


function newItemId() {
  return `it-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export default function App() {
  // Load snapshot if one exists; do NOT auto-create.
  const [list, setList] = useState<ListSnapshot | null>(loadSnapshot());

  // Inline-create UI state
  const [isInlineCreateOpen, setInlineCreateOpen] = useState(false);
  const [newListName, setNewListName] = useState("");

  // Persist defensively on changes (if a list exists)
  useEffect(() => {
    if (list) saveSnapshot(list);
  }, [list]);

  // Header counters
  const { total, open } = useMemo(() => {
    const items = list?.items ?? [];
    const total = items.length;
    const done = items.filter((i) => i.done).length;
    return { total, open: total - done };
  }, [list]);

  // Mutations (no-ops if list doesn't exist yet)
  const handleToggle = useCallback(
    (id: string) => {
      if (!list) return;
      const snap = toggleItem(id);
      setList(snap);
    },
    [list]
  );

  const handlePatch = useCallback(
    (id: string, patch: Partial<Item>) => {
      if (!list) return;
      const snap = updateItem(id, patch);
      setList(snap);
    },
    [list]
  );

  const handleAdd = useCallback(
    (draft: Omit<Item, "id">) => {
      if (!list) return;
      const item: Item = { id: newItemId(), ...draft };
      const snap = addItemStore(item);
      setList(snap);
    },
    [list]
  );

  const handleDelete = useCallback(
    (id: string) => {
      if (!list) return;
      const snap = removeItemStore(id);
      setList(snap);
    },
    [list]
  );

  // Hero actions
  const handleCreateNew = useCallback(() => {
    // Open inline name panel right under hero; no scrolling.
    setInlineCreateOpen(true);
  }, []);

  const handleConfirmCreate = useCallback(
    (e?: React.FormEvent) => {
      e?.preventDefault();
      const trimmed = newListName.trim();
      if (trimmed.length < 3) return;

      // Create a new empty list with a name and select it
      let created: ListSnapshot;
      if (typeof createAndSelectList === "function") {
        created = createAndSelectList(trimmed);
      } else {
        // Fallback (should not be hit in your current store)
        const snap = createNewList();
        created = { ...snap, name: trimmed };
        saveSnapshot(created);
      }

      setList(created);              // show empty list now
      setNewListName("");
      setInlineCreateOpen(false);
    },
    [newListName]
  );

  const handleCancelCreate = useCallback(() => {
    setNewListName("");
    setInlineCreateOpen(false);
  }, []);

  const handleOpenExisting = useCallback(() => {
    // Placeholder for future picker
  }, []);

  const currentListName = list?.name?.trim() || "My list";

  return (
    <div className="min-h-dvh bg-app text-[hsl(var(--text))]">
      <AppHeader open={open} total={total} />

      <div className="mx-auto max-w-screen-sm safe-x">
        <ThemeSwitcher />
      </div>

      <main className="mx-auto max-w-screen-sm safe-x pb-28 pt-4">
        <HeroCard onCreateNew={handleCreateNew} onOpenExisting={handleOpenExisting} />

        {/* Inline create panel (right under hero, theme-colored) */}
        {isInlineCreateOpen && (
          <form
            onSubmit={handleConfirmCreate}
            className="mt-4 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--panel))] p-4 shadow-sm"
          >
            <div className="flex items-end gap-3 max-sm:flex-col max-sm:items-stretch">
              <div className="grow">
                <label htmlFor="inline-list-name" className="block text-sm font-medium">
                  List name
                </label>
                <input
                  id="inline-list-name"
                  type="text"
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  placeholder="e.g., Lidl, Weekly Groceries, Party Prep"
                  className="mt-1 w-full rounded-xl border border-[hsl(var(--border))] bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-[hsl(var(--accent))]"
                  minLength={3}
                  maxLength={60}
                  autoComplete="off"
                />
                <p className="mt-1 text-xs opacity-70">
                  Tip: choose a clear, memorable name.
                </p>
              </div>

              <div className="flex gap-2 max-sm:justify-end">
                <button
                  type="button"
                  onClick={handleCancelCreate}
                  className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--panel))] px-4 py-2 text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={newListName.trim().length < 3}
                  className="rounded-xl bg-[hsl(var(--accent))] px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                >
                  Create
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Render list ONLY if it exists */}
        {list && (
          <section id="current-list" className="scroll-mt-20">
            <div className="mb-2 mt-6 flex items-center justify-between">
              <h2 className="text-base font-semibold">{currentListName}</h2>
              <span className="text-sm opacity-70">
                {open} open · {total} total
              </span>
            </div>

            <List
              items={list.items}
              onToggle={handleToggle}
              onChange={handlePatch}
              onAdd={handleAdd}
              onDelete={handleDelete}
            />
          </section>
        )}

        <FeatureTiles />
      </main>

      <Fab
        onClick={() => {
          document
            .querySelector("#current-list")
            ?.scrollIntoView({ behavior: "smooth", block: "start" });
        }}
      />
    </div>
  );
}