// One-time migration from legacy STORAGE_KEY to indexed multi-list store.

import {
    INDEX_KEY,
    CURRENT_ID_KEY,
    STORAGE_KEY,
    setCurrentListId,
    nowIso,
    uuid,
    write,
} from "./storage";
import { writeListDoc } from "./listDocs";
import type { ListMeta, ListSnapshot } from "./types";

export function migrateIfNeeded(): void {
    const hasIndex = !!localStorage.getItem(INDEX_KEY);
    const hasCurrentId = !!localStorage.getItem(CURRENT_ID_KEY);
    const legacy = localStorage.getItem(STORAGE_KEY);

    if ((hasIndex && hasCurrentId) || !legacy) return;

    const id = uuid();
    let parsed: ListSnapshot;
    try {
        parsed = JSON.parse(legacy) as ListSnapshot;
    } catch {
        parsed = { id, createdAt: nowIso(), items: [] };
    }

    const name = parsed.name?.trim() || "My list";
    const createdAt = parsed.createdAt || nowIso();
    const updatedAt = parsed.updatedAt || nowIso();

    const normalized: ListSnapshot = { id, name, createdAt, updatedAt, items: parsed.items ?? [] };

    writeListDoc(normalized);

    const meta: ListMeta = { id, name, createdAt, updatedAt };
    // writeIndex via write to avoid circular import
    write(INDEX_KEY, [meta]);

    setCurrentListId(id);

    // Keep legacy key updated for backward compatibility
    write(STORAGE_KEY, normalized);
}