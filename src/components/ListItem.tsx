// src/components/ListItem.tsx
// Swipe-to-cart UX (right => done), left => snooze. Composition of lean sub-components.

import { useMemo, useState } from "react";
import { useSwipeable } from "react-swipeable";
import { type CategoryLabel, type Unit } from "../constants/categories";
import TrashButton from "./ui/TrashButton";

import QuantityField from "./list-item/QuantityField";
import UnitSelect from "./list-item/UnitSelect";
import CategorySelect from "./list-item/CategorySelect";
import CategoryBadge from "./list-item/CategoryBadge";
import { alphaTint } from "../utils/color";

export type Item = {
  id: string;
  name: string;
  done: boolean;
  amount?: number;
  unit?: Unit;
  category?: CategoryLabel;
  snoozed?: boolean;
};

type ListItemProps = {
  item: Item;
  onToggle: (id: string) => void; // kept for compatibility
  onChange: (patch: Partial<Item>) => void;
  onDelete?: (id: string) => void;
  color: string;
};

export default function ListItem({
  item,
  onChange,
  onDelete,
  color,
}: ListItemProps) {
  // --- Colors / tokens (kept local for visual cohesion) ---
  const categoryLabel: CategoryLabel = item.category ?? "Default";
  const isDefault = categoryLabel === "Default";
  const effectiveColor = isDefault ? undefined : color;

  const bgTint = useMemo(
    () => (isDefault ? "#ffffff" : alphaTint(effectiveColor!, 0.1)),
    [effectiveColor, isDefault]
  );
  const brdTint = useMemo(
    () => (isDefault ? "rgba(0,0,0,0.12)" : alphaTint(effectiveColor!, 0.35)),
    [effectiveColor, isDefault]
  );
  const leftAccent = useMemo(
    () =>
      isDefault
        ? "inset 0 0 0 0 transparent"
        : `inset 6px 0 0 0 ${effectiveColor}`,
    [effectiveColor, isDefault]
  );
  const softDrop = "0 1px 2px rgba(0,0,0,0.04)";

  // --- Swipe state ---
  const [dragX, setDragX] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const CONFIRM_X = 72;
  const MAX_TRANSLATE = 96;

  const handlers = useSwipeable({
    onSwiping: (e) => {
      setIsSwiping(true);
      const clamped =
        e.deltaX > 0
          ? Math.min(e.deltaX, MAX_TRANSLATE)
          : Math.max(e.deltaX, -MAX_TRANSLATE);
      setDragX(clamped);
    },
    onSwiped: (e) => {
      setIsSwiping(false);
      if (e.dir === "Right" && e.absX >= CONFIRM_X) {
        setDragX(0);
        onChange({ done: true });
        return;
      }
      if (e.dir === "Left" && e.absX >= CONFIRM_X) {
        setDragX(0);
        onChange({ snoozed: true });
        return;
      }
      setDragX(0);
    },
    trackMouse: true,
    preventScrollOnSwipe: true,
  });

  const dragDir = dragX === 0 ? "none" : dragX > 0 ? "right" : "left";
  const swipeBg =
    dragDir === "right"
      ? "rgba(16,185,129,0.15)"
      : dragDir === "left"
      ? "rgba(234,179,8,0.15)"
      : "transparent";

  const qtyId = `qty-${item.id}`;

  return (
    <li className="list-none marker:hidden p-2">
      <div className="relative rounded-2xl overflow-hidden" {...handlers}>
        {/* Swipe background */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ backgroundColor: swipeBg }}
        >
          <div
            className="absolute inset-y-0 left-3 grid place-items-center"
            style={{
              opacity:
                dragDir === "right" ? Math.min(1, Math.abs(dragX) / 60) : 0,
            }}
            aria-hidden
          >
            <span className="text-2xl">🛒</span>
          </div>
          <div
            className="absolute inset-y-0 right-3 grid place-items-center"
            style={{
              opacity:
                dragDir === "left" ? Math.min(1, Math.abs(dragX) / 60) : 0,
            }}
            aria-hidden
          >
            <span className="text-2xl">🕒</span>
          </div>
        </div>

        {/* Foreground card */}
        <div
          className="relative flex flex-col gap-3 rounded-2xl border shadow-sm p-3 hover:shadow-md transition-[box-shadow,transform] will-change-transform"
          style={{
            transform:
              isSwiping || dragX !== 0
                ? `translateX(${dragX}px)`
                : "translateX(0)",
            backgroundColor: bgTint,
            borderColor: brdTint,
            boxShadow: isDefault ? softDrop : `${leftAccent}, ${softDrop}`,
          }}
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <div
                className="text-left font-semibold text-lg min-w-0 truncate"
                title={item.name}
              >
                {item.name}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <CategoryBadge label={categoryLabel} color={effectiveColor} />
              {onDelete && (
                <TrashButton
                  onClick={() => onDelete(item.id)}
                  ariaLabel={`Delete ${item.name}`}
                />
              )}
            </div>
          </div>

          {/* Details */}
          <div className="grid grid-cols-1 gap-3 w-full sm:flex sm:items-start sm:gap-4">
            <QuantityField
              id={qtyId}
              amount={item.amount}
              unit={item.unit}
              onChange={(next) => onChange({ amount: next })}
            />
            <UnitSelect
              value={item.unit}
              onChange={(u) => onChange({ unit: u })}
            />
            <CategorySelect
              value={categoryLabel}
              onChange={(c) => onChange({ category: c })}
            />
          </div>
        </div>
      </div>
    </li>
  );
}
