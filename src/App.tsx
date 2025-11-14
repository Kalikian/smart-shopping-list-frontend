// src/App.tsx
// Orchestrates UI + offline-first data access via listStore.
// Creation/open flows use dialogs; list renders only after user confirms.

import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import AppHeader from "./components/AppHeader";
import HeroCard from "./components/HeroCard";
import FeatureTiles from "./components/FeatureTiles";
import List from "./components/List";
import Fab from "./components/Fab";
import ThemeSwitcher from "./components/ThemeSwitcher";
import CreateListDialog from "./components/CreateListDialog";
import MyListsDialog from "./components/MyListsDialog";
import type { Item } from "./components/ListItem";
import type { CategoryLabel } from "./constants/categories";
import { getColorVarForCategory } from "./constants/categories";
import {
  ADD_EVENT,
  type AddItemInlineSubmit,
} from "./components/AddItemInline";

import {
  loadSnapshot,
  saveSnapshot,
  toggleItem,
  updateItem,
  addItem as addItemStore,
  removeItem as removeItemStore,
  type ListSnapshot,
} from "./data/listStore/index";
import "./i18n";
function newItemId() {
  return `it-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export default function App() {
  // i18n hook for translated UI strings
  const { t } = useTranslation("common");

  // Load snapshot if one exists; do NOT auto-create.
  const [list, setList] = useState<ListSnapshot | null>(loadSnapshot());

  // Dialog state
  const [createOpen, setCreateOpen] = useState(false);
  const [myListsOpen, setMyListsOpen] = useState(false);

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
    (draft: AddItemInlineSubmit) => {
      if (!list) return;
      // Map composer payload to Item shape
      const item: Item = {
        id: newItemId(),
        name: draft.name,
        amount: draft.amount,
        unit: draft.unit,
        category: draft.category,
        done: false,
        snoozed: false,
      } as Item;
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

  // Hero actions → open dialogs (no side effects)
  const handleCreateNew = useCallback(() => setCreateOpen(true), []);
  const handleOpenExisting = useCallback(() => setMyListsOpen(true), []);

  // Default list name is now translated via i18n
  const currentListName =
    list?.name?.trim() || t("app.defaultListName", "My list");

  // Category color resolver for List/ListItem (maps to CSS tokens)
  const getColorForCategory = useCallback(
    (c: CategoryLabel) => getColorVarForCategory(c),
    []
  );

  // FAB: open/focus inline composer by dispatching the global event
  const handleFabClick = useCallback(() => {
    window.dispatchEvent(new Event(ADD_EVENT));
  }, []);

  return (
    <div className="min-h-dvh bg-app text-[hsl(var(--text))]">
      <AppHeader open={open} total={total} />
      <div className="mx-auto max-w-screen-sm safe-x">
        <ThemeSwitcher />
      </div>
      <main className="mx-auto max-w-screen-sm safe-x pb-28 pt-4">
        <HeroCard
          onCreateNew={handleCreateNew}
          onOpenExisting={handleOpenExisting}
        />

        {/* Render list ONLY if it exists */}
        {list && (
          <section id="current-list" className="scroll-mt-20">
            <div className="mb-2 mt-6 flex items-center justify-between">
              <h2 className="text-base font-semibold">{currentListName}</h2>
              <span className="text-sm opacity-70">
                {t("list.headerSummary", { open, total })}
              </span>
            </div>

            <List
              items={list.items}
              onToggle={handleToggle}
              onChange={handlePatch}
              onDelete={handleDelete}
              getColorForCategory={getColorForCategory}
              onAdd={handleAdd}
            />
          </section>
        )}
        <FeatureTiles />
      </main>
      {/* FAB label comes from i18n buttons namespace */}
      <Fab title={t("buttons.addItem")} onClick={handleFabClick} />
      {/* --- Modals --- */}
      <CreateListDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={(snap) => setList(snap)}
      />
      <MyListsDialog
        open={myListsOpen}
        onClose={() => setMyListsOpen(false)}
        onSelected={(snap) => setList(snap)}
        onDeletedCurrent={() => setList(null)}
      />
    </div>
  );
}
