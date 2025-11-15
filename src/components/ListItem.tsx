// src/components/ListItem.tsx
// Swipeable row with inline editor.
// Larger typography + taller row to match FeatureTiles.

import { useMemo, useState } from "react";
import { useSwipeable } from "react-swipeable";
import { useTranslation } from "react-i18next";
import { type CategoryLabel, type Unit } from "../constants/categories";
import TrashButton from "./ui/TrashButton";
import CategoryBadge from "./list-item/CategoryBadge";
import { alphaTint } from "../utils/color";
import EditItemInline from "./EditItemInline";
import IconButton from "./ui/IconButton";
import EditIcon from "./ui/EditIcon";

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
  onToggle?: (id: string) => void;
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
  const { t } = useTranslation("common");
  const [editing, setEditing] = useState(false);

  const categoryLabel: CategoryLabel = item.category ?? "Default";
  const isDefault = categoryLabel === "Default";
  const effectiveColor = isDefault ? undefined : color;

  // Soft gradient background instead of flat color
  const bgGradient = useMemo(() => {
    if (isDefault) {
      // Neutral, aber leicht lebendiger als reines Weiß
      return "linear-gradient(135deg,#ffffff,#f8fafc)";
    }
    const base = alphaTint(effectiveColor!, 0.06); // top
    const strong = alphaTint(effectiveColor!, 0.18); // bottom
    return `linear-gradient(135deg, ${base}, ${strong})`;
  }, [effectiveColor, isDefault]);

  const brdTint = useMemo(
    () => (isDefault ? "rgba(0,0,0,0.10)" : alphaTint(effectiveColor!, 0.22)),
    [effectiveColor, isDefault]
  );

  const [dragX, setDragX] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const CONFIRM_X = 72;
  const MAX_TRANSLATE = 96;

  const handlers = useSwipeable({
    onSwiping: (e) => {
      if (editing) return;
      setIsSwiping(true);
      const clamped =
        e.deltaX > 0
          ? Math.min(e.deltaX, MAX_TRANSLATE)
          : Math.max(e.deltaX, -MAX_TRANSLATE);
      setDragX(clamped);
    },
    onSwiped: (e) => {
      if (editing) return;
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

  const qtyTxt =
    typeof item.amount === "number" && !Number.isNaN(item.amount)
      ? String(item.amount)
      : "—";
  const unitTxt = item.unit ?? "";

  const handleEditOpen = () => setEditing(true);
  const handleEditCancel = () => setEditing(false);
  const handleEditApply = (patch: Partial<Item>) => {
    onChange(patch);
    setEditing(false);
  };

  return (
    <li className="list-none marker:hidden px-2 py-2">
      {editing ? (
        <EditItemInline
          item={item}
          onApply={handleEditApply}
          onCancel={handleEditCancel}
        />
      ) : (
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
              <span className="text-[26px]">🛒</span>
            </div>
            <div
              className="absolute inset-y-0 right-3 grid place-items-center"
              style={{
                opacity:
                  dragDir === "left" ? Math.min(1, Math.abs(dragX) / 60) : 0,
              }}
              aria-hidden
            >
              <span className="text-[26px]">🕒</span>
            </div>
          </div>

          {/* Foreground row — tall like FeatureTiles */}
          <div
            className="relative min-h-16 px-4 py-3 flex items-center justify-between gap-3 rounded-2xl border shadow-sm transition-[box-shadow,transform] will-change-transform"
            style={{
              transform:
                isSwiping || dragX !== 0
                  ? `translateX(${dragX}px)`
                  : "translateX(0)",
              background: bgGradient,
              borderColor: brdTint,
            }}
          >
            {/* LEFT */}
            <div className="min-w-0 flex items-center gap-3">
              <div className="shrink-0">
                <CategoryBadge
                  category={categoryLabel}
                  color={effectiveColor}
                />
              </div>
              <div className="min-w-0 flex items-center gap-2 text-lg">
                <span className="text-slate-900 truncate max-w-[58vw]">
                  {item.name}
                </span>
                <span className="text-slate-600">·</span>
                <span className="tabular-nums text-slate-800 text-base">
                  {qtyTxt}
                </span>
                {unitTxt && (
                  <span className="text-slate-800 text-base">{unitTxt}</span>
                )}
              </div>
            </div>

            {/* RIGHT */}
            <div className="flex items-center gap-2 shrink-0">
              <IconButton
                aria-label={t("buttons.editItem", {
                  name: item.name,
                  defaultValue: `Edit ${item.name}`,
                })}
                onClick={handleEditOpen}
              >
                <EditIcon />
              </IconButton>
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
        </div>
      )}
    </li>
  );
}
