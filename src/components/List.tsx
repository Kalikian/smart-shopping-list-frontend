// src/components/List.tsx
// Open (N) + collapsible "In cart (M)" with per-item Undo (English labels).
// Uses shared utils/sortItems to keep ordering stable across state changes (incl. Undo).

import { useMemo, useState } from "react";
import ListItem, { type Item } from "./ListItem";
import type { CategoryLabel } from "../constants/categories";
import { CATEGORY_ICON_BY_LABEL } from "../constants/categories";
import { sortItemsByCategory } from "../utils/sortItems";

type ListProps = {
  items: Item[];
  onToggle?: (id: string) => void;
  onChange: (id: string, patch: Partial<Item>) => void;
  onDelete?: (id: string) => void;
  getColorForCategory: (c: CategoryLabel) => string;
};

const NEUTRAL = `hsl(var(--cat-neutral, 0 0% 55%))`;

export default function List({
  items,
  onToggle,
  onChange,
  onDelete,
  getColorForCategory,
}: ListProps) {
  // Single source of truth: first sort, then split into open/done.
  const sorted = useMemo(() => sortItemsByCategory(items), [items]);
  const openItems = useMemo(() => sorted.filter((i) => !i.done), [sorted]);
  const doneItems = useMemo(() => sorted.filter((i) => i.done), [sorted]);

  const [showDone, setShowDone] = useState(false);

  const colorFor = (c: CategoryLabel) =>
    c === "Default" ? NEUTRAL : getColorForCategory(c);

  return (
    <section className="space-y-4">
      {/* Header: Open */}
      <header className="flex items-center justify-between">
        <h2 className="text-base font-semibold">
          Open <span className="text-slate-500">({openItems.length})</span>
        </h2>

        <button
          type="button"
          onClick={() => setShowDone((v) => !v)}
          className="text-sm underline underline-offset-2"
          aria-expanded={showDone}
        >
          {showDone ? "Hide in cart" : `Show in cart (${doneItems.length})`}
        </button>
      </header>

      {/* OPEN ITEMS */}
      <ul>
        {openItems.map((it) => (
          <ListItem
            key={it.id}
            item={it}
            onToggle={onToggle ?? (() => {})}
            onChange={(patch) => onChange(it.id, patch)}
            onDelete={onDelete}
            color={colorFor(it.category ?? "Default")}
          />
        ))}

        {openItems.length === 0 && (
          <li className="p-3 text-sm text-slate-500">Nothing open.</li>
        )}
      </ul>

      {/* DONE BUCKET */}
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

        {showDone && (
          <ul className="mt-2 space-y-2">
            {doneItems.length === 0 && (
              <li className="p-3 text-sm text-slate-500">No items in cart.</li>
            )}

            {doneItems.map((it) => (
              <DoneRow
                key={it.id}
                item={it}
                color={colorFor(it.category ?? "Default")}
                onUndo={() => onChange(it.id, { done: false })}
                onDelete={onDelete}
              />
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

function DoneRow({
  item,
  color,
  onUndo,
  onDelete,
}: {
  item: Item;
  color: string;
  onUndo: () => void;
  onDelete?: (id: string) => void;
}) {
  const category: CategoryLabel = item.category ?? "Default";
  const iconSrc = CATEGORY_ICON_BY_LABEL[category];

  return (
    <li className="p-2">
      <div
        className="flex items-center justify-between gap-3 rounded-xl border bg-white p-3"
        style={{
          borderColor: "rgba(0,0,0,0.12)",
          boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
        }}
      >
        <div className="flex items-center gap-3 min-w-0">
          <span
            className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
            style={{ backgroundColor: color, opacity: 0.2 }}
            aria-hidden
          >
            {iconSrc ? (
              <img
                src={iconSrc}
                alt=""
                className="h-4 w-4 object-contain opacity-80"
              />
            ) : (
              <span className="h-3 w-3 rounded-full bg-black/20 inline-block" />
            )}
          </span>

          <div className="min-w-0">
            <div className="font-medium truncate">{item.name}</div>
            <div className="text-xs text-slate-500">
              {item.amount ?? "–"} {item.unit ?? ""}
              {category !== "Default" ? ` · ${category}` : ""}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onUndo}
            className="rounded-full px-3 py-1 text-sm border border-black/10 hover:bg-slate-50"
            title="Move back to Open"
          >
            Undo
          </button>

          {onDelete && (
            <button
              type="button"
              onClick={() => onDelete(item.id)}
              className="rounded-full px-3 py-1 text-sm border border-black/10 hover:bg-slate-50"
              title="Delete item"
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </li>
  );
}
