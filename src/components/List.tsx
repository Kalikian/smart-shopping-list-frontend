// src/components/List.tsx
// List section showing header with counters + items and visible card border.
// Maps category -> fixed brand colors (CSS variables).
// If no category is chosen, use a neutral gray (CSS var with fallback).

import ListItem, { type Item } from "./ListItem";
import type { CategoryLabel } from "../constants/categories";

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
  const cat: CategoryLabel = item.category ?? "Default";
  return CATEGORY_COLORS[cat] ?? NEUTRAL;
}

type ListProps = {
  items: Item[];
  onToggle: (id: string) => void;
  onChange: (id: string, patch: Partial<Item>) => void;
};

export default function List({ items, onToggle, onChange }: ListProps) {
  const total = items.length;
  const done = items.filter((i) => i.done).length;

  return (
    <section className="mt-5 card p-0 overflow-hidden border border-black/10">
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

      <ul className="divide-y divide-black/5">
        {items.map((it) => (
          <ListItem
            key={it.id}
            item={it}
            color={colorForItem(it)}
            onToggle={onToggle}
            onChange={(patch) => onChange(it.id, patch)}
          />
        ))}
      </ul>
    </section>
  );
}
