// src/utils/sortItems.ts
import { CATEGORIES, type CategoryLabel } from "../constants/categories";

/** Minimal shape needed for sorting; category may be undefined */
export type ItemLike = {
    name: string;
    category?: CategoryLabel | undefined;
};

// Rank table: CATEGORIES order; fallback pushes unknowns to the end
const categoryRank = Object.fromEntries(
    CATEGORIES.map((c, i) => [c, i])
) as Record<CategoryLabel, number>;

const rankOf = (cat?: CategoryLabel) =>
    categoryRank[(cat ?? "Default") as CategoryLabel] ?? Number.MAX_SAFE_INTEGER;

/**
 * Stable view sort: Category (CATEGORIES order) → Name (A–Z)
 * - Keeps the original item type T in the return type.
 * - Accepts items whose `category` may be undefined.
 */
export function sortItemsByCategory<T extends ItemLike>(items: T[]): T[] {
    return [...items].sort((a, b) => {
        const ra = rankOf(a.category);
        const rb = rankOf(b.category);
        if (ra !== rb) return ra - rb;
        return a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
    });
}