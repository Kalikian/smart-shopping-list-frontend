// src/components/CompactRow.tsx
// Compact, swipeable row used inside bucket sections (Later / In cart).

import { useState } from "react";
import { useSwipeable } from "react-swipeable";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import type { Item } from "./ListItem";
import TrashButton from "./ui/TrashButton";
import secondaryListIcon from "../assets/icons/secondaryListIcon.png";

type CompactRowProps = {
  item: Item;
  color: string;
  onPrimaryAction: () => void;
  onDelete?: (id: string) => void;
  enableSwipeToOpen?: boolean;
  /** Gate layout animation for this row */
  layoutEnabled?: boolean;
};

export default function CompactRow({
  item,
  color,
  onPrimaryAction,
  onDelete,
  enableSwipeToOpen = true,
  layoutEnabled = true,
}: CompactRowProps) {
  const { t } = useTranslation("common");
  const [dragX, setDragX] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);

  const CONFIRM_X = 72;
  const MAX_TRANSLATE = 96;

  const handlers = useSwipeable({
    onSwiping: (e) => {
      if (!enableSwipeToOpen) return;
      if (e.dir !== "Right") return; // only allow right swipe
      setIsSwiping(true);
      const clamped = Math.min(Math.max(e.deltaX, 0), MAX_TRANSLATE); // clamp to >= 0
      setDragX(clamped);
    },
    onSwiped: (e) => {
      if (!enableSwipeToOpen) return;
      setIsSwiping(false);
      if (e.dir === "Right" && e.absX >= CONFIRM_X) {
        setDragX(0);
        onPrimaryAction();
        return;
      }
      setDragX(0);
    },
    trackMouse: true,
    preventScrollOnSwipe: true,
  });

  const dragDir = dragX === 0 ? "none" : "right";
  const swipeBg = dragDir === "right" ? "rgba(37,99,235,0.12)" : "transparent";
  const rightOpacity = Math.min(1, Math.abs(dragX) / 60);
  const leftOpacity = 0;

  return (
    <motion.li
      layout={layoutEnabled ? "position" : false}
      initial={false}
      exit={{ opacity: 0, height: 0, marginTop: 0, marginBottom: 0 }}
      transition={{
        layout: layoutEnabled
          ? { type: "spring", stiffness: 380, damping: 36 }
          : undefined,
        opacity: { duration: 0.18 },
        height: { duration: 0.28 },
      }}
      className="list-none marker:hidden px-2 py-2"
    >
      <div className="relative rounded-lg overflow-hidden" {...handlers}>
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ backgroundColor: swipeBg }}
        >
          <div
            className="absolute inset-y-0 left-3 grid place-items-center"
            style={{ opacity: rightOpacity }}
            aria-hidden
          >
            <div className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-blue-500/15">
              <img
                src={secondaryListIcon}
                alt=""
                className="h-5 w-5"
                draggable={false}
              />
            </div>
          </div>
          <div
            className="absolute inset-y-0 right-3 grid place-items-center"
            style={{ opacity: leftOpacity }}
            aria-hidden
          >
            <span className="text-xl">🕒</span>
          </div>
        </div>

        <div
          className="relative min-h-16 px-4 py-3 flex items-center justify-between gap-2 rounded-lg border border-black/10 bg-white transition-[box-shadow,transform] will-change-transform"
          style={{
            transform:
              isSwiping || dragX !== 0
                ? `translateX(${dragX}px)`
                : "translateX(0)",
            boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
          }}
        >
          <div className="min-w-0 flex items-center gap-2">
            <span
              className="inline-block h-2.5 w-2.5 rounded-full shrink-0"
              style={{
                backgroundColor: color || "hsl(var(--cat-neutral, 0 0% 55%))",
              }}
              aria-hidden="true"
            />
            {/* Emphasize label size without bold weight */}
            <span className="truncate text-lg text-slate-900" title={item.name}>
              {item.name}
            </span>
          </div>
          {onDelete && (
            <TrashButton
              onClick={() => onDelete(item.id)}
              ariaLabel={t("buttons.deleteItem", {
                name: item.name,
                defaultValue: `Delete ${item.name}`,
              })}
            />
          )}
        </div>
      </div>
    </motion.li>
  );
}
