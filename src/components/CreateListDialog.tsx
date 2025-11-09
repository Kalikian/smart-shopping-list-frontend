// Modal to create a new named list with uniqueness checks.
// - Explicit "Confirm" button (sichtbar auch im disabled State)
// - Enter submits am Desktop, enterKeyHint="done" auf Mobile
// - Validates empty + duplicate (case-insensitive)
// - Calls onCreated(snapshot) on success, onClose() on cancel

import { useEffect, useRef, useState } from "react";
import {
  createAndSelectListUnique,
  nameExists,
  type ListSnapshot,
} from "../data/listStore/index"; //  Barrel

type CreateListDialogProps = {
  open: boolean;
  onClose: () => void;
  onCreated?: (list: ListSnapshot) => void;
};

export default function CreateListDialog({
  open,
  onClose,
  onCreated,
}: CreateListDialogProps) {
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Autofocus when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 0);
      setName("");
      setError(null);
    }
  }, [open]);

  // Derived validation state
  const trimmed = name.trim();
  const isEmpty = trimmed.length === 0;
  const isDuplicate = trimmed.length > 0 && nameExists(trimmed);
  const canSubmit = !isEmpty && !isDuplicate && !submitting;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    setSubmitting(true);
    setError(null);
    try {
      const res = createAndSelectListUnique(trimmed);
      if (!res.ok && res.reason === "duplicate") {
        setError("A list with this name already exists.");
        setSubmitting(false);
        return;
      }
      if (res.ok) {
        onCreated?.(res.list);
        onClose();
      }
    } catch (e) {
      console.error(e);
      setError(
        e instanceof Error ? e.message : "Unexpected error. Please try again."
      );
      setSubmitting(false);
    }
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      role="dialog"
      aria-modal="true"
      onClick={onClose} // click outside closes
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl dark:bg-neutral-900"
        onClick={(e) => e.stopPropagation()} // prevent backdrop close
      >
        <h2 className="mb-4 text-lg font-semibold">Create a new list</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="listName"
              className="mb-1 block text-sm text-neutral-600 dark:text-neutral-300"
            >
              List name
            </label>
            <input
              id="listName"
              ref={inputRef}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`w-full mt-1 ${isDuplicate ? "input-error" : ""}`}
              placeholder="e.g., Weekly Groceries"
              enterKeyHint="done"
              inputMode="text"
              autoComplete="off"
            />
            {isDuplicate && (
              <p className="mt-1 text-sm text-red-600">
                This name is already in use.
              </p>
            )}
            {error && !isDuplicate && (
              <p className="mt-1 text-sm text-red-600">{error}</p>
            )}
          </div>

          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex min-w-24 items-center justify-center rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-4 py-2 text-sm text-[hsl(var(--text))] hover:bg-[hsl(var(--surface-2))]"
            >
              Cancel
            </button>

            <button
              type="submit"
              data-cy="confirm-btn"
              className={`inline-flex min-w-[110px] items-center justify-center rounded-xl px-4 py-2 text-sm font-medium
      ${
        canSubmit
          ? "bg-[hsl(var(--accent))] text-[hsl(var(--on-accent))] hover:bg-[hsl(var(--accent-700))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent))]/40"
          : "bg-[hsl(var(--surface-2))] text-[hsl(var(--muted))] border border-[hsl(var(--border))] opacity-60 pointer-events-none"
      }`}
            >
              {submitting ? "Creating…" : "Confirm"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
