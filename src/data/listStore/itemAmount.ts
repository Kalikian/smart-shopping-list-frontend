// src/data/listStore/itemAmount.ts
// Domain helpers for item amounts and units (no React, no DOM)

import type { Unit } from "../../constants/categories";

// Units that should be treated as integers (no decimals)
export const INTEGER_UNITS = new Set<Unit>(["pcs", "pack", "g", "mL"]);

// Units that allow decimal amounts
export const DECIMAL_UNITS = new Set<Unit>(["kg", "L"]);

export type AmountInputAttributes = {
    step: number;
    inputMode: "numeric" | "decimal";
    pattern?: string;
};

/**
 * Return HTML input attributes that match the given unit.
 * Used by UI components to configure number inputs.
 */
export function getAmountInputAttributes(unit: Unit): AmountInputAttributes {
    if (INTEGER_UNITS.has(unit)) {
        return { step: 1, inputMode: "numeric", pattern: "[0-9]*" };
    }

    if (DECIMAL_UNITS.has(unit)) {
        return { step: 0.1, inputMode: "decimal" };
    }

    // Fallback: behave like integer
    return { step: 1, inputMode: "numeric", pattern: "[0-9]*" };
}

/**
 * Normalize a raw amount string according to the unit:
 * - default to 1
 * - clamp to >= 1
 * - integers: truncate
 * - decimals: keep 1 decimal place
 */
export function normalizeAmount(raw: string, unit: Unit): number {
    const trimmed = raw.trim();
    const fallback = "1";

    let parsed = DECIMAL_UNITS.has(unit)
        ? Number.parseFloat(trimmed || fallback)
        : Number.parseInt(trimmed || fallback, 10);

    if (!Number.isFinite(parsed) || parsed <= 0) {
        parsed = 1;
    }

    if (INTEGER_UNITS.has(unit)) {
        // Force integers >= 1
        return Math.max(1, Math.trunc(parsed));
    }

    // Allow 1 decimal place, clamp to >= 1
    return Math.max(1, Math.round(parsed * 10) / 10);
}
