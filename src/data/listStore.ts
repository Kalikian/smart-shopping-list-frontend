// src/data/listStore.ts
// Backward-compatible, offline-first data layer with named lists & current-list selection.
// - Keeps legacy single-list API working (STORAGE_KEY = "ssl.currentList").
// - Adds a lightweight lists index to store multiple named lists.
// - Migrates old STORAGE_KEY data into the indexed store on first touch.
// - Supports offline queue; ops carry listId (optional in types to avoid breaking senders).
// - Ready for later backend sync (idempotent upsert by listId).
//
// NOTE: Existing app code that uses createNewList/addItem/updateItem/... keeps working.
//       You can start using createAndSelectList(name) + selectList(id) + getAllLists() to manage lists.

import type { Item } from "../components/ListItem";

// -------- Legacy keys (kept for backward compatibility) --------
const STORAGE_KEY = "ssl.currentList";     // legacy single-list snapshot
const OPS_KEY = "ssl.pendingOps";          // pending ops (global queue)

// -------- New keys for multi-list support --------
const INDEX_KEY = "ssl.lists.index";       // Array<ListMeta>
const CURRENT_ID_KEY = "ssl.currentListId";
const LIST_DOC_KEY = (id: string) => `ssl.list.${id}`;

// -------- Types --------
export type ListSnapshot = {
    id: string;
    name?: string;         // optional for legacy compatibility
    createdAt: string;     // ISO
    updatedAt?: string;    // ISO
    items: Item[];
};

export type ListMeta = {
    id: string;
    name: string;
    createdAt: string;     // ISO
    updatedAt: string;     // ISO
};

type PendingOp =
    | { type: "add"; item: Item; ts: number; listId?: string }
    | { type: "update"; id: string; patch: Partial<Item>; ts: number; listId?: string }
    | { type: "toggle"; id: string; ts: number; listId?: string }
    | { type: "delete"; id: string; ts: number; listId?: string };

function now() {
    return Date.now();
}
function nowIso() {
    return new Date().toISOString();
}
function isOnline(): boolean {
    return typeof navigator !== "undefined" ? navigator.onLine : true;
}

function safeParse<T>(raw: string | null, fallback: T): T {
    if (!raw) return fallback;
    try {
        return JSON.parse(raw) as T;
    } catch {
        return fallback;
    }
}
function safeParseNullable<T>(raw: string | null, fallback: T | null): T | null {
    if (!raw) return fallback;
    try {
        return JSON.parse(raw) as T;
    } catch {
        return fallback;
    }
}
function write(key: string, value: unknown) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch {
        // ignore quota errors
    }
}

// -------- Index helpers --------
function readIndex(): ListMeta[] {
    return safeParse<ListMeta[]>(localStorage.getItem(INDEX_KEY), []);
}
function writeIndex(index: ListMeta[]) {
    write(INDEX_KEY, index);
}
function getCurrentListId(): string | null {
    return localStorage.getItem(CURRENT_ID_KEY);
}
function setCurrentListId(id: string) {
    localStorage.setItem(CURRENT_ID_KEY, id);
}
function uuid(): string {
    // Prefer Web Crypto if available, without using 'any'
    if (typeof crypto !== "undefined") {
        const maybe = (crypto as Crypto & { randomUUID?: () => string }).randomUUID;
        if (typeof maybe === "function") return maybe.call(crypto);
    }
    // Fallback (non-cryptographic)
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}

// -------- Migration: legacy STORAGE_KEY -> indexed list --------
function migrateIfNeeded(): void {
    const hasIndex = !!localStorage.getItem(INDEX_KEY);
    const hasCurrentId = !!localStorage.getItem(CURRENT_ID_KEY);
    const legacy = localStorage.getItem(STORAGE_KEY);

    if ((hasIndex && hasCurrentId) || !legacy) {
        return; // nothing to do
    }

    // Create a new list id and move legacy snapshot there
    const id = uuid();
    const parsed = safeParse<ListSnapshot>(legacy, {
        id,
        createdAt: nowIso(),
        items: [],
    });
    const name = parsed.name?.trim() || "My list";
    const createdAt = parsed.createdAt || nowIso();
    const updatedAt = parsed.updatedAt || nowIso();

    const normalized: ListSnapshot = {
        id,
        name,
        createdAt,
        updatedAt,
        items: parsed.items ?? [],
    };

    // Persist as a proper per-list document
    write(LIST_DOC_KEY(id), normalized);

    // Create index
    const meta: ListMeta = { id, name, createdAt, updatedAt };
    writeIndex([meta]);

    // Set current id
    setCurrentListId(id);

    // Keep legacy STORAGE_KEY for full backward compatibility,
    // but update it to reflect normalized structure
    write(STORAGE_KEY, normalized);
}

