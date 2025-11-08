// src/App.tsx
// Parent wiring for named lists (offline-first) + minimal picker UI.
// - Integrates NewListDialog (create & select lists)
// - Loads current snapshot at boot, keeps legacy flows intact
// - Adds online-event listener to flush pending ops to backend (stub sender)
// - All comments in English, per project convention

import { useEffect, useMemo, useState } from "react";
import NewListDialog from "./components/NewListDialog";
import {
  // legacy-compatible snapshot helpers
  loadSnapshot,
  // new multi-list helpers
  getAllLists,
  selectList,
  createAndSelectList,
  // sync
  flushPendingOps,
} from "./data/listStore";

// Types local to this file to avoid leaking broader app details
type ListMeta = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
};

type ListSnapshot = {
  id: string;
  name?: string;
  createdAt: string;
  updatedAt?: string;
  items: Array<{
    id: string;
    title: string;
    qty: number;
    unit?: string;
    category?: string;
    done?: boolean;
  }>;
};

export default function App() {
  // Current list snapshot used across the app
  const [snap, setSnap] = useState<ListSnapshot | null>(null);
  // Lists index to populate the picker
  const [lists, setLists] = useState<ListMeta[]>([]);
  // UI: new-list dialog
  const [isNewOpen, setNewOpen] = useState(false);

  // Derived: current list name
  const currentName = useMemo(() => snap?.name ?? "My list", [snap]);

  // --- Boot: load current list + index
  useEffect(() => {
    // Load snapshot (migrates legacy storage inside listStore if needed)
    setSnap(loadSnapshot());
    // Load index
    setLists(getAllLists());
  }, []);

  // --- Sync: flush pending ops on start and when the app comes online
  useEffect(() => {
    // Replace this with a real API call later
    const sender = async (_op: unknown) => {
      // TODO: implement POST to your backend (idempotent upsert by listId)
      // Intentionally empty for now (acts as successful no-op)
      return;
    };

    const tryFlush = () => {
      // Fire-and-forget; errors are surfaced via unhandled rejections in dev
      void flushPendingOps(sender);
    };

    // Try once at startup if online
    if (typeof navigator === "undefined" || navigator.onLine) {
      tryFlush();
    }

    // Register online listener
    const onOnline = () => tryFlush();
    window.addEventListener("online", onOnline);
    return () => window.removeEventListener("online", onOnline);
  }, []);

  // --- Handlers ---
  const handleCreate = (name: string) => {
    const created = createAndSelectList(name);
    setSnap(created);
    setLists(getAllLists());
    setNewOpen(false);
  };

  const handleSelect = (id: string) => {
    const selected = selectList(id);
    if (selected) {
      setSnap(selected);
    }
    // Keep index fresh (updatedAt might change on selection/rename later)
    setLists(getAllLists());
  };

  // --- Minimal UI shell for list management (non-intrusive) ---
  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      {/* Top bar */}
      <header className="safe-x sticky top-0 z-10 border-b border-neutral-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-screen-sm items-center justify-between gap-3 py-3">
          <div className="flex min-w-0 items-baseline gap-2">
            <h1 className="truncate text-lg font-semibold">Smart Shopping List</h1>
            <span className="truncate text-sm text-neutral-500">— {currentName}</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Existing lists picker */}
            <select
              className="rounded-xl border border-neutral-300 px-3 py-2 text-sm"
              value={snap?.id ?? ""}
              onChange={(e) => handleSelect(e.target.value)}
            >
              <option value="" disabled>
                Select list…
              </option>
              {lists.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>

            {/* New list button */}
            <button
              onClick={() => setNewOpen(true)}
              className="rounded-xl bg-indigo-600 px-3 py-2 text-sm font-medium text-white"
            >
              New list
            </button>
          </div>
        </div>
      </header>

      {/* Main content placeholder */}
      <main className="safe-x mx-auto max-w-screen-sm py-4">
        {/* Here your existing components render, using `snap` as the current list.
           Example (pseudo):
           <List items={snap?.items ?? []} onChange={...} />
        */}
        <div className="rounded-2xl border border-dashed border-neutral-300 p-4 text-sm text-neutral-600">
          Current list ID: <strong>{snap?.id ?? "—"}</strong>
          <br />
          Items: <strong>{snap?.items?.length ?? 0}</strong>
          <br />
          Created: <strong>{snap?.createdAt ?? "—"}</strong>
        </div>
      </main>

      {/* New list dialog */}
      <NewListDialog
        isOpen={isNewOpen}
        onClose={() => setNewOpen(false)}
        onCreate={handleCreate}
        existingNames={lists.map((l) => l.name)}
      />
    </div>
  );
}