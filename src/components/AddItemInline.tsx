// src/components/AddItemInline.tsx
// Inline "Add Item" composer that lives inside the list (no modal).
// - Name is required; amount/unit/category have defaults.
// - No duplicate 'Default' entries: selects are initialized to defaults.
// - Dynamic amount precision: integer for some units (e.g., pcs, pack, g, mL),
//   decimal for others (e.g., kg, L).
// - Emits a normalized payload via onSubmit; parent persists the item.
//
// Usage:
//   <AddItemInline onSubmit={(draft) => addItem(draft)} />

import { useEffect, useRef, useState } from "react";
import {
  CATEGORIES,
  CATEGORY_DEFAULT,
  UNITS,
  type CategoryLabel,
  type Unit,
} from "../constants/categories";

export type AddItemInlineSubmit = {
  name: string;
  amount: number;          // default 1, >= 1
  unit: Unit;              // default UNITS[0]
  category: CategoryLabel; // default CATEGORY_DEFAULT
};

type Props = {
  onSubmit: (data: AddItemInlineSubmit) => void;
  title?: string;
};

// Define which units should be integers vs. decimals.
// Keep this simple and local; can be moved to constants later if needed.
const INTEGER_UNITS = new Set<Unit>(["pcs", "pack", "g", "mL"]);
const DECIMAL_UNITS = new Set<Unit>(["kg", "L"]);

// Helper: derive numeric input attributes by unit
function amountAttributesFor(unit: Unit) {
  // For integers, step=1 and inputMode numeric; for decimals, step=0.1
  if (INTEGER_UNITS.has(unit)) {
    return { step: 1, inputMode: "numeric" as const, pattern: "[0-9]*" };
  }
  if (DECIMAL_UNITS.has(unit)) {
    return { step: 0.1, inputMode: "decimal" as const, pattern: undefined as string | undefined };
  }
  // Fallback: allow integers
  return { step: 1, inputMode: "numeric" as const, pattern: "[0-9]*" };
}

export default function AddItemInline({ onSubmit, title = "Add item" }: Props) {
  // --- UI: collapsed vs expanded ---
  const [open, setOpen] = useState(false);

  // --- Form state (controlled) ---
  const [name, setName] = useState("");
  const [amountStr, setAmountStr] = useState<string>("1");   // keep as string for better UX
  const [unit, setUnit] = useState<Unit>(UNITS[0]);          // initialize to default (no placeholder)
  const [category, setCategory] = useState<CategoryLabel>(CATEGORY_DEFAULT);

  const nameRef = useRef<HTMLInputElement>(null);

  // Focus name when expanding
  useEffect(() => {
    if (!open) return;
    const id = window.setTimeout(() => nameRef.current?.focus(), 0);
    return () => window.clearTimeout(id);
  }, [open]);

  // Derived flags + attributes
  const canSubmit = name.trim().length > 0;
  const amountAttrs = amountAttributesFor(unit);

  // Normalize + submit
  const handleSubmit = () => {
    if (!canSubmit) return;

    const trimmed = name.trim();

    // Parse amount according to expected precision
    const raw = amountStr.trim();
    let parsed = DECIMAL_UNITS.has(unit) ? Number.parseFloat(raw || "1") : Number.parseInt(raw || "1", 10);
    if (!Number.isFinite(parsed) || parsed <= 0) parsed = 1;

    // For integer units, coerce to integer
    if (INTEGER_UNITS.has(unit)) {
      parsed = Math.max(1, Math.trunc(parsed));
    } else {
      // For decimal units, round to one decimal place for cleanliness
      parsed = Math.max(1, Math.round(parsed * 10) / 10);
    }

    onSubmit({
      name: trimmed,
      amount: parsed,
      unit,
      category,
    });

    // Reset to defaults (keep open for rapid entry)
    setName("");
    setAmountStr("1");
    setUnit(UNITS[0]);
    setCategory(CATEGORY_DEFAULT);
    nameRef.current?.focus();
  };

  // Keyboard: Enter submits when valid
  const onKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (e) => {
    if (e.key === "Enter" && canSubmit) {
      e.preventDefault();
      handleSubmit();
    }
  };

  if (!open) {
    // Collapsed pill
    return (
      <div className="px-4 pt-3 pb-2">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="rounded-xl px-3 py-2 text-sm font-semibold bg-[hsl(var(--accent))] text-[hsl(var(--on-accent))] hover:brightness-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))]"
          aria-label="Add item"
          title={title}
        >
          + {title}
        </button>
      </div>
    );
  }

  // Expanded inline card
  return (
    <div
      className="mx-4 mt-3 mb-2 rounded-2xl border border-[hsl(var(--border))] bg-white shadow-sm p-3"
      onKeyDown={onKeyDown}
    >
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-semibold">{title}</h4>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-lg px-2 py-1 text-sm text-[hsl(var(--muted))] hover:bg-slate-50"
          aria-label="Close"
          title="Close"
        >
          ×
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        {/* Name (required) */}
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-slate-600">Name *</label>
          <input
            ref={nameRef}
            type="text"
            placeholder="e.g., Bananas"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-xl border border-[hsl(var(--border))] px-3 py-2 outline-none focus:ring-2 focus:ring-[hsl(var(--accent))]"
          />
        </div>

        {/* Amount (dynamic precision) */}
        <div>
          <label className="block text-xs font-medium text-slate-600">Amount</label>
          <input
            type="number"
            min={1}
            step={amountAttrs.step}
            inputMode={amountAttrs.inputMode}
            {...(amountAttrs.pattern ? { pattern: amountAttrs.pattern } : {})}
            placeholder={INTEGER_UNITS.has(unit) ? "1" : "1.0"}
            value={amountStr}
            onChange={(e) => setAmountStr(e.target.value)}
            className="mt-1 w-full rounded-xl border border-[hsl(var(--border))] px-3 py-2 outline-none focus:ring-2 focus:ring-[hsl(var(--accent))]"
          />
        </div>

        {/* Unit */}
        <div>
          <label className="block text-xs font-medium text-slate-600">Unit</label>
          <select
            value={unit}
            onChange={(e) => setUnit(e.target.value as Unit)}
            className="mt-1 w-full rounded-xl border border-[hsl(var(--border))] px-3 py-2 bg-white outline-none focus:ring-2 focus:ring-[hsl(var(--accent))]"
          >
            {UNITS.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>
        </div>

        {/* Category */}
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-slate-600">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as CategoryLabel)}
            className="mt-1 w-full rounded-xl border border-[hsl(var(--border))] px-3 py-2 bg-white outline-none focus:ring-2 focus:ring-[hsl(var(--accent))]"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Actions */}
        <div className="sm:col-span-2 flex items-end gap-2">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="flex-1 rounded-xl bg-[hsl(var(--accent))] text-[hsl(var(--on-accent))] px-4 py-2 font-semibold hover:brightness-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            Add
          </button>
          <button
            type="button"
            onClick={() => {
              setName("");
              setAmountStr("1");
              setUnit(UNITS[0]);
              setCategory(CATEGORY_DEFAULT);
              nameRef.current?.focus();
            }}
            className="rounded-xl border border-[hsl(var(--border))] bg-white px-4 py-2 font-semibold hover:bg-slate-50"
          >
            Reset
          </button>
        </div>
      </div>

      <p className="mt-2 text-xs text-[hsl(var(--muted))]">
        Press <kbd>Enter</kbd> to add quickly. Amount defaults to 1 ({INTEGER_UNITS.has(unit) ? "integer" : "decimal"} mode).
      </p>
    </div>
  );
}