// src/components/ListItem.tsx
// Uniform field labels for clean alignment on small screens.
// - Each control has a label (Qty, Unit, Category)
// - XS: stacked fields; SM+: three columns (one row)
// - Custom +/- stepper (no native spinners)

import { useMemo, useState } from "react";
import {
  CATEGORY_ICON_BY_LABEL,
  CATEGORIES,
  UNITS,
  type CategoryLabel,
  type Unit,
} from "../constants/categories";
import TrashButton from "./ui/TrashButton";

export type Item = {
  id: string;
  name: string;
  done: boolean; // bleibt im Typ, wird hier aber nicht genutzt
  amount?: number;
  unit?: Unit;
  category?: CategoryLabel;
};

type ListItemProps = {
  item: Item;
  onToggle: (id: string) => void; // bleibt für Parent-Kompatibilität, UNUSED
  onChange: (patch: Partial<Item>) => void;
  onDelete?: (id: string) => void;
  color: string;
};

// Build translucent tint from various color formats
function alphaTint(input: string, alpha = 0.12): string {
  const a = Math.max(0, Math.min(1, alpha));
  if (input.startsWith("hsl(")) return input.replace(/\)$/, ` / ${a})`);
  if (input.startsWith("rgb("))
    return input.replace(/^rgb\(/, "rgba(").replace(/\)$/, `, ${a})`);
  if (input.startsWith("#")) {
    const hex = input.slice(1);
    const norm =
      hex.length === 3
        ? hex
            .split("")
            .map((c) => c + c)
            .join("")
        : hex;
    const r = parseInt(norm.slice(0, 2), 16);
    const g = parseInt(norm.slice(2, 4), 16);
    const b = parseInt(norm.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${a})`;
  }
  if (input.startsWith("var(")) return `hsl(${input} / ${a})`;
  return "rgba(0,0,0,0.06)";
}

export default function ListItem({
  item,
  onChange,
  onDelete,
  color,
}: ListItemProps) {
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
    const next = isDecimal
      ? Math.round((base + step) * 10) / 10
      : Math.max(0, Math.trunc(base + step));
    onChange({ amount: next });
  };

  const dec = () => {
    const base = item.amount ?? 1;
    const nextRaw = base - step;
    const next = isDecimal
      ? Math.max(0, Math.round(nextRaw * 10) / 10)
      : Math.max(0, Math.trunc(nextRaw));
    onChange({ amount: next });
  };

  const onAmountTyped: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const parsed = parseAmount(e.target.value);
    onChange({ amount: parsed });
  };

  const onAmountKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    const allowed = [
      "Backspace",
      "Delete",
      "ArrowLeft",
      "ArrowRight",
      "Tab",
      "Home",
      "End",
    ];
    const decimalChars = [",", "."];
    if (allowed.includes(e.key)) return;
    if (decimalChars.includes(e.key) && isDecimal) return;
    if (!/^[0-9]$/.test(e.key)) e.preventDefault();
  };

  const categoryLabel: CategoryLabel = item.category ?? "Default";
  const iconSrc = CATEGORY_ICON_BY_LABEL[categoryLabel];
  const isDefault = categoryLabel === "Default";

  const effectiveColor = isDefault ? undefined : color;
  const bgTint = useMemo(
    () => (isDefault ? "#ffffff" : alphaTint(effectiveColor!, 0.1)),
    [effectiveColor, isDefault]
  );
  const brdTint = useMemo(
    () => (isDefault ? "rgba(0,0,0,0.12)" : alphaTint(effectiveColor!, 0.35)),
    [effectiveColor, isDefault]
  );
  const leftAccent = useMemo(
    () =>
      isDefault
        ? "inset 0 0 0 0 transparent"
        : `inset 6px 0 0 0 ${effectiveColor}`,
    [effectiveColor, isDefault]
  );
  const softDrop = "0 1px 2px rgba(0,0,0,0.04)";

  // --- Tap-to-expand for long names (optional) ---
  const [showFullName, setShowFullName] = useState(false);

  return (
    <li className="p-2">
      <div
        className="relative flex flex-col gap-3 rounded-2xl border shadow-sm p-3 hover:shadow-md transition-all"
        style={{
          backgroundColor: bgTint,
          borderColor: brdTint,
          boxShadow: isDefault ? softDrop : `${leftAccent}, ${softDrop}`,
        }}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            {/* (Checkbox entfernt) */}

            {/* Name: tap to expand/collapse */}
            <button
              type="button"
              onClick={() => setShowFullName((v) => !v)}
              className={[
                "text-left font-semibold text-lg min-w-0",
                showFullName
                  ? "whitespace-normal wrap-break-words max-h-28 overflow-y-auto pr-1"
                  : "truncate",
              ].join(" ")}
              title={item.name}
              aria-expanded={showFullName}
              aria-label={showFullName ? "Collapse name" : "Expand name"}
            >
              {item.name}
            </button>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span
              className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs"
              style={{
                backgroundColor: isDefault
                  ? "#ffffff"
                  : alphaTint(effectiveColor!, 0.16),
                boxShadow: isDefault
                  ? "0 0 0 1px rgba(0,0,0,0.12) inset"
                  : `0 0 0 1px ${alphaTint(effectiveColor!, 0.35)} inset`,
              }}
              title={categoryLabel}
            >
              {iconSrc ? (
                <img
                  src={iconSrc}
                  alt=""
                  className="h-4 w-4 object-contain"
                  draggable={false}
                />
              ) : (
                <span className="h-4 w-4 inline-block rounded-full bg-black/10" />
              )}
              <span className="hidden sm:inline">{categoryLabel}</span>
            </span>

            {onDelete && (
              <TrashButton
                onClick={() => onDelete(item.id)}
                ariaLabel={`Delete ${item.name}`}
              />
            )}
          </div>
        </div>

        {/* Details with uniform labels */}
        <div className="grid grid-cols-1 gap-3 w-full sm:flex sm:items-start sm:gap-4">
          {/* Qty */}
          <label className="block sm:basis-0 sm:flex-1">
            <span className="block text-xs font-medium text-slate-500 mb-1">
              Qty
            </span>

            {/* center on larger screens */}
            <div className="sm:flex sm:justify-center">
              {/* outer container with theme-based focus highlight */}
              <div
                className="inline-flex sm:w-full sm:max-w-60 items-stretch rounded-full border border-black/10 bg-white overflow-hidden
                 transition focus-within:border-[hsl(var(--accent))]
                 focus-within:ring-2 focus-within:ring-[hsl(var(--accent))/0.35]"
              >
                <button
                  type="button"
                  onClick={dec}
                  className="w-10 h-10 grid place-items-center select-none hover:bg-slate-50 focus:outline-none"
                  aria-label="Decrease quantity"
                  title="Decrease"
                >
                  –
                </button>

                <input
                  type="text"
                  inputMode={isDecimal ? "decimal" : "numeric"}
                  onWheel={(e) => (e.currentTarget as HTMLInputElement).blur()}
                  className="h-10 w-20 sm:w-24 text-center outline-none px-2 border-0 focus:ring-0"
                  value={item.amount ?? ""}
                  onChange={onAmountTyped}
                  onKeyDown={onAmountKeyDown}
                  aria-label="Quantity"
                />

                <button
                  type="button"
                  onClick={inc}
                  className="w-10 h-10 grid place-items-center select-none hover:bg-slate-50 focus:outline-none"
                  aria-label="Increase quantity"
                  title="Increase"
                >
                  +
                </button>
              </div>
            </div>
          </label>

          {/* Unit */}
          <label className="block sm:basis-0 sm:flex-1">
            <span className="block text-xs font-medium text-slate-500 mb-1">
              Unit
            </span>
            <select
              className="select-fix w-full dark:border-neutral-700 dark:bg-neutral-900"
              value={item.unit ?? ""}
              onChange={(e) =>
                onChange({
                  unit: (e.target.value || undefined) as Unit | undefined,
                })
              }
              aria-label="Unit"
            >
              <option value="">Unit</option>
              {UNITS.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </label>

          {/* Category */}
          <label className="block sm:basis-0 sm:flex-1">
            <span className="block text-xs font-medium text-slate-500 mb-1">
              Category
            </span>
            <select
              className="select-fix w-full dark:border-neutral-700 dark:bg-neutral-900"
              value={categoryLabel}
              onChange={(e) =>
                onChange({ category: e.target.value as CategoryLabel })
              }
              aria-label="Category"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>
    </li>
  );
}
