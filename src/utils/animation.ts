// src/utils/animation.ts
// Shared framer-motion transitions and easing presets.

import type { Transition, Easing } from "framer-motion";

/** Standard material-like ease for tweens. */
export const EASE_IN_OUT: Easing = [0.4, 0, 0.2, 1] as const;

/** Spring preset for row enter/move in the Open bucket. */
export const OPEN_ROW_SPRING: Transition = {
    type: "spring",
    stiffness: 360,
    damping: 42,
    mass: 0.6,
};

/** Tween preset for successor rows when one item is removed/reordered. */
export const SUCCESSOR_ROW_TWEEN: Transition = {
    type: "tween",
    ease: EASE_IN_OUT,
    duration: 0.75,
};

/** Softer spring for whole-section layout changes. */
export const SECTION_SPRING_SOFT: Transition = {
    type: "spring",
    stiffness: 220,
    damping: 32,
};

/** Instant transition (no animation). */
export const INSTANT: Transition = { duration: 0 };

export type { Transition, Easing };
