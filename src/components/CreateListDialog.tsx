// Modal to create a new named list with uniqueness checks.
// - Does NOT create anything until the user confirms
// - Validates empty names and duplicates (case-insensitive)
// - Calls onCreated(snapshot) on success, onClose() on cancel
//
// Styling assumes Tailwind; tweak classes to match your tokens/theme.

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

export default function CreateListDialog({ open, onClose, onCreated }: CreateListDialogProps) {
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
       setError(e instanceof Error ? e.message : "Unexpected error. Please try again.");
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
            <label htmlFor="listName" className="mb-1 block text-sm text-neutral-600 dark:text-neutral-300">
              List name
            </label>
            <input
              id="listName"
              ref={inputRef}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`w-full rounded-xl border px-3 py-2 outline-none
                ${isDuplicate ? "border-red-500" : "border-neutral-300 dark:border-neutral-700"}
                focus:ring-2 focus:ring-accent-500`}
              placeholder="e.g., Weekly Groceries"
            />
            {isDuplicate && (
              <p className="mt-1 text-sm text-red-600">This name is already in use.</p>
            )}
            {error && !isDuplicate && (
              <p className="mt-1 text-sm text-red-600">{error}</p>
            )}
          </div>

          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-neutral-300 px-4 py-2 text-sm hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!canSubmit}
              className={`rounded-xl px-4 py-2 text-sm text-white
                ${canSubmit ? "bg-accent-600 hover:bg-accent-700" : "bg-accent-300 cursor-not-allowed"}`}
            >
              {submitting ? "Creating..." : "Create list"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}