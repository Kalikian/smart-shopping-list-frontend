// src/components/AddItemSheet.tsx
import { useEffect, useRef, useState } from "react";
import type { Item } from "./ListItem";
import { CATEGORIES, UNITS, type CategoryLabel } from "../constants/categories";

// derive Unit type from your UNITS const
type Unit = (typeof UNITS)[number];

// Draft without id (id erzeugt der Parent)
type ItemDraft = Omit<Item, "id">;

type AddItemSheetProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (draft: ItemDraft) => void;
};

export default function AddItemSheet({ open, onClose, onSubmit }: AddItemSheetProps) {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState<number>(1);
  const [unit, setUnit] = useState<Unit>(UNITS[0]);                 // e.g. "pcs"
  const [category, setCategory] = useState<CategoryLabel>(CATEGORIES[0]); // e.g. "Default"
  const [saving, setSaving] = useState(false);
  const nameRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (open) {
      setSaving(false);
      setName("");
      setAmount(1);
      setUnit(UNITS[0]);
      setCategory(CATEGORIES[0]);
      setTimeout(() => nameRef.current?.focus(), 10);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const canSave = name.trim().length > 0 && amount > 0 && !saving;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSave) return;
    setSaving(true);
    const draft: ItemDraft = {
      name: name.trim(),
      amount,
      unit,
      category,
      done: false,
    };
    onSubmit(draft);
    setSaving(false);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-labelledby="add-item-title">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div
        className="
          absolute inset-x-0 bottom-0 rounded-t-3xl bg-white shadow-lg border-t border-[hsl(var(--border))]
          px-4 pt-4 pb-6
          md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2
          md:rounded-2xl md:max-w-md md:w-full md:p-6
        "
      >
        <div className="flex items-center justify-between">
          <h3 id="add-item-title" className="text-lg font-semibold text-[hsl(var(--text))]">Add item</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))]"
            aria-label="Close"
            title="Close"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-600">Name</label>
            <input
              ref={nameRef}
              type="text"
              className="mt-1 w-full rounded-xl border border-[hsl(var(--border))] bg-white px-3 py-2 text-[hsl(var(--text))] outline-none focus:ring-2 focus:ring-[hsl(var(--accent))]"
              placeholder="e.g., Bananas"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-600">Amount</label>
              <input
                type="number"
                min={0}
                step="any"
                className="mt-1 w-full rounded-xl border border-[hsl(var(--border))] bg-white px-3 py-2 text-[hsl(var(--text))] outline-none focus:ring-2 focus:ring-[hsl(var(--accent))]"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600">Unit</label>
              <select
                className="mt-1 w-full rounded-xl border border-[hsl(var(--border))] bg-white px-3 py-2 text-[hsl(var(--text))] outline-none focus:ring-2 focus:ring-[hsl(var(--accent))]"
                value={unit}
                onChange={(e) => setUnit(e.target.value as Unit)}
              >
                {UNITS.map((u) => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-600">Category</label>
            <select
              className="mt-1 w-full rounded-xl border border-[hsl(var(--border))] bg-white px-3 py-2 text-[hsl(var(--text))] outline-none focus:ring-2 focus:ring-[hsl(var(--accent))]"
              value={category}
              onChange={(e) => setCategory(e.target.value as CategoryLabel)}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-2xl border border-[hsl(var(--border))] bg-white px-4 py-3 font-semibold text-[hsl(var(--text))] hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!canSave}
              className="flex-1 rounded-2xl bg-[hsl(var(--accent))] text-[hsl(var(--on-accent))] font-semibold px-4 py-3 hover:brightness-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {saving ? "Saving…" : "Add item"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}