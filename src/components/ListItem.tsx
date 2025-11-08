// src/components/ListItem.tsx
// Uniform field labels for clean alignment on small screens.
// - Each control has a label (Qty, Unit, Category)
// - XS: stacked fields; SM+: three columns (one row)
// - Custom +/- stepper (no native spinners)

import { useMemo } from "react";
import {
  CATEGORY_ICON_BY_LABEL,
  CATEGORIES,
  UNITS,
  type CategoryLabel,
  type Unit,
} from "../constants/categories";

export type Item = {
  id: string;
  name: string;
  done: boolean;
  amount?: number;
  unit?: Unit;
  category?: CategoryLabel;
};

type ListItemProps = {
  item: Item;
  onToggle: (id: string) => void;
  onChange: (patch: Partial<Item>) => void;
  onDelete?: (id: string) => void;
  color: string;
};

// Build translucent tint from various color formats
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

export default function ListItem({ item, onToggle, onChange, onDelete, color }: ListItemProps) {
  // Quantity helpers (mobile-friendly with +/-)
  const isDecimal = item.unit === "kg" || item.unit === "L";
  const step = isDecimal ? 0.1 : 1;

  const parseAmount = (raw: string): number | undefined => {
    const norm = raw.trim().replace(",", ".");
    if (norm === "") return undefined;
    const num = Number(norm);
    if (!Number.isFinite(num) || num < 0) return 0;
    return isDecimal ? Math.round(num * 10) / 10 : Math.trunc(num);
  };

  const inc = () => {
    const base = item.amount ?? 1;
    const next = isDecimal ? Math.round((base + step) * 10) / 10 : Math.max(0, Math.trunc(base + step));
    onChange({ amount: next });
  };

  const dec = () => {
    const base = item.amount ?? 1;
    const nextRaw = base - step;
    const next = isDecimal ? Math.max(0, Math.round(nextRaw * 10) / 10) : Math.max(0, Math.trunc(nextRaw));
    onChange({ amount: next });
  };

  const onAmountTyped: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const parsed = parseAmount(e.target.value);
    onChange({ amount: parsed });
  };

  const onAmountKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    const allowed = ["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab", "Home", "End"];
    const decimalChars = [",", "."];
    if (allowed.includes(e.key)) return;
    if (decimalChars.includes(e.key) && isDecimal) return;
    if (!/^[0-9]$/.test(e.key)) e.preventDefault();
  };

  const categoryLabel: CategoryLabel = item.category ?? "Default";
  const iconSrc = CATEGORY_ICON_BY_LABEL[categoryLabel];
  const isDefault = categoryLabel === "Default";

  const effectiveColor = isDefault ? undefined : color;
  const bgTint = useMemo(() => (isDefault ? "#ffffff" : alphaTint(effectiveColor!, 0.10)), [effectiveColor, isDefault]);
  const brdTint = useMemo(() => (isDefault ? "rgba(0,0,0,0.12)" : alphaTint(effectiveColor!, 0.35)), [effectiveColor, isDefault]);
  const leftAccent = useMemo(() => (isDefault ? "inset 0 0 0 0 transparent" : `inset 6px 0 0 0 ${effectiveColor}`), [effectiveColor, isDefault]);
  const softDrop = "0 1px 2px rgba(0,0,0,0.04)";

  return (
    <li className="p-2">
      <div
        className="relative flex flex-col gap-3 rounded-2xl border shadow-sm p-3 hover:shadow-md transition-all"
        style={{ backgroundColor: bgTint, borderColor: brdTint, boxShadow: isDefault ? softDrop : `${leftAccent}, ${softDrop}` }}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <input
              type="checkbox"
              className="h-5 w-5 rounded-md border border-black/20"
              checked={item.done}
              onChange={() => onToggle(item.id)}
              aria-label={`Mark ${item.name} as ${item.done ? "not done" : "done"}`}
              style={{ accentColor: effectiveColor }}
            />
            <div className={`font-semibold text-lg truncate ${item.done ? "line-through text-black/45" : ""}`} title={item.name}>
              {item.name}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span
              className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs"
              style={{
                backgroundColor: isDefault ? "#ffffff" : alphaTint(effectiveColor!, 0.16),
                boxShadow: isDefault ? "0 0 0 1px rgba(0,0,0,0.12) inset" : `0 0 0 1px ${alphaTint(effectiveColor!, 0.35)} inset`,
              }}
              title={categoryLabel}
            >
              {iconSrc ? (
                <img src={iconSrc} alt="" className="h-4 w-4 object-contain" draggable={false} />
              ) : (
                <span className="h-4 w-4 inline-block rounded-full bg-black/10" />
              )}
              <span className="hidden sm:inline">{categoryLabel}</span>
            </span>

            {onDelete && (
              <button
                type="button"
                onClick={() => onDelete(item.id)}
                className="rounded-full p-2 hover:bg-red-50 text-red-500 hover:text-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-200 transition-colors"
                aria-label={`Delete ${item.name}`}
                title="Delete"
              >
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                  <path d="M10 11v6" />
                  <path d="M14 11v6" />
                  <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Details with uniform labels */}
        <div className="grid grid-cols-1 gap-3 w-full sm:flex sm:items-start sm:gap-4">
          {/* Qty */}
          <label className="block sm:basis-0 sm:flex-1">
            <span className="block text-xs font-medium text-slate-500 mb-1">Qty</span>
            <div className="inline-flex sm:w-full sm:max-w-60 items-stretch rounded-md border border-black/10 overflow-hidden bg-white">
              <button
                type="button"
                onClick={dec}
                className="px-2 text-sm hover:bg-slate-50 focus:outline-none"
                aria-label="Decrease quantity"
                title="Decrease"
              >–</button>
              <input
                type="text"
                inputMode={isDecimal ? "decimal" : "numeric"}
                onWheel={(e) => (e.currentTarget as HTMLInputElement).blur()}
                className="h-9 w-20 text-center outline-none px-2"
                value={item.amount ?? ""}
                onChange={onAmountTyped}
                onKeyDown={onAmountKeyDown}
                aria-label="Quantity"
              />
              <button
                type="button"
                onClick={inc}
                className="px-2 text-sm hover:bg-slate-50 focus:outline-none"
                aria-label="Increase quantity"
                title="Increase"
              >+</button>
            </div>
          </label>

          {/* Unit */}
          <label className="block sm:basis-0 sm:flex-1">
            <span className="block text-xs font-medium text-slate-500 mb-1">Unit</span>
            <select
              className="h-9 w-full rounded-md border border-black/10 px-2 bg-white"
              value={item.unit ?? ""}
              onChange={(e) => onChange({ unit: (e.target.value || undefined) as Unit | undefined })}
              aria-label="Unit"
            >
              <option value="">Unit</option>
              {UNITS.map((u) => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
          </label>

          {/* Category */}
          <label className="block sm:basis-0 sm:flex-1">
            <span className="block text-xs font-medium text-slate-500 mb-1">Category</span>
            <select
              className="h-9 w-full rounded-md border border-black/10 px-2 bg-white"
              value={categoryLabel}
              onChange={(e) => onChange({ category: e.target.value as CategoryLabel })}
              aria-label="Category"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </label>
        </div>
      </div>
    </li>
  );
}