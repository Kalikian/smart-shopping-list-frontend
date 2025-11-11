// src/components/List.tsx
// Open (N) + collapsible Later (K) + collapsible In cart (M) with per-item Undo.
// UI upgrade: FLIP layout animations on <motion.li>, no motion.ul.

import { useMemo, useState } from "react";
import ListItem, { type Item } from "./ListItem";
import type { CategoryLabel } from "../constants/categories";
import { sortItemsByCategory } from "../utils/sortItems";
import AddItemInline, { type AddItemInlineSubmit } from "./AddItemInline";
import CompactRow from "./CompactRow";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { Transition } from "framer-motion";

type ListProps = {
  items: Item[];
  onToggle?: (id: string) => void;
  onChange: (id: string, patch: Partial<Item>) => void;
  onDelete?: (id: string) => void;
  getColorForCategory: (c: CategoryLabel) => string;
  onAdd?: (payload: AddItemInlineSubmit) => void; // inline composer (optional)
};

const NEUTRAL = `hsl(var(--cat-neutral, 0 0% 55%))`;

export default function List({
  items = [],
  onToggle,
  onChange,
  onDelete,
  getColorForCategory,
  onAdd,
}: ListProps) {
  const reduceMotion = useReducedMotion();

  // Single source of truth: sort once, then split into buckets
  const sorted = useMemo(() => sortItemsByCategory(items), [items]);

  // Buckets
  const openItems = useMemo(
    () => sorted.filter((i) => !i.done && !i.snoozed),
    [sorted]
  );
  const laterItems = useMemo(
    () => sorted.filter((i) => !i.done && i.snoozed),
    [sorted]
  );
  const doneItems = useMemo(() => sorted.filter((i) => i.done), [sorted]);

  // Collapses
  const [showLater, setShowLater] = useState(false);
  const [showDone, setShowDone] = useState(false);

  const colorFor = (c: CategoryLabel) =>
    c === "Default" ? NEUTRAL : getColorForCategory(c);

  // Shared transitions (typed)
  const SPRING_ROW: Transition = {
    type: "spring",
    stiffness: 520,
    damping: 40,
    mass: 0.6,
  };
  const INSTANT: Transition = { duration: 0 };

  return (
    <section className="space-y-4">
      {/* Header: Open */}
      <header className="flex items-center justify-between">
        <h2 className="text-base font-semibold">
          Open <span className="text-slate-500">({openItems.length})</span>
        </h2>

        {/* Quick toggle for "In cart" */}
        <button
          type="button"
          onClick={() => setShowDone((v) => !v)}
          className="text-sm underline underline-offset-2"
          aria-expanded={showDone}
        >
          {showDone ? "Hide in cart" : `Show in cart (${doneItems.length})`}
        </button>
      </header>

      {/* Inline Add composer (only if onAdd provided) */}
      {onAdd && (
        <div id="add-composer" className="mb-3">
          <AddItemInline onSubmit={onAdd} inputId="add-item-name" />
        </div>
      )}

      {/* OPEN ITEMS (animated reorder + enter/exit) */}
      <ul>
        <AnimatePresence initial={false}>
          {openItems.map((it) => (
            <motion.li
              key={it.id}
              layout
              exit={{ opacity: 0, height: 0, margin: 0 }}
              transition={reduceMotion ? INSTANT : SPRING_ROW}
              className="mb-2"
            >
              <ListItem
                item={it}
                onToggle={onToggle ?? (() => {})}
                onChange={(patch) => onChange(it.id, patch)}
                onDelete={onDelete}
                color={colorFor(it.category ?? "Default")}
              />
            </motion.li>
          ))}

          {openItems.length === 0 && (
            <motion.li
              key="empty-open"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, height: 0, margin: 0 }}
              className="p-3 text-sm text-slate-500"
            >
              Nothing open.
            </motion.li>
          )}
        </AnimatePresence>
      </ul>

      {/* LATER BUCKET */}
      <div className="border-t border-black/10 pt-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">
            Later <span className="text-slate-500">({laterItems.length})</span>
          </h3>
          <button
            type="button"
            onClick={() => setShowLater((v) => !v)}
            className="text-sm underline underline-offset-2"
            aria-expanded={showLater}
          >
            {showLater ? "Collapse" : "Show all"}
          </button>
        </div>

        <AnimatePresence initial={false}>
          {showLater && (
            <motion.ul
              key="later-list"
              className="mt-2 space-y-2"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={
                reduceMotion
                  ? { duration: 0 }
                  : { type: "spring", stiffness: 420, damping: 36 }
              }
            >
              {laterItems.length === 0 && (
                <li className="p-3 text-sm text-slate-500">
                  Nothing parked for later.
                </li>
              )}

              {laterItems.map((it) => (
                <motion.li
                  key={it.id}
                  layout
                  exit={{ opacity: 0, height: 0, margin: 0 }}
                  transition={reduceMotion ? INSTANT : SPRING_ROW}
                  className="p-2"
                >
                  <CompactRow
                    item={it}
                    color={colorFor(it.category ?? "Default")}
                    primaryActionLabel="Move to Open"
                    onPrimaryAction={() => onChange(it.id, { snoozed: false })}
                    onDelete={onDelete}
                  />
                </motion.li>
              ))}
            </motion.ul>
          )}
        </AnimatePresence>
      </div>

      {/* IN CART (done) BUCKET */}
      <div className="border-t border-black/10 pt-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">
            In cart <span className="text-slate-500">({doneItems.length})</span>
          </h3>
          <button
            type="button"
            onClick={() => setShowDone((v) => !v)}
            className="text-sm underline underline-offset-2"
            aria-expanded={showDone}
          >
            {showDone ? "Collapse" : "Show all"}
          </button>
        </div>

        <AnimatePresence initial={false}>
          {showDone && (
            <motion.ul
              key="done-list"
              className="mt-2 space-y-2"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={
                reduceMotion
                  ? { duration: 0 }
                  : { type: "spring", stiffness: 420, damping: 36 }
              }
            >
              {doneItems.length === 0 && (
                <li className="p-3 text-sm text-slate-500">
                  No items in cart.
                </li>
              )}

              {doneItems.map((it) => (
                <motion.li
                  key={it.id}
                  layout
                  exit={{ opacity: 0, height: 0, margin: 0 }}
                  transition={reduceMotion ? INSTANT : SPRING_ROW}
                  className="p-2"
                >
                  <CompactRow
                    item={it}
                    color={colorFor(it.category ?? "Default")}
                    primaryActionLabel="Undo"
                    onPrimaryAction={() => onChange(it.id, { done: false })}
                    onDelete={onDelete}
                  />
                </motion.li>
              ))}
            </motion.ul>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
