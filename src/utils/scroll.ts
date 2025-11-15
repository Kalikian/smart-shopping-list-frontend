// src/utils/scroll.ts
// Scroll helpers shared across components (no React imports).

export type ScrollEl = Window | Element;

/**
 * Find the nearest scrollable ancestor for an element.
 */
export function getScrollParent(el: Element | null): ScrollEl {
    if (!el) return window;
    let p: Element | null = el.parentElement;
    while (p) {
        const { overflowY } = getComputedStyle(p);
        if (/(auto|scroll|overlay)/.test(overflowY)) return p;
        p = p.parentElement;
    }
    return window;
}

/**
 * Get element top relative to the scroll container.
 */
export function getRelativeTop(
    el: Element | null,
    scrollEl: ScrollEl | null,
): number {
    if (!el) return 0;
    const rect = el.getBoundingClientRect();
    if (!scrollEl || scrollEl === window) return rect.top;
    const host = (scrollEl as Element).getBoundingClientRect();
    return rect.top - host.top;
}

/**
 * Scroll by a vertical delta in the given scroll container.
 */
export function scrollByDelta(scrollEl: ScrollEl | null, dy: number): void {
    if (!dy) return;
    if (!scrollEl || scrollEl === window) {
        window.scrollBy(0, dy);
    } else {
        (scrollEl as Element).scrollTop += dy;
    }
}