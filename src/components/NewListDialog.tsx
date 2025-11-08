// src/components/NewListDialog.tsx
// Accessible modal for creating a new list by name.
// - Keyboard-friendly (ESC to close, Enter to submit)
// - Simple validation (trim, min length, max length, uniqueness hint hook-in)
// - No layout shift on buttons (fixed width via inline-flex + fixed padding)
// - Pure UI + callback: parent decides how to persist and reload
//
// Usage example from parent:
// <NewListDialog
//   isOpen={isNewOpen}
//   onClose={() => setNewOpen(false)}
//   onCreate={(name) => { createList(name); setNewOpen(false); }}
// />
//
import { useEffect, useRef, useState } from "react";

type NewListDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string) => void;
  /** Optional: provide existing names to prevent duplicates */
  existingNames?: string[];
  /** Optional: initial value for convenience */
  defaultName?: string;
};

export default function NewListDialog({
  isOpen,
  onClose,
  onCreate,
  existingNames = [],
  defaultName = "",
}: NewListDialogProps) {
  const [name, setName] = useState(defaultName);
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Autofocus when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 0);
    } else {
      // Reset on close
      setName(defaultName);
      setSubmitting(false);
    }
  }, [isOpen, defaultName]);

  // Basic synchronous validation
  const trimmed = name.trim();
  const tooShort = trimmed.length < 3;
  const tooLong = trimmed.length > 60;
  const duplicate =
    trimmed.length > 0 &&
    existingNames.map((n) => n.toLowerCase()).includes(trimmed.toLowerCase());

  const error =
    (tooShort && "Name must be at least 3 characters.") ||
    (tooLong && "Name must be 60 characters or fewer.") ||
    (duplicate && "A list with this name already exists.") ||
    "";

  function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    if (error || !trimmed) return;
    setSubmitting(true);
    // Delegate persistence to parent
    onCreate(trimmed);
    // Parent should close the dialog; we keep local guard just in case
    setSubmitting(false);
  }

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="new-list-title"
      onKeyDown={(e) => {
        if (e.key === "Escape") onClose();
      }}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Dialog card */}
      <div className="relative w-full max-w-md rounded-2xl bg-white shadow-xl ring-1 ring-black/5">
        <form onSubmit={handleSubmit} className="p-5">
          <h2 id="new-list-title" className="text-lg font-semibold">
            Create new list
          </h2>
          <p className="mt-1 text-sm text-neutral-600">
            Give your list a clear, memorable name.
          </p>

          <label htmlFor="list-name" className="mt-4 block text-sm font-medium">
            List name
          </label>
          <input
            id="list-name"
            ref={inputRef}
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-xl border border-neutral-300 px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="e.g., Weekly Groceries"
            autoComplete="off"
            minLength={3}
            maxLength={80}
          />

          {error ? (
            <p className="mt-2 text-sm text-red-600" role="alert">
              {error}
            </p>
          ) : (
            <p className="mt-2 text-xs text-neutral-500">
              Tip: you can rename lists later.
            </p>
          )}

          <div className="mt-5 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center justify-center rounded-xl border border-neutral-300 px-4 py-2 text-sm"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={!!error || submitting}
              className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              {submitting ? "Creating…" : "Create list"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}