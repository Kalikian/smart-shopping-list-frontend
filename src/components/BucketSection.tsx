// Generic collapsible/animated bucket for "Later" and "In cart".
// Parent provides: items, animation flags, refs, and the business action.

import { type CSSProperties, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import CompactRow from "./CompactRow";
import type { Item } from "./ListItem";
import type { Transition } from "framer-motion";
import type { CategoryLabel } from "../constants/categories";

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
  primaryActionLabel: string;
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
    primaryActionLabel,
    onPrimaryAction,
    onDelete,
  } = props;

  const [open, setOpen] = useState(false);

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

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            ref={listRef}
            key={`${title}-list`}
            role="list"
            className="mt-2 space-y-2"
            style={{ overflowAnchor: "none" } as CSSProperties}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={reduceMotion ? instant : sectionSpring}
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
                layout={animateBucket ? "position" : false}
                style={{
                  willChange: animateBucket ? "transform" : undefined,
                  overflow: "hidden",
                }}
                exit={{
                  opacity: 0,
                  height: 0,
                  marginTop: 0,
                  marginBottom: 0,
                  paddingTop: 0,
                  paddingBottom: 0,
                  borderWidth: 0,
                  transition: reduceMotion
                    ? instant
                    : { duration: 0.22, ease: "easeOut" },
                }}
                transition={{
                  layout: reduceMotion
                    ? instant
                    : animateBucket && animFromIdx !== null && idx > animFromIdx
                    ? successorTween
                    : instant,
                }}
                className="p-2"
              >
                <CompactRow
                  item={it}
                  color={colorFor(it.category ?? "Default")}
                  primaryActionLabel={primaryActionLabel}
                  onPrimaryAction={() => {
                    setAnimFromIdx(idx); // define start index here
                    onPrimaryAction(it);
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
