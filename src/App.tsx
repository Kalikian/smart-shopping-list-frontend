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
import CreateListDialog from "./components/CreateListDialog";
import MyListsDialog from "./components/MyListsDialog";
import PreferencesBar from "./components/PreferencesBar";
import CurrentListHeader from "./components/CurrentListHeader";
import {
  ADD_EVENT,
  type AddItemInlineSubmit,
} from "./components/AddItemInline";

import type { Item } from "./components/ListItem";
import type { CategoryLabel } from "./constants/categories";
import { getColorVarForCategory } from "./constants/categories";
import {
  loadSnapshot,
  saveSnapshot,
  toggleItem,
  updateItem,
  addItem as addItemStore,
  removeItem as removeItemStore,
  type ListSnapshot,
} from "./data/listStore/index";
import { calculateListCounters } from "./utils/listMetrics";
import { createItemId } from "./utils/ids";

export default function App() {
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

  // Header counters: align "open" with Open bucket (!done && !snoozed)
  const { total, open } = useMemo(() => {
    const items = list?.items ?? [];
    const { total, open } = calculateListCounters(items);
    return { total, open };
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
        id: createItemId(),
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

  const currentListName =
    list?.name?.trim() || t("app.defaultListName", { defaultValue: "My list" });

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
      <AppHeader
        open={open}
        total={total}
        title={t("app.title", { defaultValue: "Smart Shopping List" })}
      />

      <div className="mx-auto max-w-screen-sm safe-x">
        <PreferencesBar />
      </div>

      <main className="mx-auto max-w-screen-sm safe-x pb-28 pt-4">
        <HeroCard
          onCreateNew={handleCreateNew}
          onOpenExisting={handleOpenExisting}
          title={t("hero.title")}
          subtitle={t("hero.subtitle")}
        />

        {/* Render list ONLY if it exists */}
        {list && (
          <section id="current-list" className="scroll-mt-20">
            <CurrentListHeader
              name={currentListName}
              open={open}
              total={total}
            />

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

      <Fab
        title={t("buttons.addItem", { defaultValue: "Add item" })}
        onClick={handleFabClick}
      />

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
