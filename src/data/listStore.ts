// src/data/listStore.ts
// Minimal offline-first data layer for the current shopping list.
// - Stores snapshot in localStorage (can be swapped to IndexedDB later).
// - Records pending ops while offline; you can flush them to the backend later.
// - Provides small helpers to mutate and persist the list.

import type { Item } from "../components/ListItem";

const STORAGE_KEY = "ssl.currentList";
const OPS_KEY = "ssl.pendingOps";

export type ListSnapshot = {
    id: string;
    createdAt: string; // ISO
    items: Item[];
};

type PendingOp =
    | { type: "add"; item: Item; ts: number }
    | { type: "update"; id: string; patch: Partial<Item>; ts: number }
    | { type: "toggle"; id: string; ts: number }
    | { type: "delete"; id: string; ts: number };

function now() {
    return Date.now();
}

function isOnline(): boolean {
    return typeof navigator !== "undefined" ? navigator.onLine : true;
}

// ---------- Storage helpers ----------

export function loadSnapshot(): ListSnapshot | null {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return null;
        return JSON.parse(raw) as ListSnapshot;
    } catch {
        return null;
    }
}

export function saveSnapshot(snap: ListSnapshot): void {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(snap));
    } catch {
        // ignore quota for now
    }
}

function loadOps(): PendingOp[] {
    try {
        const raw = localStorage.getItem(OPS_KEY);
        return raw ? (JSON.parse(raw) as PendingOp[]) : [];
    } catch {
        return [];
    }
}

function saveOps(ops: PendingOp[]) {
    try {
        localStorage.setItem(OPS_KEY, JSON.stringify(ops));
    } catch {
        // ignore
    }
}

function queue(op: PendingOp) {
    const ops = loadOps();
    ops.push(op);
    saveOps(ops);
}

// ---------- Public API ----------

/** Create a brand-new empty list and persist it. */
export function createNewList(): ListSnapshot {
    const snap: ListSnapshot = {
        id: `list-${now()}`,
        createdAt: new Date().toISOString(),
        items: [],
    };
    saveSnapshot(snap);
    return snap;
}

/** Replace entire items array (e.g., after edits) and persist. */
export function replaceItems(items: Item[]): ListSnapshot {
    const snap = loadSnapshot();
    if (!snap) {
        const fresh = createNewList();
        fresh.items = items;
        saveSnapshot(fresh);
        return fresh;
    }
    const updated = { ...snap, items };
    saveSnapshot(updated);
    return updated;
}

/** Add a new item (optimistic) and persist. Also queue op if offline. */
export function addItem(newItem: Item): ListSnapshot {
    const snap = loadSnapshot() ?? createNewList();
    const updated: ListSnapshot = { ...snap, items: [...snap.items, newItem] };
    saveSnapshot(updated);
    if (!isOnline()) queue({ type: "add", item: newItem, ts: now() });
    return updated;
}

/** Update partial fields on an item and persist. Queue when offline. */
export function updateItem(id: string, patch: Partial<Item>): ListSnapshot {
    const snap = loadSnapshot() ?? createNewList();
    const items = snap.items.map((it) => (it.id === id ? { ...it, ...patch } : it));
    const updated = { ...snap, items };
    saveSnapshot(updated);
    if (!isOnline()) queue({ type: "update", id, patch, ts: now() });
    return updated;
}

/** Toggle done flag for an item and persist. Queue when offline. */
export function toggleItem(id: string): ListSnapshot {
    const snap = loadSnapshot() ?? createNewList();
    const items = snap.items.map((it) => (it.id === id ? { ...it, done: !it.done } : it));
    const updated = { ...snap, items };
    saveSnapshot(updated);
    if (!isOnline()) queue({ type: "toggle", id, ts: now() });
    return updated;
}

/** Remove an item and persist. Queue when offline. */
export function deleteItem(id: string): ListSnapshot {
    const snap = loadSnapshot() ?? createNewList();
    const items = snap.items.filter((it) => it.id !== id);
    const updated = { ...snap, items };
    saveSnapshot(updated);
    if (!isOnline()) queue({ type: "delete", id, ts: now() });
    return updated;
}

/** Backwards-compatible alias (App.tsx currently calls removeItem) */
export const removeItem = deleteItem;

/**
 * Flush pending ops to the backend.
 * Provide a function that knows how to POST each op to your API.
 * If all succeed, the queue is cleared.
 */
export async function flushPendingOps(sender: (op: PendingOp) => Promise<void>): Promise<void> {
    const ops = loadOps();
    if (!ops.length) return;

    for (const op of ops) {
        await sender(op);
    }
    saveOps([]); // clear on success
}

/** Utility to hard-reset (e.g., for debug) */
export function resetStorage() {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(OPS_KEY);
}