// -------- Storage for per-list documents --------
function readListDoc(id: string): ListSnapshot | null {
    return safeParseNullable<ListSnapshot>(localStorage.getItem(LIST_DOC_KEY(id)), null);
}
function writeListDoc(snap: ListSnapshot) {
    write(LIST_DOC_KEY(snap.id), snap);
    // Keep legacy STORAGE_KEY mirrored if this is the current list
    if (getCurrentListId() === snap.id) {
        write(STORAGE_KEY, snap);
    }
    // Update index
    const index = readIndex();
    const idx = index.findIndex((m) => m.id === snap.id);
    const updatedAt = snap.updatedAt || nowIso();
    const name = (snap.name?.trim() || "My list");
    const meta: ListMeta = {
        id: snap.id,
        name,
        createdAt: snap.createdAt,
        updatedAt,
    };
    if (idx >= 0) index[idx] = meta;
    else index.unshift(meta);
    writeIndex(index.sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1)));
}

// -------- Ops queue helpers --------
function loadOps(): PendingOp[] {
    try {
        const raw = localStorage.getItem(OPS_KEY);
        return raw ? (JSON.parse(raw) as PendingOp[]) : [];
    } catch {
        return [];
    }
}
function saveOps(ops: PendingOp[]) {
    write(OPS_KEY, ops);
}
function queue(op: PendingOp) {
    const ops = loadOps();
    ops.push(op);
    saveOps(ops);
}

// ========== Public: Multi-list management (new, optional) ==========
/** Create a named list and set it as current. */
export function createAndSelectList(name: string): ListSnapshot {
    migrateIfNeeded();
    const id = uuid();
    const createdAt = nowIso();
    const snap: ListSnapshot = {
        id,
        name: name.trim() || "My list",
        createdAt,
        updatedAt: createdAt,
        items: [],
    };
    writeListDoc(snap);
    setCurrentListId(id);
    return snap;
}

/** Return all lists (metadata) for pickers. */
export function getAllLists(): ListMeta[] {
    migrateIfNeeded();
    return readIndex();
}

/** Select an existing list as the current working list. */
export function selectList(id: string): ListSnapshot | null {
    migrateIfNeeded();
    const doc = readListDoc(id);
    if (!doc) return null;
    setCurrentListId(id);
    // Mirror to legacy key for backward compatibility
    write(STORAGE_KEY, doc);
    return doc;
}

/** Rename the current list (no breaking change for legacy flows). */
export function renameCurrentList(newName: string): ListSnapshot | null {
    migrateIfNeeded();
    const id = getCurrentListId();
    if (!id) return null;
    const snap = readListDoc(id);
    if (!snap) return null;
    const updated = { ...snap, name: newName.trim() || "My list", updatedAt: nowIso() };
    writeListDoc(updated);
    return updated;
}

/** Delete a list; if it was current, unset current selection. */
export function deleteListById(id: string): void {
    migrateIfNeeded();
    localStorage.removeItem(LIST_DOC_KEY(id));
    writeIndex(readIndex().filter((m) => m.id !== id));
    if (getCurrentListId() === id) {
        localStorage.removeItem(CURRENT_ID_KEY);
        // Keep legacy STORAGE_KEY as-is; next operation will create/select anew.
    }
}

