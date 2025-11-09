// Offline ops queue (add/update/toggle/delete).

import { OPS_KEY, write } from "./storage";
import type { PendingOp } from "./types";

export function loadOps(): PendingOp[] {
    try {
        const raw = localStorage.getItem(OPS_KEY);
        return raw ? (JSON.parse(raw) as PendingOp[]) : [];
    } catch {
        return [];
    }
}
export function saveOps(ops: PendingOp[]) {
    write(OPS_KEY, ops);
}
export function queue(op: PendingOp) {
    const ops = loadOps();
    ops.push(op);
    saveOps(ops);
}