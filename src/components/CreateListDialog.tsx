// Modal to create a new named list with uniqueness checks.
// - Explicit "Confirm" button (visible even when disabled)
// - Enter submits on desktop, enterKeyHint="done" on mobile
// - Validates empty + duplicate (case-insensitive)
// - Calls onCreated(snapshot) on success, onClose() on cancel

import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  createAndSelectListUnique,
  nameExists,
  type ListSnapshot,
} from "../data/listStore/index"; // Barrel

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
  const { t } = useTranslation("common");

  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Centralized reset
  function resetState() {
    setName("");
    setError(null);
    setSubmitting(false);
  }

  // Close with reset (backdrop + Cancel button)
  function handleCancel() {
    resetState();
    onClose();
  }

  // Autofocus + reset whenever the dialog opens
  useEffect(() => {
    if (open) {
      resetState();
      setTimeout(() => inputRef.current?.focus(), 0);
    } else {
      // Also ensure reset when closing programmatically
      setSubmitting(false);
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
        setError(
          t("createList.duplicateError", {
            defaultValue: "A list with this name already exists.",
          })
        );
        return;
      }
      if (res.ok) {
        onCreated?.(res.list);
        // Reset before closing to avoid sticky UI state when reopened
        resetState();
        onClose();
      }
    } catch (err) {
      console.error(err);
      const fallback = t("errors.unexpected", {
        defaultValue: "Unexpected error. Please try again.",
      });
      setError(err instanceof Error ? err.message || fallback : fallback);
    } finally {
      // Safety: if the parent doesn't close immediately, button recovers
      setSubmitting(false);
    }
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      role="dialog"
      aria-modal="true"
      onClick={handleCancel} // click outside closes (with reset)
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl dark:bg-neutral-900"
        onClick={(e) => e.stopPropagation()} // prevent backdrop close
      >
        <h2 className="mb-4 text-lg font-semibold">
          {t("createList.title", { defaultValue: "Create a new list" })}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="listName"
              className="mb-1 block text-sm text-neutral-600 dark:text-neutral-300"
            >
              {t("createList.nameLabel", { defaultValue: "List name" })}
            </label>
            <input
              id="listName"
              ref={inputRef}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`w-full mt-1 ${isDuplicate ? "input-error" : ""}`}
              placeholder={t("createList.placeholder", {
                defaultValue: "e.g., Weekly Groceries",
              })}
              enterKeyHint="done"
              inputMode="text"
              autoComplete="off"
            />
            {isDuplicate && (
              <p className="mt-1 text-sm text-red-600">
                {t("createList.duplicateInline", {
                  defaultValue: "This name is already in use.",
                })}
              </p>
            )}
            {error && !isDuplicate && (
              <p className="mt-1 text-sm text-red-600">{error}</p>
            )}
          </div>

          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={handleCancel}
              className="inline-flex min-w-24 items-center justify-center rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-4 py-2 text-sm text-[hsl(var(--text))] hover:bg-[hsl(var(--surface-2))]"
            >
              {t("buttons.cancel", { defaultValue: "Cancel" })}
            </button>

            <button
              type="submit"
              data-cy="confirm-btn"
              disabled={!canSubmit}
              className={`inline-flex min-w-[110px] items-center justify-center rounded-xl px-4 py-2 text-sm font-medium
              ${
                canSubmit
                  ? "bg-[hsl(var(--accent))] text-[hsl(var(--on-accent))] hover:bg-[hsl(var(--accent-700))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent))]/40"
                  : "bg-[hsl(var(--surface-2))] text-[hsl(var(--muted))] border border-[hsl(var(--border))] opacity-60"
              }`}
            >
              {submitting
                ? t("createList.creating", {
                    defaultValue: "Creating…",
                  })
                : t("buttons.confirm", { defaultValue: "Confirm" })}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
