// CompactRow.tsx
// Compact, swipeable row used in "Later" and "In cart" buckets.
// - Right-swipe => send back to Open (visual: list PNG + label)
// - Keeps TrashButton; no other inline actions
// - Parent executes the move via onPrimaryAction()
// - Blueish swipe background to differentiate from cart green

import { useMemo, useRef, useState } from "react";
import { useSwipeable } from "react-swipeable";
import type { Item } from "./ListItem";
import TrashButton from "./ui/TrashButton";
import secondaryListIcon from "../assets/icons/secondaryListIcon.png";

type CompactRowProps = {
  item: Item;
  color: string; // category tint (HSL string)
  onPrimaryAction: () => void; // called on successful right-swipe
  onDelete?: (id: string) => void;
  enableSwipeToOpen?: boolean;
};

export default function CompactRow({
  item,
  color,
  onPrimaryAction,
  onDelete,
  enableSwipeToOpen = true,
}: CompactRowProps) {
  // Visual swipe state
  const [dx, setDx] = useState(0); // current drag offset (px)
  const [isDragging, setDragging] = useState(false);
  const [isCommitting, setCommitting] = useState(false); // lock while firing

  const contentRef = useRef<HTMLDivElement | null>(null);

  // Thresholds
  const MAX_PULL = 120; // max visual pull
  const TRIGGER = 56; // commit threshold

  const handlers = useSwipeable({
    // Only consider right swipes for "send to Open"
    onSwiping: (e) => {
      if (!enableSwipeToOpen || isCommitting) return;
      if (e.dir !== "Right") return;
      setDragging(true);
      const pull = Math.min(Math.max(e.deltaX, 0), MAX_PULL);
      setDx(pull);
    },
    onSwiped: (e) => {
      if (!enableSwipeToOpen || isCommitting) return;
      setDragging(false);
      const shouldCommit = e.dir === "Right" && e.deltaX >= TRIGGER;
      if (shouldCommit) {
        // Lock UI, small nudge for feedback, then delegate to parent
        setCommitting(true);
        setDx(MAX_PULL);
        onPrimaryAction(); // parent removes the row -> AnimatePresence handles exit
        // Safety reset in case parent removal is delayed
        setTimeout(() => {
          setDx(0);
          setCommitting(false);
        }, 220);
      } else {
        // Snap back
        setDx(0);
      }
    },
    trackMouse: true,
    delta: 4, // sensitivity
    preventScrollOnSwipe: true,
  });

  // Background opacity based on pull
  const bgOpacity = useMemo(() => Math.min(dx / TRIGGER, 1), [dx]);

  return (
    <div className="relative select-none" {...handlers}>
      {/* Swipe background with list image + label (blueish wash) */}
      <div
        className="absolute inset-0 flex items-center"
        aria-hidden="true"
        style={{
          pointerEvents: "none",
          opacity: bgOpacity,
          transition: isDragging ? "none" : "opacity 160ms ease-out",
          // Uses token if available; falls back to a blue tone
          background:
            "linear-gradient(to right, hsl(var(--action-open, 210 90% 56%) / 0.10), transparent)",
        }}
      >
        <div className="pl-3 pr-2 flex items-center gap-2">
          <div
            className="inline-flex h-8 w-8 items-center justify-center rounded-md"
            style={{
              background: "hsl(var(--action-open, 210 90% 56%) / 0.15)",
            }}
          >
            <img
              src={secondaryListIcon}
              alt=""
              className="h-5 w-5"
              draggable={false}
            />
          </div>
          <span className="text-sm text-slate-700">Send to list</span>
        </div>
      </div>

      {/* Foreground card; stays white to avoid green/blue bleed */}
      <div
        ref={contentRef}
        className="relative z-1 rounded-md border border-black/10 bg-white shadow-sm px-3 py-2 flex items-center justify-between gap-3"
        style={{
          transform: `translateX(${dx}px)`,
          transition: isDragging ? "none" : "transform 160ms ease-out",
        }}
      >
        {/* Left: color dot + name */}
        <div className="min-w-0 flex items-center gap-2">
          <span
            className="inline-block h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: color }}
            aria-hidden="true"
          />
          <span className="truncate text-sm">{item.name}</span>
        </div>

        {/* Right: Trash only */}
        {onDelete && (
          <TrashButton
            title="Delete item"
            onClick={() => onDelete(item.id)}
            ariaLabel="Delete"
          />
        )}
      </div>
    </div>
  );
}
