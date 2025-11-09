// Per-list document storage. Owns read/write of ListSnapshot and keeps the index consistent.

import { LIST_DOC_KEY, STORAGE_KEY, readIndex, writeIndex, getCurrentListId, nowIso, write } from "./storage";
import type { ListMeta, ListSnapshot } from "./types";

export function readListDoc(id: string): ListSnapshot | null {
    const raw = localStorage.getItem(LIST_DOC_KEY(id));
    if (!raw) return null;
    try {
        return JSON.parse(raw) as ListSnapshot;
    } catch {
        return null;
    }
}

export function writeListDoc(snap: ListSnapshot) {
    write(LIST_DOC_KEY(snap.id), snap);

    // Mirror legacy STORAGE_KEY if this is the current list
    if (getCurrentListId() === snap.id) {
        write(STORAGE_KEY, snap);
    }

    // Update index metadata
    const index = readIndex();
    const idx = index.findIndex((m) => m.id === snap.id);
    const updatedAt = snap.updatedAt || nowIso();
    const name = (snap.name?.trim() || "My list");
    const meta: ListMeta = { id: snap.id, name, createdAt: snap.createdAt, updatedAt };

    if (idx >= 0) index[idx] = meta;
    else index.unshift(meta);

    writeIndex(index.sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1)));
}