// ========== Public: Legacy single-list API (kept stable) ==========
/** Create a brand-new empty list and persist it (legacy API). */
export function createNewList(): ListSnapshot {
    migrateIfNeeded();

    // If multi-list is already in use, create and select a new one
    const currentId = getCurrentListId();
    if (currentId) {
        const created = createAndSelectList("My list");
        return created;
    }

    // Legacy path: mirror into indexed store for forward compatibility
    const id = uuid();
    const createdAt = nowIso();
    const snap: ListSnapshot = {
        id,
        name: "My list",
        createdAt,
        updatedAt: createdAt,
        items: [],
    };

    // Persist in both places (keeps old code happy)
    write(STORAGE_KEY, snap);
    writeListDoc(snap);
    setCurrentListId(id);

    return snap;
}

/** Replace entire items array (e.g., after edits) and persist. */
export function replaceItems(items: Item[]): ListSnapshot {
    migrateIfNeeded();
    const snap = loadSnapshot() ?? createNewList();
    const updated: ListSnapshot = {
        ...snap,
        items,
        updatedAt: nowIso(),
    };
    writeListDoc(updated);
    return updated;
}

/** Add a new item (optimistic) and persist. Also queue op if offline. */
export function addItem(newItem: Item): ListSnapshot {
    migrateIfNeeded();
    const snap = loadSnapshot() ?? createNewList();
    const updated: ListSnapshot = {
        ...snap,
        items: [...snap.items, newItem],
        updatedAt: nowIso(),
    };
    writeListDoc(updated);
    if (!isOnline()) queue({ type: "add", item: newItem, ts: now(), listId: snap.id });
    return updated;
}

/** Update partial fields on an item and persist. Queue when offline. */
export function updateItem(id: string, patch: Partial<Item>): ListSnapshot {
    migrateIfNeeded();
    const snap = loadSnapshot() ?? createNewList();
    const items = snap.items.map((it) => (it.id === id ? { ...it, ...patch } : it));
    const updated: ListSnapshot = { ...snap, items, updatedAt: nowIso() };
    writeListDoc(updated);
    if (!isOnline()) queue({ type: "update", id, patch, ts: now(), listId: snap.id });
    return updated;
}

/** Toggle done flag for an item and persist. Queue when offline. */
export function toggleItem(id: string): ListSnapshot {
    migrateIfNeeded();
    const snap = loadSnapshot() ?? createNewList();
    const items = snap.items.map((it) => (it.id === id ? { ...it, done: !it.done } : it));
    const updated: ListSnapshot = { ...snap, items, updatedAt: nowIso() };
    writeListDoc(updated);
    if (!isOnline()) queue({ type: "toggle", id, ts: now(), listId: snap.id });
    return updated;
}

/** Remove an item and persist. Queue when offline. */
export function deleteItem(id: string): ListSnapshot {
    migrateIfNeeded();
    const snap = loadSnapshot() ?? createNewList();
    const items = snap.items.filter((it) => it.id !== id);
    const updated: ListSnapshot = { ...snap, items, updatedAt: nowIso() };
    writeListDoc(updated);
    if (!isOnline()) queue({ type: "delete", id, ts: now(), listId: snap.id });
    return updated;
}

/** Backwards-compatible alias (App.tsx currently calls removeItem) */
export const removeItem = deleteItem;

/** Load the currently selected list snapshot (legacy-compatible). */
export function loadSnapshot(): ListSnapshot | null {
    migrateIfNeeded();

    // Prefer current-id aware document
    const currentId = getCurrentListId();
    if (currentId) {
        const doc = readListDoc(currentId);
        if (doc) return doc;
    }

    // Fallback to legacy key (should only be hit pre-migration)
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return null;
        return JSON.parse(raw) as ListSnapshot;
    } catch {
        return null;
    }
}

/** Save current snapshot (legacy-compatible). */
export function saveSnapshot(snap: ListSnapshot): void {
    migrateIfNeeded();
    writeListDoc({ ...snap, updatedAt: nowIso() });
}

// ========== Sync ==========
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
    localStorage.removeItem(INDEX_KEY);
    localStorage.removeItem(CURRENT_ID_KEY);
    // Remove all per-list docs
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith("ssl.list.")) keysToRemove.push(k);
    }
    keysToRemove.forEach((k) => localStorage.removeItem(k));
}