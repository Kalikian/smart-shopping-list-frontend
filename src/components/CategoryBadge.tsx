import { useMemo } from "react";
import { CATEGORY_ICON_BY_LABEL, type CategoryLabel } from "../constants/categories";

// Item row with inline editing for amount, unit, category.
// Shows colored left bar; checkbox accent matches row color.

export type Category = CategoryLabel;

export type Item = {
  id: string;
  name: string;
  done: boolean;
  amount?: number;
  unit?: string;
  category?: Category; // undefined -> "Default"
};

type ListItemProps = {
  item: Item;
  onToggle: (id: string) => void;
  onChange: (patch: Partial<Item>) => void;
  color: string; // e.g. 'hsl(var(--cat-meat))'
};

export const CATEGORIES = [
  "Default",
  "Produce",
  "Dairy",
  "Meat & Fish",
  "Bakery",
  "Pantry (Dry)",
  "Beverages",
  "Frozen",
  "Snacks & Sweets",
  "Household & Care",
] as const satisfies readonly Category[];

const UNITS = ["pcs", "kg", "g", "L", "ml", "pack"] as const;

// helper: aus "hsl(var(--cat-x))" -> "hsl(var(--cat-x) / 0.14)"
function alphaTint(hslOrVar: string, alpha = 0.14): string {
  // gängige Fälle: "hsl(var(--...))" oder "hsl(...)" -> mit Slash-Alpha erweitern
  if (hslOrVar.startsWith("hsl(") && hslOrVar.endsWith(")")) {
    return hslOrVar.replace(/\)$/, ` / ${alpha})`);
  }
  // Fallback leichte neutrale Tönung
  return "rgba(0,0,0,0.06)";
}

export default function ListItem({ item, onToggle, onChange, color }: ListItemProps) {
  const step = item.unit === "kg" || item.unit === "L" ? 0.1 : 1;

  const categoryLabel: Category = item.category ?? "Default";
  const iconSrc = CATEGORY_ICON_BY_LABEL[categoryLabel];
  const badgeBg = useMemo(() => alphaTint(color, 0.14), [color]);

  return (
    <li className="p-2">
      <div
        className="relative flex flex-wrap items-center gap-3 rounded-xl border border-black/10 bg-white/60 shadow-sm hover:shadow-md transition-all focus-within:ring-2 focus-within:ring-black/10"
        style={{ boxShadow: `inset 4px 0 0 0 ${color}` }}
      >
        {/* Checkbox */}
        <input
          type="checkbox"
          className="ml-3 mr-1 h-5 w-5 rounded-md"
          checked={item.done}
          onChange={() => onToggle(item.id)}
          aria-label={`Mark ${item.name} as ${item.done ? "not done" : "done"}`}
          style={{ accentColor: color }}
        />

        {/* Name + inline controls */}
        <div className="min-w-0 flex-1 py-3">
          <div className={`font-medium truncate ${item.done ? "line-through text-black/45" : ""}`}>
            {item.name}
          </div>

          {/* Inline controls: amount + unit + category */}
          <div className="mt-1 flex flex-wrap items-center gap-2 text-sm">
            {/* amount */}
            <label className="flex items-center gap-1">
              <span className="text-[hsl(var(--muted))]">Qty</span>
              <input
                type="number"
                inputMode="decimal"
                step={step}
                min={0}
                className="w-20 rounded-md border border-black/10 px-2 py-1"
                value={item.amount ?? ""}
                onChange={(e) => {
                  const raw = e.target.value;
                  onChange({ amount: raw === "" ? undefined : Number(raw) });
                }}
              />
            </label>

            {/* unit */}
            <select
              className="rounded-md border border-black/10 px-2 py-1"
              value={item.unit ?? ""}
              onChange={(e) => onChange({ unit: e.target.value || undefined })}
            >
              <option value="">Unit</option>
              {UNITS.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>

            {/* category */}
            <select
              className="rounded-md border border-black/10 px-2 py-1"
              value={categoryLabel}
              onChange={(e) => onChange({ category: e.target.value as Category })}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Right: category icon badge with tinted background */}
        <div className="mr-3 mb-3 sm:mb-0 flex items-center" title={categoryLabel} aria-label={categoryLabel}>
          <span
            className="inline-flex items-center justify-center rounded-full ring-1 ring-black/5"
            style={{ width: 28, height: 28, backgroundColor: badgeBg }}
          >
            {iconSrc ? (
              <img
                src={iconSrc}
                alt=""
                className="w-[60%] h-[60%] object-contain"
                draggable={false}
              />
            ) : (
              <span className="text-xs text-gray-500">?</span>
            )}
          </span>
          <span className="sr-only">{categoryLabel}</span>
        </div>
      </div>
    </li>
  );
}