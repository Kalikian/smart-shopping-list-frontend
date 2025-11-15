// src/utils/ids.ts
// Helpers for generating stable-ish item IDs.

export function createItemId(): string {
    return `it-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}
