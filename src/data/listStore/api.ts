// src/data/listStore/api.ts
// Public API surface: multi-list mgmt, legacy single-list ops, uniqueness helpers, sync, reset.

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
    clearCurrentListId,
} from "./storage";
import { readListDoc, writeListDoc } from "./listDocs";
import { loadOps, saveOps, queue } from "./opsQueue";

/* ----------------------- helpers ----------------------- */

// Normalize optional names to a concrete string
const fallbackName = (n?: string) => (n && n.trim() ? n.trim() : "My list");

// Build a ListMeta that always matches your types (name: string, updatedAt: string)
const safeMeta = (
    id: string,
    name?: string,
    updatedAt?: string,
    createdAt?: string
): ListMeta => {
    // preserve createdAt/name from existing index if not provided
    const prev = readIndex().find(m => m.id === id);
    const created = createdAt ?? prev?.createdAt ?? nowIso();
    const nm = name ?? prev?.name;

    return {
        id,
        name: fallbackName(nm),
        createdAt: created,
        updatedAt: updatedAt ?? nowIso(),
    };
};

// Create ListMeta from a snapshot
function toMeta(s: ListSnapshot): ListMeta {
    return safeMeta(s.id, s.name, s.updatedAt, s.createdAt);
}

// Upsert a meta entry into the index
function upsertMeta(meta: ListMeta) {
    const idx = readIndex();
    const exists = idx.some((m) => m.id === meta.id);
    const next = exists ? idx.map((m) => (m.id === meta.id ? meta : m)) : [...idx, meta];
    writeIndex(next);
}

// Remove meta by id, return new index
function removeMeta(id: string): ListMeta[] {
    const next = readIndex().filter((m) => m.id !== id);
    writeIndex(next);
    return next;
}

function normName(name: string): string {
    return name.trim().toLowerCase();
}

/* ---------------- multi-list management ---------------- */

export function createAndSelectList(name: string): ListSnapshot {
    migrateIfNeeded();

    const id = uuid();
    const createdAt = nowIso();

    const snap: ListSnapshot = {
        id,
        name: fallbackName(name),
        createdAt,
        updatedAt: createdAt,
        items: [],
    };

    // Persist list document + index + current + legacy mirror
    writeListDoc(snap);
    upsertMeta(toMeta(snap));
    setCurrentListId(id);
    write(STORAGE_KEY, snap);

    return snap;
}

export function getAllLists(): ListMeta[] {
    migrateIfNeeded();
    // Always fresh, sort by recency (ISO strings)
    return [...readIndex()].sort(
        (a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt)
    );
}

export function selectList(id: string): ListSnapshot | null {
    migrateIfNeeded();

    const doc = readListDoc(id);
    if (!doc) return null;

    setCurrentListId(id);
    write(STORAGE_KEY, doc); // legacy mirror

    // Bump recency in index
    upsertMeta(safeMeta(id, doc.name, nowIso()));

    return doc;
}

export function renameCurrentList(newName: string): ListSnapshot | null {
    migrateIfNeeded();

    const id = getCurrentListId();
    if (!id) return null;

    const snap = readListDoc(id);
    if (!snap) return null;

    const updated: ListSnapshot = {
        ...snap,
        name: fallbackName(newName),
        updatedAt: nowIso(),
    };

    writeListDoc(updated);
    upsertMeta(safeMeta(id, updated.name, updated.updatedAt));
    write(STORAGE_KEY, updated);

    return updated;
}

export function deleteListById(id: string): void {
    migrateIfNeeded();

    // 1) Remove the list document
    localStorage.removeItem(LIST_DOC_KEY(id));

    // 2) Update the index
    const nextIndex = removeMeta(id);

    // 3) Repair current selection + legacy mirror if needed
    if (getCurrentListId() === id) {
        const fallback = nextIndex.length > 0 ? nextIndex[0].id : null;
        if (fallback) {
            setCurrentListId(fallback);
            const doc = readListDoc(fallback);
            if (doc) write(STORAGE_KEY, doc);
        } else {
            clearCurrentListId();
            localStorage.removeItem(STORAGE_KEY);
        }
    }
}

/* ---------------- legacy single-list API ---------------- */

