// Low-level storage utilities, constants, and index helpers.
// No domain logic here.

import type { ListMeta } from "./types";

// -------- Keys (public because other modules need them) --------
export const STORAGE_KEY = "ssl.currentList";        // legacy single-list snapshot
export const OPS_KEY = "ssl.pendingOps";             // global pending ops queue
export const INDEX_KEY = "ssl.lists.index";          // Array<ListMeta>
export const CURRENT_ID_KEY = "ssl.currentListId";
export const LIST_DOC_KEY = (id: string) => `ssl.list.${id}`;

// -------- Time & environment helpers --------
export function now(): number {
    return Date.now();
}
export function nowIso(): string {
    return new Date().toISOString();
}
export function isOnline(): boolean {
    return typeof navigator !== "undefined" ? navigator.onLine : true;
}

// -------- JSON helpers --------
export function safeParse<T>(raw: string | null, fallback: T): T {
    if (!raw) return fallback;
    try {
        return JSON.parse(raw) as T;
    } catch {
        return fallback;
    }
}
export function safeParseNullable<T>(raw: string | null, fallback: T | null): T | null {
    if (!raw) return fallback;
    try {
        return JSON.parse(raw) as T;
    } catch {
        return fallback;
    }
}
export function write(key: string, value: unknown) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch {
        // ignore quota errors
    }
}

// -------- Index helpers (metadata + selection) --------
export function readIndex(): ListMeta[] {
    return safeParse<ListMeta[]>(localStorage.getItem(INDEX_KEY), []);
}
export function writeIndex(index: ListMeta[]) {
    write(INDEX_KEY, index);
}
export function getCurrentListId(): string | null {
    return localStorage.getItem(CURRENT_ID_KEY);
}
export function setCurrentListId(id: string) {
    localStorage.setItem(CURRENT_ID_KEY, id);
}

// -------- UUID helper --------
export function uuid(): string {
    // Prefer Web Crypto if available
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

// -------- Current selection helpers --------
export function clearCurrentListId() {
    localStorage.removeItem(CURRENT_ID_KEY);
}

// -------- Hard delete a list from Local Storage --------
// Removes the list document, updates the index and fixes currentListId if needed.
// Returns the next current list id (or null) so the UI can react accordingly.
export function removeListById(listId: string): string | null {
    // 1) Remove the list payload
    localStorage.removeItem(LIST_DOC_KEY(listId));

    // 2) Update index (metadata list)
    const prevIndex = readIndex();
    const nextIndex = prevIndex.filter(m => m.id !== listId);
    writeIndex(nextIndex);

    // 3) Repair current selection if it pointed to the deleted list
    const current = getCurrentListId();
    if (current === listId) {
        const fallback = nextIndex.length > 0 ? nextIndex[0].id : null;
        if (fallback) {
            setCurrentListId(fallback);
        } else {
            clearCurrentListId();
        }
        return fallback;
    }
    return current; // unchanged
}