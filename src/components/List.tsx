// src/components/List.tsx
// Sectioned list with Open / Later / In cart buckets.
// - Smooth layout animations + same-section scroll anchoring
// - TS-safe easing tuples for framer-motion
// - Buckets trigger move-back-to-Open via onPrimaryAction

import { useEffect, useMemo, useState, useLayoutEffect, useRef } from "react";
import ListItem, { type Item } from "./ListItem";
import type { CategoryLabel } from "../constants/categories";
import { sortItemsByCategory } from "../utils/sortItems";
import AddItemInline, { type AddItemInlineSubmit } from "./AddItemInline";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { Transition, Easing } from "framer-motion";
import BucketSection from "./BucketSection";

type ListProps = {
  items: Item[];
  onToggle?: (id: string) => void;
  onChange: (id: string, patch: Partial<Item>) => void;
  onDelete?: (id: string) => void;
  getColorForCategory: (c: CategoryLabel) => string;
  onAdd?: (payload: AddItemInlineSubmit) => void;
};

const NEUTRAL = `hsl(var(--cat-neutral, 0 0% 55%))`;
type ActionSource = "later" | "done" | null;

// ---- scroll helpers ----
type ScrollEl = Window | Element;
function getScrollParent(el: Element | null): ScrollEl {
  if (!el) return window;
  let p: Element | null = el.parentElement;
  while (p) {
    const { overflowY } = getComputedStyle(p);
    if (/(auto|scroll|overlay)/.test(overflowY)) return p;
    p = p.parentElement;
  }
  return window;
}
function getRelativeTop(el: Element | null, scrollEl: ScrollEl | null): number {
  if (!el) return 0;
  const rect = el.getBoundingClientRect();
  if (!scrollEl || scrollEl === window) return rect.top;
  const host = (scrollEl as Element).getBoundingClientRect();
  return rect.top - host.top;
}
function scrollByDelta(scrollEl: ScrollEl | null, dy: number) {
  if (!dy) return;
  if (!scrollEl || scrollEl === window) window.scrollBy(0, dy);
  else (scrollEl as Element).scrollTop += dy;
}

