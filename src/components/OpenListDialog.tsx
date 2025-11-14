// src/components/OpenListDialog.tsx
// Dialog to open an existing list.
// - Loads all ListMeta via getAllLists() when opened
// - Filter-as-you-type (case-insensitive)
// - Selects list via selectList(id) and returns the snapshot to parent via onSelected
// - Supports hard delete of a list (doc + index + current pointer repair)
// - No side effects outside of explicit selection
//
// Tailwind-based styling; adjust tokens as needed.

import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  getAllLists,
  selectList,
  type ListMeta,
  type ListSnapshot,
} from "../data/listStore";
// Storage-level helpers for hard delete + index refresh
import { removeListById, readIndex } from "../data/listStore/storage";

type OpenListDialogProps = {
  open: boolean;
  onClose: () => void;
  onSelected?: (list: ListSnapshot) => void;
};

export default function OpenListDialog({
  open,
  onClose,
  onSelected,
}: OpenListDialogProps) {
  const { t } = useTranslation("common");

  const [query, setQuery] = useState("");
  const [items, setItems] = useState<ListMeta[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load lists when dialog opens
  useEffect(() => {
    if (!open) return;
    setQuery("");
    setError(null);
    setLoading(true);
    try {
      const all = getAllLists();
      setItems(all);
    } catch (e) {
      console.error(e);
      setError(
        t("lists.loadError", {
          defaultValue: "Failed to load lists.",
        })
      );
    } finally {
      setLoading(false);
      // autofocus after paint
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open, t]);

  // Filtered view
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((m) => m.name.toLowerCase().includes(q));
  }, [items, query]);

  async function handleChoose(id: string) {
    try {
      const snap = selectList(id);
      if (snap) {
        onSelected?.(snap);
        onClose();
      } else {
        setError(
          t("lists.notFound", {
            defaultValue: "List not found. It may have been removed.",
          })
        );
      }
    } catch (e) {
      console.error(e);
      setError(
        t("errors.unexpected", {
          defaultValue: "Unexpected error. Please try again.",
        })
      );
    }
  }

  // Hard delete handler (Local Storage + UI index refresh)
  function handleDelete(id: string) {
    // Simple safety check; replace with a custom modal if desired.
    const ok = window.confirm(
      t("lists.deleteConfirm", {
        defaultValue: "Delete this list permanently?",
      })
    );
    if (!ok) return;

    try {
      removeListById(id); // Purge LS (doc + index + current repair)
      const next = readIndex(); // Read fresh index for UI
      setItems(next);
      // If the user had a filter query that now hides everything, keep it;
      // the UX will simply show "No lists found."
    } catch (e) {
      console.error(e);
      setError(
        t("lists.deleteError", {
          defaultValue: "Failed to delete list. Please try again.",
        })
      );
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLUListElement>) {
    // Basic keyboard UX: Enter activates focused button via default behavior.
    // List items use <button>, so Enter/Space are handled by the element itself.
    if (e.key === "Escape") onClose();
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-xl dark:bg-neutral-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            {t("openList.title", {
              defaultValue: "Open existing list",
            })}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-sm text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
            aria-label={t("dialogs.close", {
              defaultValue: "Close dialog",
            })}
          >
            ✕
          </button>
        </div>

        <div className="mb-4">
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("lists.searchPlaceholder", {
              defaultValue: "Search by name…",
            })}
            className="w-full rounded-xl border border-neutral-300 px-3 py-2 outline-none focus:ring-2 focus:ring-accent-500 dark:border-neutral-700"
          />
        </div>

        {loading && (
          <p className="text-sm text-neutral-500">
            {t("lists.loading", { defaultValue: "Loading…" })}
          </p>
        )}
        {error && <p className="text-sm text-red-600">{error}</p>}

        {!loading && !error && (
          <>
            {filtered.length === 0 ? (
              <p className="text-sm text-neutral-500">
                {t("lists.empty", { defaultValue: "No lists found." })}
              </p>
            ) : (
              <ul
                className="max-h-80 space-y-2 overflow-y-auto"
                onKeyDown={onKeyDown}
                role="listbox"
                aria-label={t("lists.availableAria", {
                  defaultValue: "Available lists",
                })}
              >
                {filtered.map((m) => (
                  <li
                    key={m.id}
                    className="rounded-xl border border-neutral-200 dark:border-neutral-800"
                  >
                    <div className="flex w-full items-center justify-between rounded-xl px-3 py-2">
                      {/* Select = click left area */}
                      <button
                        className="flex flex-1 items-center justify-between text-left hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded-lg px-2 py-1"
                        onClick={() => handleChoose(m.id)}
                        aria-label={t("lists.openListLabel", {
                          name: m.name,
                          defaultValue: `Open list ${m.name}`,
                        })}
                      >
                        <span className="font-medium">{m.name}</span>
                        <span className="text-xs text-neutral-500">
                          {t("lists.updatedAt", {
                            value: new Date(m.updatedAt).toLocaleString(),
                            defaultValue: "Updated {{value}}",
                          })}
                        </span>
                      </button>

                      {/* Delete button (does not trigger select) */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation(); // prevent select
                          handleDelete(m.id);
                        }}
                        className="ml-2 rounded-lg p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                        aria-label={t("lists.deleteListLabel", {
                          name: m.name,
                          defaultValue: `Delete list ${m.name}`,
                        })}
                        title={t("lists.deleteTitle", {
                          defaultValue: "Delete list",
                        })}
                      >
                        🗑
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}

        <div className="mt-5 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-neutral-300 px-4 py-2 text-sm hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-800"
          >
            {t("buttons.cancel", { defaultValue: "Cancel" })}
          </button>
        </div>
      </div>
    </div>
  );
}
