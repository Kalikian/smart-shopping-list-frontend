// src/components/List.tsx
// Selective bucket animations + same-section scroll anchoring.
// - Only successors in the acted bucket tween; other buckets are static
// - When acting in Later/In cart, viewport stays anchored on that section
// - Uses nearest scrollable ancestor for robust scroll compensation

import { useEffect, useMemo, useState, useLayoutEffect, useRef } from "react";
import ListItem, { type Item } from "./ListItem";
import type { CategoryLabel } from "../constants/categories";
import { sortItemsByCategory } from "../utils/sortItems";
import AddItemInline, { type AddItemInlineSubmit } from "./AddItemInline";
import CompactRow from "./CompactRow";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { Transition } from "framer-motion";

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

  // 1) sort & buckets
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

  // 2) collapsible
  const [showLater, setShowLater] = useState(false);
  const [showDone, setShowDone] = useState(false);

  // 3) selective animation flags
  const [laterAnimFromIdx, setLaterAnimFromIdx] = useState<number | null>(null);
  const [doneAnimFromIdx, setDoneAnimFromIdx] = useState<number | null>(null);
  const [actionSource, setActionSource] = useState<ActionSource>(null);

  // 4) section refs (outer wrappers) + list refs (inner lists)
  const laterSectionRef = useRef<HTMLDivElement | null>(null);
  const doneSectionRef = useRef<HTMLDivElement | null>(null);
  const laterListRef = useRef<HTMLDivElement | null>(null);
  const doneListRef = useRef<HTMLDivElement | null>(null);

  // 5) same-section anchoring state
  const anchorElRef = useRef<Element | null>(null);
  const anchorScrollElRef = useRef<ScrollEl | null>(null);
  const [anchorTopBefore, setAnchorTopBefore] = useState<number | null>(null);
  const [preserveAnchorScroll, setPreserveAnchorScroll] = useState(false);

  // 6) stable cleanups
  useEffect(() => {
    setLaterAnimFromIdx(null);
  }, [laterItems.length]);
  useEffect(() => {
    setDoneAnimFromIdx(null);
  }, [doneItems.length]);
  useEffect(() => {
    setActionSource(null);
  }, [openItems.length, laterItems.length, doneItems.length]);

  // 7) apply scroll compensation after layout
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

  // 8) transitions
  const OPEN_ROW_SPRING: Transition = {
    type: "spring",
    stiffness: 360,
    damping: 42,
    mass: 0.6,
  };
  const SUCCESSOR_ROW_TWEEN: Transition = {
    type: "tween",
    ease: "easeInOut",
    duration: 0.75, // calmer upward shift; tweak 0.7–0.85 if needed
  };
  const SECTION_SPRING_SOFT: Transition = {
    type: "spring",
    stiffness: 220,
    damping: 32,
  };
  const INSTANT: Transition = { duration: 0 };

  // 9) convenience flags
  const animateLater = actionSource === "later";
  const animateDone = actionSource === "done";

  return (
    <section className="space-y-4">
      {/* Open header */}
      <header className="flex items-center justify-between">
        <h2 className="text-base font-semibold">
          Remaining <span className="text-slate-500">({remaining})</span>
        </h2>
      </header>

      {/* Inline Add */}
      {onAdd && (
        <div id="add-composer" className="mb-3">
          <AddItemInline onSubmit={onAdd} inputId="add-item-name" />
        </div>
      )}

      {/* OPEN bucket — snappy while lower bucket animates */}
      <div role="list">
        <AnimatePresence initial={false}>
          {openItems.map((it) => (
            <motion.div
              role="listitem"
              key={it.id}
              layout={!actionSource} // disable while later/done animates
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

      {/* LATER section */}
      <div ref={laterSectionRef} className="border-t border-black/10 pt-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">
            Later <span className="text-slate-500">({laterItems.length})</span>
          </h3>
          <button
            type="button"
            onClick={() => setShowLater((v) => !v)}
            className="text-sm underline underline-offset-2"
            aria-expanded={showLater}
          >
            {showLater ? "Collapse" : "Show all"}
          </button>
        </div>

        <AnimatePresence initial={false}>
          {showLater && (
            <motion.div
              ref={laterListRef}
              key="later-list"
              role="list"
              className="mt-2 space-y-2"
              style={{ overflowAnchor: "none" } as React.CSSProperties}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={reduceMotion ? INSTANT : SECTION_SPRING_SOFT}
            >
              {laterItems.length === 0 && (
                <div role="listitem" className="p-3 text-sm text-slate-500">
                  Nothing parked for later.
                </div>
              )}

              {laterItems.map((it, idx) => (
                <motion.div
                  role="listitem"
                  key={it.id}
                  // Only animate layout for this bucket while it is the action source
                  layout={animateLater ? "position" : false}
                  style={{
                    willChange: animateLater ? "transform" : undefined,
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
                      ? INSTANT
                      : { duration: 0.22, ease: "easeOut" },
                  }}
                  transition={{
                    layout: reduceMotion
                      ? INSTANT
                      : animateLater &&
                        laterAnimFromIdx !== null &&
                        idx > laterAnimFromIdx
                      ? SUCCESSOR_ROW_TWEEN
                      : INSTANT,
                  }}
                  className="p-2"
                >
                  <CompactRow
                    item={it}
                    color={colorFor(it.category ?? "Default")}
                    primaryActionLabel="Move to Open"
                    onPrimaryAction={() => {
                      // Same-section anchor: Later
                      setActionSource("later");
                      setLaterAnimFromIdx(idx);

                      const anchorEl =
                        laterSectionRef.current ?? laterListRef.current;
                      const scroller = getScrollParent(anchorEl || null);
                      anchorElRef.current = anchorEl || null;
                      anchorScrollElRef.current = scroller;
                      setAnchorTopBefore(
                        getRelativeTop(anchorEl || null, scroller)
                      );
                      setPreserveAnchorScroll(true);

                      onChange(it.id, { snoozed: false });
                    }}
                    onDelete={onDelete}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* IN CART section */}
      <div ref={doneSectionRef} className="border-t border-black/10 pt-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">
            In cart <span className="text-slate-500">({doneItems.length})</span>
          </h3>
          <button
            type="button"
            onClick={() => setShowDone((v) => !v)}
            className="text-sm underline underline-offset-2"
            aria-expanded={showDone}
          >
            {showDone ? "Collapse" : "Show all"}
          </button>
        </div>

        <AnimatePresence initial={false}>
          {showDone && (
            <motion.div
              ref={doneListRef}
              key="done-list"
              role="list"
              className="mt-2 space-y-2"
              style={{ overflowAnchor: "none" } as React.CSSProperties}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={reduceMotion ? INSTANT : SECTION_SPRING_SOFT}
            >
              {doneItems.length === 0 && (
                <div role="listitem" className="p-3 text-sm text-slate-500">
                  No items in cart.
                </div>
              )}

              {doneItems.map((it, idx) => (
                <motion.div
                  role="listitem"
                  key={it.id}
                  layout={animateDone ? "position" : false}
                  style={{
                    willChange: animateDone ? "transform" : undefined,
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
                      ? INSTANT
                      : { duration: 0.22, ease: "easeOut" },
                  }}
                  transition={{
                    layout: reduceMotion
                      ? INSTANT
                      : animateDone &&
                        doneAnimFromIdx !== null &&
                        idx > doneAnimFromIdx
                      ? SUCCESSOR_ROW_TWEEN
                      : INSTANT,
                  }}
                  className="p-2"
                >
                  <CompactRow
                    item={it}
                    color={colorFor(it.category ?? "Default")}
                    primaryActionLabel="Undo"
                    onPrimaryAction={() => {
                      // Same-section anchor: In cart
                      setActionSource("done");
                      setDoneAnimFromIdx(idx);

                      const anchorEl =
                        doneSectionRef.current ?? doneListRef.current;
                      const scroller = getScrollParent(anchorEl || null);
                      anchorElRef.current = anchorEl || null;
                      anchorScrollElRef.current = scroller;
                      setAnchorTopBefore(
                        getRelativeTop(anchorEl || null, scroller)
                      );
                      setPreserveAnchorScroll(true);

                      onChange(it.id, { done: false });
                    }}
                    onDelete={onDelete}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