export function createNewList(): ListSnapshot {
    migrateIfNeeded();

    const currentId = getCurrentListId();
    if (currentId) {
        // If something is selected, create a separate new one and select it
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
    upsertMeta(toMeta(snap));
    setCurrentListId(id);

    return snap;
}

export function replaceItems(items: ListSnapshot["items"]): ListSnapshot {
    migrateIfNeeded();

    const snap = loadSnapshot() ?? createNewList();
    const updated: ListSnapshot = { ...snap, items, updatedAt: nowIso() };

    writeListDoc(updated);
    upsertMeta(safeMeta(updated.id, updated.name, updated.updatedAt));
    write(STORAGE_KEY, updated);

    return updated;
}

export function addItem(newItem: ListSnapshot["items"][number]): ListSnapshot {
    migrateIfNeeded();

    const snap = loadSnapshot() ?? createNewList();
    const updated: ListSnapshot = {
        ...snap,
        items: [...snap.items, newItem],
        updatedAt: nowIso(),
    };

    writeListDoc(updated);
    upsertMeta(safeMeta(updated.id, updated.name, updated.updatedAt));
    write(STORAGE_KEY, updated);

    if (!isOnline()) queue({ type: "add", item: newItem, ts: now(), listId: snap.id });

    return updated;
}

export function updateItem(
    id: string,
    patch: Partial<ListSnapshot["items"][number]>
): ListSnapshot {
    migrateIfNeeded();

    const snap = loadSnapshot() ?? createNewList();
    const items = snap.items.map((it) => (it.id === id ? { ...it, ...patch } : it));
    const updated: ListSnapshot = { ...snap, items, updatedAt: nowIso() };

    writeListDoc(updated);
    upsertMeta(safeMeta(updated.id, updated.name, updated.updatedAt));
    write(STORAGE_KEY, updated);

    if (!isOnline()) queue({ type: "update", id, patch, ts: now(), listId: snap.id });

    return updated;
}

export function toggleItem(id: string): ListSnapshot {
    migrateIfNeeded();

    const snap = loadSnapshot() ?? createNewList();
    const items = snap.items.map((it) => (it.id === id ? { ...it, done: !it.done } : it));
    const updated: ListSnapshot = { ...snap, items, updatedAt: nowIso() };

    writeListDoc(updated);
    upsertMeta(safeMeta(updated.id, updated.name, updated.updatedAt));
    write(STORAGE_KEY, updated);

    if (!isOnline()) queue({ type: "toggle", id, ts: now(), listId: snap.id });

    return updated;
}

export function deleteItem(id: string): ListSnapshot {
    migrateIfNeeded();

    const snap = loadSnapshot() ?? createNewList();
    const items = snap.items.filter((it) => it.id !== id);
    const updated: ListSnapshot = { ...snap, items, updatedAt: nowIso() };

    writeListDoc(updated);
    upsertMeta(safeMeta(updated.id, updated.name, updated.updatedAt));
    write(STORAGE_KEY, updated);

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

    const updated: ListSnapshot = { ...snap, updatedAt: nowIso() };

    writeListDoc(updated);
    upsertMeta(safeMeta(updated.id, updated.name, updated.updatedAt));
    write(STORAGE_KEY, updated);
}

/* --------------- name utilities / open by name --------------- */

export function nameExists(name: string): boolean {
    const n = normName(name);
    return readIndex().some((m) => normName(m.name ?? "") === n);
}

export function getListMetaByName(name: string): ListMeta | null {
    const n = normName(name);
    const meta = readIndex().find((m) => normName(m.name ?? "") === n);
    return meta ?? null;
}

export function createAndSelectListUnique(
    name: string
): { ok: true; list: ListSnapshot } | { ok: false; reason: "duplicate" | "invalid" } {
    migrateIfNeeded();

    const trimmed = name.trim();
    if (!trimmed) return { ok: false, reason: "invalid" };
    if (nameExists(trimmed)) return { ok: false, reason: "duplicate" };

    const created = createAndSelectList(trimmed);
    return { ok: true, list: created };
}

export function renameCurrentListUnique(
    newName: string
): { ok: true; list: ListSnapshot } | { ok: false; reason: "duplicate" | "notfound" | "invalid" } {
    migrateIfNeeded();

    const id = getCurrentListId();
    if (!id) return { ok: false, reason: "notfound" };

    const snap = readListDoc(id);
    if (!snap) return { ok: false, reason: "notfound" };

    const candidate = newName.trim();
    if (!candidate) return { ok: false, reason: "invalid" };

    const takenByOther = readIndex().some(
        (m) => m.id !== id && normName(m.name ?? "") === normName(candidate)
    );
    if (takenByOther) return { ok: false, reason: "duplicate" };

    const updated: ListSnapshot = { ...snap, name: fallbackName(candidate), updatedAt: nowIso() };

    writeListDoc(updated);
    upsertMeta(safeMeta(id, updated.name, updated.updatedAt));
    write(STORAGE_KEY, updated);

    return { ok: true, list: updated };
}

export function openExistingByName(name: string): ListSnapshot | null {
    migrateIfNeeded();
    const meta = getListMetaByName(name);
    if (!meta) return null;
    return selectList(meta.id);
}

/* -------------------- sync & maintenance -------------------- */

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

    clearCurrentListId();
}