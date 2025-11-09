// Public API surface: multi-list mgmt, legacy single-list ops, uniqueness helpers, sync, reset.
// This module is what the app should import from.

import type { ListMeta, ListSnapshot, PendingOp } from "./types";
import { migrateIfNeeded } from "./migration";
import {
    STORAGE_KEY,
    OPS_KEY,
    INDEX_KEY,
    CURRENT_ID_KEY,
    LIST_DOC_KEY,
    readIndex,
    writeIndex,
    getCurrentListId,
    setCurrentListId,
    nowIso,
    now,
    uuid,
    isOnline,
    write,
} from "./storage";
import { readListDoc, writeListDoc } from "./listDocs";
import { loadOps, saveOps, queue } from "./opsQueue";

// ---------- Multi-list management ----------
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

export function getAllLists(): ListMeta[] {
    migrateIfNeeded();
    return readIndex();
}

export function selectList(id: string): ListSnapshot | null {
    migrateIfNeeded();
    const doc = readListDoc(id);
    if (!doc) return null;
    setCurrentListId(id);
    write(STORAGE_KEY, doc); // mirror for legacy
    return doc;
}

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

export function deleteListById(id: string): void {
    migrateIfNeeded();
    localStorage.removeItem(LIST_DOC_KEY(id));
    writeIndex(readIndex().filter((m) => m.id !== id));
    if (getCurrentListId() === id) {
        localStorage.removeItem(CURRENT_ID_KEY);
    }
}

// ---------- Legacy single-list API (kept stable) ----------
export function createNewList(): ListSnapshot {
    migrateIfNeeded();

    const currentId = getCurrentListId();
    if (currentId) {
        return createAndSelectList("My list");
    }

    const id = uuid();
    const createdAt = nowIso();
    const snap: ListSnapshot = {
        id,
        name: "My list",
        createdAt,
        updatedAt: createdAt,
        items: [],
    };

    write(STORAGE_KEY, snap);
    writeListDoc(snap);
    setCurrentListId(id);
    return snap;
}

export function replaceItems(items: ListSnapshot["items"]): ListSnapshot {
    migrateIfNeeded();
    const snap = loadSnapshot() ?? createNewList();
    const updated: ListSnapshot = { ...snap, items, updatedAt: nowIso() };
    writeListDoc(updated);
    return updated;
}

export function addItem(newItem: ListSnapshot["items"][number]): ListSnapshot {
    migrateIfNeeded();
    const snap = loadSnapshot() ?? createNewList();
    const updated: ListSnapshot = { ...snap, items: [...snap.items, newItem], updatedAt: nowIso() };
    writeListDoc(updated);
    if (!isOnline()) queue({ type: "add", item: newItem, ts: now(), listId: snap.id });
    return updated;
}

export function updateItem(id: string, patch: Partial<ListSnapshot["items"][number]>): ListSnapshot {
    migrateIfNeeded();
    const snap = loadSnapshot() ?? createNewList();
    const items = snap.items.map((it) => (it.id === id ? { ...it, ...patch } : it));
    const updated: ListSnapshot = { ...snap, items, updatedAt: nowIso() };
    writeListDoc(updated);
    if (!isOnline()) queue({ type: "update", id, patch, ts: now(), listId: snap.id });
    return updated;
}

export function toggleItem(id: string): ListSnapshot {
    migrateIfNeeded();
    const snap = loadSnapshot() ?? createNewList();
    const items = snap.items.map((it) => (it.id === id ? { ...it, done: !it.done } : it));
    const updated: ListSnapshot = { ...snap, items, updatedAt: nowIso() };
    writeListDoc(updated);
    if (!isOnline()) queue({ type: "toggle", id, ts: now(), listId: snap.id });
    return updated;
}

export function deleteItem(id: string): ListSnapshot {
    migrateIfNeeded();
    const snap = loadSnapshot() ?? createNewList();
    const items = snap.items.filter((it) => it.id !== id);
    const updated: ListSnapshot = { ...snap, items, updatedAt: nowIso() };
    writeListDoc(updated);
    if (!isOnline()) queue({ type: "delete", id, ts: now(), listId: snap.id });
    return updated;
}

export const removeItem = deleteItem;

export function loadSnapshot(): ListSnapshot | null {
    migrateIfNeeded();

    const currentId = getCurrentListId();
    if (currentId) {
        const doc = readListDoc(currentId);
        if (doc) return doc;
    }

    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return null;
        return JSON.parse(raw) as ListSnapshot;
    } catch {
        return null;
    }
}

export function saveSnapshot(snap: ListSnapshot): void {
    migrateIfNeeded();
    writeListDoc({ ...snap, updatedAt: nowIso() });
}

// ---------- Name utilities (uniqueness, open by name) ----------
function normName(name: string): string {
    return name.trim().toLowerCase();
}

export function nameExists(name: string): boolean {
    const n = normName(name);
    return readIndex().some((m) => normName(m.name) === n);
}

export function getListMetaByName(name: string): ListMeta | null {
    const n = normName(name);
    const meta = readIndex().find((m) => normName(m.name) === n);
    return meta ?? null;
}

export function createAndSelectListUnique(
    name: string
): { ok: true; list: ListSnapshot } | { ok: false; reason: "duplicate" } {
    migrateIfNeeded();
    if (nameExists(name)) return { ok: false, reason: "duplicate" };
    const created = createAndSelectList(name);
    return { ok: true, list: created };
}

export function renameCurrentListUnique(
    newName: string
): { ok: true; list: ListSnapshot } | { ok: false; reason: "duplicate" | "notfound" } {
    migrateIfNeeded();
    const id = getCurrentListId();
    if (!id) return { ok: false, reason: "notfound" };
    const snap = readListDoc(id);
    if (!snap) return { ok: false, reason: "notfound" };

    const candidate = newName.trim();
    const takenByOther = readIndex().some(
        (m) => m.id !== id && normName(m.name) === normName(candidate)
    );
    if (takenByOther) return { ok: false, reason: "duplicate" };

    const updated: ListSnapshot = { ...snap, name: candidate, updatedAt: nowIso() };
    writeListDoc(updated);
    return { ok: true, list: updated };
}

export function openExistingByName(name: string): ListSnapshot | null {
    migrateIfNeeded();
    const meta = getListMetaByName(name);
    if (!meta) return null;
    return selectList(meta.id);
}

// ---------- Sync & maintenance ----------
export async function flushPendingOps(sender: (op: PendingOp) => Promise<void>): Promise<void> {
    const ops = loadOps();
    if (!ops.length) return;
    for (const op of ops) {
        await sender(op);
    }
    saveOps([]); // clear on success
}

export function resetStorage() {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(OPS_KEY);
    localStorage.removeItem(INDEX_KEY);
    localStorage.removeItem(CURRENT_ID_KEY);
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith("ssl.list.")) keysToRemove.push(k);
    }
    keysToRemove.forEach((k) => localStorage.removeItem(k));
}