export default function List({
  items = [],
  onToggle,
  onChange,
  onDelete,
  getColorForCategory,
  onAdd,
}: ListProps) {
  const reduceMotion = useReducedMotion();

  // Sort into buckets
  const sorted = useMemo(() => sortItemsByCategory(items), [items]);
  const openItems = useMemo(
    () => sorted.filter((i) => !i.done && !i.snoozed),
    [sorted]
  );
  const laterItems = useMemo(
    () => sorted.filter((i) => !i.done && i.snoozed),
    [sorted]
  );
  const doneItems = useMemo(() => sorted.filter((i) => i.done), [sorted]);

  const openCount = openItems.length;
  const laterCount = laterItems.length;
  const remaining = openCount + laterCount;

  // Animation flags
  const [laterAnimFromIdx, setLaterAnimFromIdx] = useState<number | null>(null);
  const [doneAnimFromIdx, setDoneAnimFromIdx] = useState<number | null>(null);
  const [actionSource, setActionSource] = useState<ActionSource>(null);

  // Anchoring refs per section
  const laterSectionRef = useRef<HTMLDivElement | null>(null);
  const doneSectionRef = useRef<HTMLDivElement | null>(null);
  const laterListRef = useRef<HTMLDivElement | null>(null);
  const doneListRef = useRef<HTMLDivElement | null>(null);

  // Same-section scroll anchoring state
  const anchorElRef = useRef<Element | null>(null);
  const anchorScrollElRef = useRef<ScrollEl | null>(null);
  const [anchorTopBefore, setAnchorTopBefore] = useState<number | null>(null);
  const [preserveAnchorScroll, setPreserveAnchorScroll] = useState(false);

  // Cleanup flags when lengths change
  useEffect(() => setLaterAnimFromIdx(null), [laterItems.length]);
  useEffect(() => setDoneAnimFromIdx(null), [doneItems.length]);
  useEffect(
    () => setActionSource(null),
    [openItems.length, laterItems.length, doneItems.length]
  );

  // Apply scroll compensation after layout commit
  useLayoutEffect(() => {
    if (!preserveAnchorScroll) return;
    requestAnimationFrame(() => {
      const scroller = anchorScrollElRef.current;
      const before = anchorTopBefore ?? 0;
      const after = getRelativeTop(anchorElRef.current, scroller);
      scrollByDelta(scroller, before - after);
      setPreserveAnchorScroll(false);
      setAnchorTopBefore(null);
      anchorElRef.current = null;
      anchorScrollElRef.current = null;
    });
  }, [
    preserveAnchorScroll,
    anchorTopBefore,
    laterItems.length,
    doneItems.length,
  ]);

  const colorFor = (c: CategoryLabel) =>
    c === "Default" ? NEUTRAL : getColorForCategory(c);

  // ---- Transitions (TS-safe) ----
  const OPEN_ROW_SPRING: Transition = {
    type: "spring",
    stiffness: 360,
    damping: 42,
    mass: 0.6,
  };

  const EASE_IN_OUT: Easing = [0.4, 0, 0.2, 1] as const;

  const SUCCESSOR_ROW_TWEEN: Transition = {
    type: "tween",
    ease: EASE_IN_OUT,
    duration: 0.75,
  };
  const SECTION_SPRING_SOFT: Transition = {
    type: "spring",
    stiffness: 220,
    damping: 32,
  };
  const INSTANT: Transition = { duration: 0 };

  return (
    <section className="space-y-4">
      {/* Header remains always */}
      <header className="flex items-center justify-between">
        <h2 className="text-base font-semibold">
          Remaining <span className="text-slate-500">({remaining})</span>
        </h2>
      </header>

      {/* Inline Add remains always */}
      {onAdd && (
        <div id="add-composer" className="mb-3">
          <AddItemInline onSubmit={onAdd} inputId="add-item-name" />
        </div>
      )}

      {/* OPEN bucket */}
      <div role="list">
        <AnimatePresence initial={false}>
          {openItems.map((it) => (
            <motion.div
              role="listitem"
              key={it.id}
              layout={!actionSource}
              exit={{ opacity: 0, height: 0, margin: 0 }}
              transition={
                reduceMotion
                  ? INSTANT
                  : actionSource
                  ? INSTANT
                  : OPEN_ROW_SPRING
              }
              className="mb-2"
            >
              <ListItem
                item={it}
                onToggle={onToggle ?? (() => {})}
                onChange={(patch) => onChange(it.id, patch)}
                onDelete={onDelete}
                color={colorFor(it.category ?? "Default")}
              />
            </motion.div>
          ))}
          {openItems.length === 0 && (
            <motion.div
              role="listitem"
              key="empty-open"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, height: 0, margin: 0 }}
              className="p-3 text-sm text-slate-500"
            >
              Nothing open.
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* LATER */}
      <BucketSection
        title="Later"
        emptyText="Nothing parked for later."
        items={laterItems}
        animateBucket={actionSource === "later"}
        animFromIdx={laterAnimFromIdx}
        setAnimFromIdx={setLaterAnimFromIdx}
        sectionSpring={SECTION_SPRING_SOFT}
        successorTween={SUCCESSOR_ROW_TWEEN}
        instant={INSTANT}
        reduceMotion={!!reduceMotion}
        sectionRef={laterSectionRef}
        listRef={laterListRef}
        colorFor={colorFor}
        onPrimaryAction={(it) => {
          setActionSource("later");
          const anchorEl = laterSectionRef.current ?? laterListRef.current;
          const scroller = getScrollParent(anchorEl || null);
          anchorElRef.current = anchorEl || null;
          anchorScrollElRef.current = scroller;
          setAnchorTopBefore(getRelativeTop(anchorEl || null, scroller));
          setPreserveAnchorScroll(true);
          onChange(it.id, { snoozed: false }); // back to Open
        }}
        onDelete={onDelete}
      />

      {/* IN CART */}
      <BucketSection
        title="In cart"
        emptyText="No items in cart."
        items={doneItems}
        animateBucket={actionSource === "done"}
        animFromIdx={doneAnimFromIdx}
        setAnimFromIdx={setDoneAnimFromIdx}
        sectionSpring={SECTION_SPRING_SOFT}
        successorTween={SUCCESSOR_ROW_TWEEN}
        instant={INSTANT}
        reduceMotion={!!reduceMotion}
        sectionRef={doneSectionRef}
        listRef={doneListRef}
        colorFor={colorFor}
        onPrimaryAction={(it) => {
          setActionSource("done");
          const anchorEl = doneSectionRef.current ?? doneListRef.current;
          const scroller = getScrollParent(anchorEl || null);
          anchorElRef.current = anchorEl || null;
          anchorScrollElRef.current = scroller;
          setAnchorTopBefore(getRelativeTop(anchorEl || null, scroller));
          setPreserveAnchorScroll(true);
          onChange(it.id, { done: false }); // back to Open
        }}
        onDelete={onDelete}
      />
    </section>
  );
}
