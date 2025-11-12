// src/components/AddItemInline.tsx
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
  amount: number; // default 1, >= 1
  unit: Unit; // default UNITS[0]
  category: CategoryLabel; // default CATEGORY_DEFAULT
};

export type AddItemInlineProps = {
  onSubmit: (payload: AddItemInlineSubmit) => void;
  /** Optional: Cancel-Handler (sichtbarer Cancel-Button + anderes Verhalten) */
  onCancel?: () => void;
  /** Optional: Vorbelegung der Felder (Edit-Usecase) */
  initial?: Partial<AddItemInlineSubmit>;
  /** Optional: sofort geöffnet rendern (für Inline-Edit) */
  forceOpen?: boolean;
  /** Optional: UI-Titel (z.B. "Edit item") */
  title?: string;
  /** Optional: Name-Input-ID (Fokussteuerung via FAB) */
  inputId?: string;
};

const INTEGER_UNITS = new Set<Unit>(["pcs", "pack", "g", "mL"]);
const DECIMAL_UNITS = new Set<Unit>(["kg", "L"]);

function amountAttributesFor(unit: Unit) {
  if (INTEGER_UNITS.has(unit)) {
    return { step: 1, inputMode: "numeric" as const, pattern: "[0-9]*" };
  }
  if (DECIMAL_UNITS.has(unit)) {
    return {
      step: 0.1,
      inputMode: "decimal" as const,
      pattern: undefined as string | undefined,
    };
  }
  return { step: 1, inputMode: "numeric" as const, pattern: "[0-9]*" };
}

/** Global event name listened by the inline composer and fired by the FAB */
export const ADD_EVENT = "app:add-item";

export default function AddItemInline({
  onSubmit,
  onCancel,
  initial,
  forceOpen = false,
  title = "Add item",
  inputId,
}: AddItemInlineProps) {
  // Detect edit mode by presence of initial/onCancel
  const isEdit = Boolean(initial || onCancel);

  // Open state: open if forced or when initial is provided
  const [open, setOpen] = useState<boolean>(forceOpen || Boolean(initial));

  // Form state (seeded from `initial` or defaults)
  const [name, setName] = useState<string>(initial?.name ?? "");
  const [amountStr, setAmountStr] = useState<string>(
    String(initial?.amount ?? 1)
  );
  const [unit, setUnit] = useState<Unit>(initial?.unit ?? UNITS[0]);
  const [category, setCategory] = useState<CategoryLabel>(
    initial?.category ?? CATEGORY_DEFAULT
  );

  const nameRef = useRef<HTMLInputElement>(null);

  // Re-seed when `initial` changes (e.g., edit anderer Eintrag)
  useEffect(() => {
    if (!initial) return;
    setName(initial.name ?? "");
    setAmountStr(String(initial.amount ?? 1));
    setUnit(initial.unit ?? UNITS[0]);
    setCategory(initial.category ?? CATEGORY_DEFAULT);
    setOpen(true);
  }, [initial]);

  // Focus name when expanding
  useEffect(() => {
    if (!open) return;
    const id = window.setTimeout(() => nameRef.current?.focus(), 0);
    return () => window.clearTimeout(id);
  }, [open]);

  // Listen to FAB event nur im "Add"-Modus (bei Edit steuern wir lokal)
  useEffect(() => {
    if (isEdit) return; // kein FAB in Edit-Flow
    const handler = () => {
      if (open) {
        nameRef.current?.focus();
        return;
      }
      setOpen(true);
      setTimeout(() => nameRef.current?.focus(), 0);
    };
    window.addEventListener(ADD_EVENT, handler as EventListener);
    return () =>
      window.removeEventListener(ADD_EVENT, handler as EventListener);
  }, [open, isEdit]);

  const canSubmit = name.trim().length > 0;
  const amountAttrs = amountAttributesFor(unit);

  // Normalize and submit
  const handleSubmit = () => {
    if (!canSubmit) return;

    const trimmed = name.trim();
    const raw = amountStr.trim();

    let parsed = DECIMAL_UNITS.has(unit)
      ? Number.parseFloat(raw || "1")
      : Number.parseInt(raw || "1", 10);

    if (!Number.isFinite(parsed) || parsed <= 0) parsed = 1;

    if (INTEGER_UNITS.has(unit)) {
      parsed = Math.max(1, Math.trunc(parsed));
    } else {
      parsed = Math.max(1, Math.round(parsed * 10) / 10);
    }

    onSubmit({
      name: trimmed,
      amount: parsed,
      unit,
      category,
    });

    if (isEdit && onCancel) {
      // In Edit-Flow schließt der Inline-Editor nach Save
      onCancel();
      return;
    }

    // Add-Flow: Reset für nächste Eingabe
    setName("");
    setAmountStr("1");
    setUnit(UNITS[0]);
    setCategory(CATEGORY_DEFAULT);
    nameRef.current?.focus();
  };

  // Submit on Enter anywhere inside the card
  const onKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (e) => {
    if (e.key === "Enter" && canSubmit) {
      e.preventDefault();
      handleSubmit();
    }
  };

  if (!open) {
    // Collapsed pill (nur im Add-Flow sinnvoll)
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
        <h4 className="text-sm font-semibold">
          {isEdit ? "Edit item" : title}
        </h4>
        {/* Close in Add-Flow = collapse; in Edit-Flow = Cancel */}
        <button
          type="button"
          onClick={() => (isEdit && onCancel ? onCancel() : setOpen(false))}
          className="rounded-lg px-2 py-1 text-sm text-[hsl(var(--muted))] hover:bg-slate-50"
          aria-label={isEdit ? "Cancel" : "Close"}
          title={isEdit ? "Cancel" : "Close"}
        >
          ×
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        {/* Name (required) */}
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-slate-600">
            Name *
          </label>
          <input
            id={inputId ?? "add-item-name"}
            ref={nameRef}
            type="text"
            placeholder="e.g., Bananas"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-xl border border-[hsl(var(--border))] px-3 py-2 outline-none focus:ring-2 focus:ring-[hsl(var(--accent))]"
          />
        </div>

        {/* Amount */}
        <div>
          <label className="block text-xs font-medium text-slate-600">
            Amount
          </label>
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
          <label className="block text-xs font-medium text-slate-600">
            Unit
          </label>
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
          <label className="block text-xs font-medium text-slate-600">
            Category
          </label>
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
            {isEdit ? "Save" : "Add"}
          </button>

          {/* Reset nur sinnvoll im Add-Flow */}
          {!isEdit && (
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
          )}
        </div>
      </div>
    </div>
  );
}
