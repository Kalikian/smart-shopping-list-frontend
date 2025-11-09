// Types for list storage and ops.
// Keep UI component Item type as an import type to avoid bundling.
import type { Item } from "../../components/ListItem";

export type ListSnapshot = {
    id: string;
    name?: string;        // optional for legacy compatibility
    createdAt: string;    // ISO
    updatedAt?: string;   // ISO
    items: Item[];
};

export type ListMeta = {
    id: string;
    name: string;
    createdAt: string;    // ISO
    updatedAt: string;    // ISO
};

export type PendingOp =
    | { type: "add"; item: Item; ts: number; listId?: string }
    | { type: "update"; id: string; patch: Partial<Item>; ts: number; listId?: string }
    | { type: "toggle"; id: string; ts: number; listId?: string }
    | { type: "delete"; id: string; ts: number; listId?: string };
