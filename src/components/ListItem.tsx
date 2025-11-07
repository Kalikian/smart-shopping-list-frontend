// src/components/ListItem.tsx
import { useMemo } from "react";
import {
  CATEGORY_ICON_BY_LABEL,
  CATEGORIES,
  UNITS,
  type CategoryLabel,
  type Unit,
} from "../constants/categories";

// Item type for the app's shopping list entries
export type Item = {
  id: string;
  name: string;
  done: boolean;
  amount?: number;
  unit?: Unit;
  category?: CategoryLabel; // undefined -> "Default"
};

type ListItemProps = {
  item: Item;
  onToggle: (id: string) => void;
  onChange: (patch: Partial<Item>) => void;
  /** category color, e.g. 'hsl(var(--cat-meat))' or '#ff9900' */
  color: string;
};

/** Create a translucent tint from various color formats */
function alphaTint(input: string, alpha = 0.12): string {
  const a = Math.max(0, Math.min(1, alpha));
  if (input.startsWith("hsl(")) return input.replace(/\)$/, ` / ${a})`);
  if (input.startsWith("rgb(")) return input.replace(/^rgb\(/, "rgba(").replace(/\)$/, `, ${a})`);
  if (input.startsWith("#")) {
    const hex = input.slice(1);
    const norm = hex.length === 3 ? hex.split("").map((c) => c + c).join("") : hex;
    const r = parseInt(norm.slice(0, 2), 16);
    const g = parseInt(norm.slice(2, 4), 16);
    const b = parseInt(norm.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${a})`;
  }
  if (input.startsWith("var(")) return `hsl(${input} / ${a})`;
  return "rgba(0,0,0,0.06)";
}

export default function ListItem({ item, onToggle, onChange, color }: ListItemProps) {
  const step = item.unit === "kg" || item.unit === "L" ? 0.1 : 1;

  const categoryLabel: CategoryLabel = item.category ?? "Default";
  const iconSrc = CATEGORY_ICON_BY_LABEL[categoryLabel];
  const isDefault = categoryLabel === "Default";

  // No tint for Default category
  const effectiveColor = isDefault ? undefined : color;

  // Tints / Styles
  const bgTint = useMemo(
    () => (isDefault ? "#ffffff" : alphaTint(effectiveColor!, 0.1)),
    [effectiveColor, isDefault]
  );
  const brdTint = useMemo(
    () => (isDefault ? "rgba(0,0,0,0.10)" : alphaTint(effectiveColor!, 0.35)),
    [effectiveColor, isDefault]
  );
  const barShadow = useMemo(
    () => (isDefault ? "" : `inset 6px 0 0 0 ${effectiveColor}`),
    [effectiveColor, isDefault]
  );
  const softDrop = "0 1px 2px rgba(0,0,0,0.04)";

  return (
    <li className="p-2">
      <div
        className="relative flex flex-wrap items-center gap-3 rounded-2xl border shadow-sm hover:shadow-md transition-all focus-within:ring-2 focus-within:ring-black/10"
        style={{
          backgroundColor: bgTint,
          borderColor: brdTint,
          boxShadow: isDefault ? softDrop : `${barShadow}, ${softDrop}`,
        }}
      >
        {/* Checkbox */}
        <input
          type="checkbox"
          className="ml-3 mr-1 h-6 w-6 rounded-md border border-black/20"
          checked={item.done}
          onChange={() => onToggle(item.id)}
          aria-label={`Mark ${item.name} as ${item.done ? "not done" : "done"}`}
          style={{ accentColor: effectiveColor }}
        />

        {/* Name + inline controls */}
        <div className="min-w-0 flex-1 py-3">
          <div className={`font-semibold text-lg truncate ${item.done ? "line-through text-black/45" : ""}`}>
            {item.name}
          </div>

          {/* Inline controls: amount + unit + category */}
          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
            <label className="flex items-center gap-1">
              <span className="text-[hsl(var(--muted))]">Qty</span>
              <input
                type="number"
                inputMode="decimal"
                step={step}
                min={0}
                className="h-9 w-24 rounded-md border border-black/10 px-2"
                value={item.amount ?? ""}
                onChange={(e) => {
                  const raw = e.target.value;
                  onChange({ amount: raw === "" ? undefined : Number(raw) });
                }}
              />
            </label>

            <select
              className="h-9 rounded-md border border-black/10 px-2"
              value={item.unit ?? ""}
              onChange={(e) => onChange({ unit: (e.target.value || undefined) as Unit | undefined })}
            >
              <option value="">Unit</option>
              {UNITS.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>

            <select
              className="h-9 rounded-md border border-black/10 px-2"
              value={categoryLabel}
              onChange={(e) => onChange({ category: e.target.value as CategoryLabel })}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Right: category icon badge */}
        <div className="mr-3 mb-3 sm:mb-0 flex items-center" title={categoryLabel} aria-label={categoryLabel}>
          <span
            className="inline-flex items-center justify-center rounded-full"
            style={{
              width: 32,
              height: 32,
              backgroundColor: isDefault ? "#ffffff" : alphaTint(effectiveColor!, 0.18),
              boxShadow: isDefault
                ? "0 0 0 1px rgba(0,0,0,0.12) inset"
                : `0 0 0 1px ${alphaTint(effectiveColor!, 0.35)} inset`,
            }}
          >
            {iconSrc ? (
              <img src={iconSrc} alt="" className="w-[60%] h-[60%] object-contain" draggable={false} />
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