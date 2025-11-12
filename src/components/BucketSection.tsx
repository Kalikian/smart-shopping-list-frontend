// src/components/BucketSection.tsx
// Collapsible/animated bucket for "Later" and "In cart".
// - Smooth enter/exit + successor slide-up via layout animations
// - popLayout to avoid jumps; animFromIdx controls successor tweening
// - Scroll anchoring keeps viewport stable while items move

import { type CSSProperties, useState } from "react";
import {
  AnimatePresence,
  motion,
  type Transition,
  type TargetAndTransition,
  type Easing,
} from "framer-motion";
import CompactRow from "./CompactRow";
import type { Item } from "./ListItem";
import type { CategoryLabel } from "../constants/categories";

// TS-safe cubic-bezier (no string easings)
const EASE_OUT: Easing = [0.16, 1, 0.3, 1] as const;

type BucketSectionProps = {
  title: string;
  emptyText: string;
  items: Item[];
  // animation control from parent
  animateBucket: boolean;
  animFromIdx: number | null;
  setAnimFromIdx: (i: number | null) => void;
  // transitions (reused)
  sectionSpring: Transition;
  successorTween: Transition;
  instant: Transition;
  reduceMotion: boolean;
  // refs for scroll anchoring (nullable)
  sectionRef: React.RefObject<HTMLDivElement | null>;
  listRef: React.RefObject<HTMLDivElement | null>;
  // visuals & actions
  colorFor: (c: CategoryLabel) => string;
  // Primary action: send item back to Open
  onPrimaryAction: (item: Item) => void;
  onDelete?: (id: string) => void;
};

export default function BucketSection(props: BucketSectionProps) {
  const {
    title,
    emptyText,
    items,
    animateBucket,
    animFromIdx,
    setAnimFromIdx,
    sectionSpring,
    successorTween,
    instant,
    reduceMotion,
    sectionRef,
    listRef,
    colorFor,
    onPrimaryAction,
    onDelete,
  } = props;

  const [open, setOpen] = useState(false);

  // Shared enter/exit transitions for rows (typed as TargetAndTransition)
  const enter: TargetAndTransition = reduceMotion
    ? { opacity: 1, height: "auto" }
    : {
        opacity: 1,
        height: "auto",
        transition: { duration: 0.22, ease: EASE_OUT },
      };

  const exit: TargetAndTransition = reduceMotion
    ? {
        opacity: 0,
        height: 0,
        marginTop: 0,
        marginBottom: 0,
        paddingTop: 0,
        paddingBottom: 0,
        borderWidth: 0,
      }
    : {
        opacity: 0,
        height: 0,
        marginTop: 0,
        marginBottom: 0,
        paddingTop: 0,
        paddingBottom: 0,
        borderWidth: 0,
        transition: { duration: 0.22, ease: EASE_OUT },
      };

  // Per-section scroll anchoring
  const withScrollAnchor = (fn: () => void) => {
    const node = listRef?.current;
    const beforeTop = node?.getBoundingClientRect().top ?? 0;
    fn();
    requestAnimationFrame(() => {
      const afterTop = node?.getBoundingClientRect().top ?? 0;
      const delta = afterTop - beforeTop;
      if (Math.abs(delta) > 0) window.scrollBy(0, delta);
    });
  };

  return (
    <div ref={sectionRef} className="border-t border-black/10 pt-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">
          {title} <span className="text-slate-500">({items.length})</span>
        </h3>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="text-sm underline underline-offset-2"
          aria-expanded={open}
        >
          {open ? "Collapse" : "Show all"}
        </button>
      </div>

      <AnimatePresence
        initial={false}
        mode="popLayout"
        onExitComplete={() => setAnimFromIdx(null)}
      >
        {open && (
          <motion.div
            ref={listRef}
            key={`${title}-list`}
            role="list"
            className="mt-2 space-y-2"
            style={{ overflowAnchor: "none" } as CSSProperties}
            // Animate container expand/collapse
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={reduceMotion ? instant : sectionSpring}
            // Enable position reflow animations within the list
            layout={animateBucket ? "position" : false}
            layoutScroll
          >
            {items.length === 0 && (
              <div role="listitem" className="p-3 text-sm text-slate-500">
                {emptyText}
              </div>
            )}

            {items.map((it, idx) => (
              <motion.div
                role="listitem"
                key={it.id}
                className="p-0"
                layout={animateBucket ? "position" : false}
                style={{
                  willChange: animateBucket ? "transform" : undefined,
                  overflow: "hidden",
                }}
                initial={
                  reduceMotion ? { opacity: 1 } : { opacity: 0, height: 0 }
                }
                animate={enter}
                exit={exit}
                transition={{
                  // For position tweens (successors), only animate those below the acted index
                  layout: reduceMotion
                    ? instant
                    : animateBucket && animFromIdx !== null && idx > animFromIdx
                    ? successorTween
                    : instant,
                }}
              >
                <CompactRow
                  item={it}
                  color={colorFor(it.category ?? "Default")}
                  enableSwipeToOpen
                  onPrimaryAction={() => {
                    setAnimFromIdx(idx); // start index for successor tween
                    withScrollAnchor(() => onPrimaryAction(it)); // move back to Open
                  }}
                  onDelete={onDelete}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
