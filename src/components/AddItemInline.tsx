// src/components/AddItemInline.tsx
// Inline composer for adding or editing an item with keyboard-first UX.

import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  CATEGORIES,
  CATEGORY_DEFAULT,
  UNITS,
  type CategoryLabel,
  type Unit,
} from "../constants/categories";
import {
  INTEGER_UNITS,
  getAmountInputAttributes,
  normalizeAmount,
} from "../data/listStore/itemAmount";

export type AddItemInlineSubmit = {
  name: string;
  amount: number; // default 1, >= 1
  unit: Unit; // default UNITS[0]
  category: CategoryLabel; // default CATEGORY_DEFAULT
};

export type AddItemInlineProps = {
  onSubmit: (payload: AddItemInlineSubmit) => void;
  /** Optional: cancel handler (visible Cancel button + different close behavior) */
  onCancel?: () => void;
  /** Optional: initial field values (edit use case) */
  initial?: Partial<AddItemInlineSubmit>;
  /** Optional: render in expanded state initially (for inline edit) */
  forceOpen?: boolean;
  /** Optional: UI title (e.g., "Edit item") – overrides i18n default */
  title?: string;
  /** Optional: name input id (for focus control via FAB) */
  inputId?: string;
};

/** Global event name listened by the inline composer and fired by the FAB */
export const ADD_EVENT = "app:add-item";

export default function AddItemInline({
  onSubmit,
  onCancel,
  initial,
  forceOpen = false,
  title,
  inputId,
}: AddItemInlineProps) {
  const { t } = useTranslation("common");
  const [open, setOpen] = useState<boolean>(forceOpen || Boolean(initial));

  // Effective title: use prop if provided, otherwise i18n default
  const effectiveTitle =
    title ??
    t("dialogs.addItemTitle", {
      defaultValue: "Add item",
    });

  // Detect edit mode by presence of initial/onCancel
  const isEdit = Boolean(initial || onCancel);

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

  // Re-seed form when `initial` changes (e.g., editing another entry)
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

  // Listen to FAB event only in "add" mode (edit mode is controlled locally)
  useEffect(() => {
    if (isEdit) return; // no FAB integration in edit flow
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
  const amountAttrs = getAmountInputAttributes(unit);

  // Normalize and submit
  const handleSubmit = () => {
    if (!canSubmit) return;

    const trimmed = name.trim();
    const normalizedAmount = normalizeAmount(amountStr, unit);

    onSubmit({
      name: trimmed,
      amount: normalizedAmount,
      unit,
      category,
    });

    if (isEdit && onCancel) {
      // In edit flow, close inline editor after save
      onCancel();
      return;
    }

    // Add flow: reset for the next input
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
    // Collapsed pill (only useful in add flow)
    return (
      <div className="px-4 pt-3 pb-2">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="rounded-xl px-3 py-2 text-sm font-semibold bg-[hsl(var(--accent))] text-[hsl(var(--on-accent))] hover:brightness-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))]"
          aria-label={t("buttons.addItem", { defaultValue: "Add item" })}
          title={effectiveTitle}
        >
          + {effectiveTitle}
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
      <div className="mb-2 flex items-center justify-between">
        <h4 className="text-sm font-semibold">
          {isEdit
            ? t("dialogs.editItemTitle", {
                defaultValue: "Edit item",
              })
            : effectiveTitle}
        </h4>
        {/* Close in add flow = collapse; in edit flow = cancel */}
        <button
          type="button"
          onClick={() => (isEdit && onCancel ? onCancel() : setOpen(false))}
          className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[hsl(var(--border))] bg-white/80 text-sm text-[hsl(var(--muted))] hover:bg-slate-100 hover:text-[hsl(var(--text))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))]"
          aria-label={t("dialogs.close", { defaultValue: "Close dialog" })}
          title={t("dialogs.close", { defaultValue: "Close" })}
        >
          <span aria-hidden className="text-red-500 font-bold">
            ✕
          </span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
        {/* Name (required) */}
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-slate-600">
            {t("item.nameLabel", { defaultValue: "Item" })} *
          </label>
          <input
            id={inputId ?? "add-item-name"}
            ref={nameRef}
            type="text"
            placeholder={t("item.placeholderExample", {
              defaultValue: "e.g., Bananas",
            })}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-xl border border-[hsl(var(--border))] px-3 py-2 outline-none focus:ring-2 focus:ring-[hsl(var(--accent))]"
          />
        </div>

        {/* Amount */}
        <div>
          <label className="block text-xs font-medium text-slate-600">
            {t("item.amountLabel", { defaultValue: "Amount" })}
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
            {t("item.unitLabel", { defaultValue: "Unit" })}
          </label>
          <select
            value={unit}
            onChange={(e) => setUnit(e.target.value as Unit)}
            className="mt-1 w-full rounded-xl border border-[hsl(var(--border))] bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-[hsl(var(--accent))]"
          >
            {UNITS.map((u) => (
              <option key={u} value={u}>
                {t(`units.${u}`, { defaultValue: u })}
              </option>
            ))}
          </select>
        </div>

        {/* Category */}
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-slate-600">
            {t("item.categoryLabel", { defaultValue: "Category" })}
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as CategoryLabel)}
            className="mt-1 w-full rounded-xl border border-[hsl(var(--border))] bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-[hsl(var(--accent))]"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {t(`categories.${c}`, { defaultValue: c })}
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
            className="flex-1 rounded-xl bg-[hsl(var(--accent))] px-4 py-2 font-semibold text-[hsl(var(--on-accent))] hover:brightness-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isEdit
              ? t("buttons.save", { defaultValue: "Save" })
              : t("buttons.addItem", { defaultValue: "Add item" })}
          </button>

          {/* Reset is only meaningful in add flow */}
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
              {t("buttons.reset", { defaultValue: "Reset" })}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
