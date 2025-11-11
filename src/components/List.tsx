// src/components/List.tsx
// List section with header counters, category-based colors, and inline add-composer.
// - Prop-based API (items/onToggle/onChange/onAdd/onDelete)
// - Renders items sorted by Category (CATEGORIES order) -> Name (A–Z).
// - Forwards optional onDelete to ListItem so a Delete button appears per row.

import ListItem, { type Item } from "./ListItem";
import AddItemInline, { type AddItemInlineSubmit } from "./AddItemInline";
import type { CategoryLabel } from "../constants/categories";
import { useMemo } from "react";
import { sortItemsByCategory } from "../utils/sortItems";

// Neutral gray fallback: uses --cat-neutral if defined, else medium gray.
const NEUTRAL = `hsl(var(--cat-neutral, 0 0% 55%))`;

// Map each category to its color token; include "Default" -> neutral.
const CATEGORY_COLORS: Record<CategoryLabel, string> = {
  Default: NEUTRAL,
  Produce: `hsl(var(--cat-produce))`,
  Dairy: `hsl(var(--cat-dairy))`,
  "Meat & Fish": `hsl(var(--cat-meat))`,
  Bakery: `hsl(var(--cat-bakery))`,
  "Pantry (Dry)": `hsl(var(--cat-pantry))`,
  Beverages: `hsl(var(--cat-beverages))`,
  Frozen: `hsl(var(--cat-frozen))`,
  "Snacks & Sweets": `hsl(var(--cat-snacks))`,
  "Household & Care": `hsl(var(--cat-household))`,
};

// Returns per-item color (Default/undefined -> neutral)
function colorForItem(item: Item): string {
  const cat: CategoryLabel = (item.category ?? "Default") as CategoryLabel;
  return CATEGORY_COLORS[cat] ?? NEUTRAL;
}

type ListProps = {
  items: Item[];
  onToggle: (id: string) => void;
  onChange: (id: string, patch: Partial<Item>) => void;
  /** Called with a new item draft (without id) created via inline composer */
  onAdd?: (draft: Omit<Item, "id">) => void;
  /** Optional delete hook; when provided, ListItem shows a Delete button */
  onDelete?: (id: string) => void;
};

export default function List({
  items,
  onToggle,
  onChange,
  onAdd,
  onDelete,
}: ListProps) {
  // Stable, view-only sorted snapshot for rendering
  const sortedItems = useMemo(() => sortItemsByCategory(items), [items]);

  const total: number = sortedItems.length;
  const done: number = useMemo(
    () => sortedItems.filter((i) => i.done).length,
    [sortedItems]
  );

  // Map composer payload -> parent draft shape
  const handleAddSubmit = (data: AddItemInlineSubmit) => {
    const draft: Omit<Item, "id"> = {
      name: data.name,
      amount: data.amount,
      unit: data.unit,
      category: data.category,
      done: false,
    };
    onAdd?.(draft);
  };

  return (
    <section
      id="current-list" // keep anchor id for potential use; no scroll logic tied here
      className="mt-5 card p-0 overflow-hidden border border-black/10"
    >
      <header
        className="px-4 py-3 border-b border-black/10"
        style={{
          background:
            "linear-gradient(180deg, hsl(var(--bg)) 0%, hsl(var(--bg)) 60%, rgba(0,0,0,0.02) 100%)",
        }}
      >
        <h3 className="font-semibold">Current list</h3>
        <p className="text-sm text-[hsl(var(--muted))]">
          {total} total • {done} done
        </p>
      </header>

      {/* Inline Add Composer */}
      <AddItemInline onSubmit={handleAddSubmit} title="Add item" />

      <ul className="divide-y divide-black/5">
        {sortedItems.map((it) => (
          <ListItem
            key={it.id}
            item={it}
            color={colorForItem(it)}
            onToggle={() => onToggle(it.id)}
            onChange={(patch) => onChange(it.id, patch)}
            onDelete={onDelete ? () => onDelete(it.id) : undefined}
          />
        ))}
      </ul>
    </section>
  );
}
