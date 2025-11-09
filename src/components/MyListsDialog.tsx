import { useEffect, useMemo, useRef, useState } from "react";
import {
  getAllLists,
  selectList,
  deleteListById,
  loadSnapshot,
  type ListMeta,
  type ListSnapshot,
} from "../data/listStore";
import TrashButton from "./ui/TrashButton";

type MyListsDialogProps = {
  open: boolean;
  onClose: () => void;
  onSelected?: (list: ListSnapshot) => void;
  onDeletedCurrent?: () => void; // fire when the currently selected list gets deleted
};

export default function MyListsDialog({
  open,
  onClose,
  onSelected,
  onDeletedCurrent,
}: MyListsDialogProps) {
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<ListMeta[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const current = loadSnapshot();

  useEffect(() => {
    if (!open) return;
    reload();
  }, [open]);

  function reload() {
    setQuery("");
    setError(null);
    setLoading(true);
    try {
      const all = getAllLists();
      setItems(all);
    } catch (e) {
      console.error(e);
      setError("Failed to load lists.");
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((m) => m.name.toLowerCase().includes(q));
  }, [items, query]);

  function handleSelect(id: string) {
    try {
      const snap = selectList(id);
      if (snap) {
        onSelected?.(snap);
        onClose();
      } else {
        setError("List not found. It may have been removed.");
      }
    } catch (e) {
      console.error(e);
      setError("Unexpected error. Please try again.");
    }
  }

  function requestDelete(id: string) {
    setConfirmId(id);
  }
  function cancelDelete() {
    setConfirmId(null);
  }
  function confirmDelete() {
    if (!confirmId) return;
    const id = confirmId;
    try {
      deleteListById(id);
      if (current?.id === id) onDeletedCurrent?.();
      setConfirmId(null);
      reload();
    } catch (e) {
      console.error(e);
      setError("Failed to delete list.");
      setConfirmId(null);
    }
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
          <h2 className="text-lg font-semibold">My Lists</h2>
          <button
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-sm text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
            aria-label="Close dialog"
          >
            ✕
          </button>
        </div>

        <div className="mb-4">
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name…"
            className="w-full"
            enterKeyHint="search"
            autoComplete="off"
          />
        </div>

        {loading && <p className="text-sm text-neutral-500">Loading…</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}

        {!loading && !error && (
          <>
            {filtered.length === 0 ? (
              <p className="text-sm text-neutral-500">No lists found.</p>
            ) : (
              <ul className="max-h-80 space-y-2 overflow-y-auto">
                {filtered.map((m) => {
                  const isConfirming = confirmId === m.id;
                  const isCurrent = current?.id === m.id;
                  return (
                    <li
                      key={m.id}
                      className="rounded-xl border border-neutral-200 p-2 dark:border-neutral-800"
                    >
                      <div className="flex items-center justify-between gap-3">
                        {/* Select target (name + updated) */}
                        <button
                          className="flex min-w-0 grow flex-col text-left hover:opacity-90"
                          onClick={() => handleSelect(m.id)}
                          title={
                            isCurrent
                              ? "Currently selected"
                              : "Select this list"
                          }
                        >
                          <span className="truncate font-medium">
                            {m.name}{" "}
                            {isCurrent && (
                              <span className="text-xs text-[hsl(var(--accent))]">
                                (current)
                              </span>
                            )}
                          </span>
                          <span className="text-xs text-neutral-500">
                            Updated {new Date(m.updatedAt).toLocaleString()}
                          </span>
                        </button>

                        {/* Red trash-bin; inline confirm shows only Cancel | Delete */}
                        {!isConfirming ? (
                          <TrashButton
                            onClick={() => requestDelete(m.id)}
                            ariaLabel={`Delete list ${m.name}`}
                            // optional: Platz anpassen
                            className=""
                          />
                        ) : (
                          <div className="flex items-center gap-2">
                            <button
                              className="rounded-lg border border-neutral-300 px-2 py-1 text-xs hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-800"
                              onClick={cancelDelete}
                            >
                              Cancel
                            </button>
                            <button
                              className="rounded-lg bg-red-600 px-2 py-1 text-xs font-semibold text-white hover:bg-red-700"
                              onClick={confirmDelete}
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </li>
                  );
                })}
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
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
