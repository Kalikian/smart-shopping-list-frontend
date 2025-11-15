// src/utils/listMetrics.ts
// Generic counters for list items with done/snoozed flags.

export type ListCounters = {
    total: number;
    open: number;   // !done && !snoozed
    later: number;  // !done && snoozed
    done: number;   // done === true
};

type BucketItem = { done?: boolean; snoozed?: boolean };

/**
 * Calculate counters for total, open, later, done.
 * Open = not done and not snoozed (matches Open bucket in List).
 */
export function calculateListCounters<T extends BucketItem>(
    items: T[],
): ListCounters {
    let open = 0;
    let later = 0;
    let done = 0;

    for (const it of items) {
        if (it.done) {
            done += 1;
        } else if (it.snoozed) {
            later += 1;
        } else {
            open += 1;
        }
    }

    const total = items.length;
    return { total, open, later, done };
}