// src/components/ListItem.tsx
// Compact swipeable row with inline editor toggle.

import { useMemo, useState } from "react";
import { useSwipeable } from "react-swipeable";
import { type CategoryLabel, type Unit } from "../constants/categories";
import TrashButton from "./ui/TrashButton";
import CategoryBadge from "./list-item/CategoryBadge";
import { alphaTint } from "../utils/color";
import EditItemInline from "./EditItemInline";

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
  onToggle?: (id: string) => void; // kept for compatibility
  onChange: (patch: Partial<Item>) => void;
  onDelete?: (id: string) => void;
  color: string; // category color token (e.g., "hsl(var(--cat-produce))")
};

// Neutral icon-only button (like TrashButton, but neutral)
function IconButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="h-8 w-8 grid place-items-center rounded-md text-slate-700 hover:bg-black/5 active:bg-black/10"
    >
      {children}
    </button>
  );
}

// Tiny pencil SVG
function EditIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 20 20"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      aria-hidden
      {...props}
    >
      <path d="M12.7 3.3l4 4L7 17H3v-4l9.7-9.7z" />
      <path d="M11 5l4 4" />
    </svg>
  );
}

export default function ListItem({
  item,
  onChange,
  onDelete,
  color,
}: ListItemProps) {
  const [editing, setEditing] = useState(false);

  // --- Category / color tokens ------------------------------------------------
  const categoryLabel: CategoryLabel = item.category ?? "Default";
  const isDefault = categoryLabel === "Default";
  const effectiveColor = isDefault ? undefined : color;

  const bgTint = useMemo(
    () => (isDefault ? "#fff" : alphaTint(effectiveColor!, 0.06)),
    [effectiveColor, isDefault]
  );
  const brdTint = useMemo(
    () => (isDefault ? "rgba(0,0,0,0.10)" : alphaTint(effectiveColor!, 0.22)),
    [effectiveColor, isDefault]
  );

  // --- Swipe state ------------------------------------------------------------
  const [dragX, setDragX] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const CONFIRM_X = 72;
  const MAX_TRANSLATE = 96;

  const handlers = useSwipeable({
    onSwiping: (e) => {
      if (editing) return; // disable swipe while editing
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

  // --- Inline edit actions ----------------------------------------------------
  const handleEditOpen = () => setEditing(true);
  const handleEditCancel = () => setEditing(false);
  const handleEditApply = (patch: Partial<Item>) => {
    onChange(patch);
    setEditing(false);
  };

  return (
    <li className="list-none marker:hidden px-2 py-1">
      {/* When editing: render editor inline, same card container */}
      {editing ? (
        <EditItemInline
          item={item}
          onApply={handleEditApply}
          onCancel={handleEditCancel}
        />
      ) : (
        <div className="relative rounded-lg overflow-hidden" {...handlers}>
          {/* Swipe background layer */}
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
              <span className="text-xl">🛒</span>
            </div>
            <div
              className="absolute inset-y-0 right-3 grid place-items-center"
              style={{
                opacity:
                  dragDir === "left" ? Math.min(1, Math.abs(dragX) / 60) : 0,
              }}
              aria-hidden
            >
              <span className="text-xl">🕒</span>
            </div>
          </div>

          {/* Foreground row */}
          <div
            className="relative h-11 px-2 flex items-center justify-between gap-2 rounded-lg border transition-[box-shadow,transform] will-change-transform"
            style={{
              transform:
                isSwiping || dragX !== 0
                  ? `translateX(${dragX}px)`
                  : "translateX(0)",
              backgroundColor: bgTint,
              borderColor: brdTint,
              boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
            }}
          >
            {/* LEFT: Category logo + name/qty/unit */}
            <div className="min-w-0 flex items-center gap-2">
              <div className="shrink-0">
                <CategoryBadge label={categoryLabel} color={effectiveColor} />
              </div>
              <div className="min-w-0 flex items-center gap-2 text-sm">
                <span
                  className="font-medium truncate max-w-[48vw]"
                  title={item.name}
                >
                  {item.name}
                </span>
                <span className="text-slate-500">·</span>
                <span className="tabular-nums text-slate-700">{qtyTxt}</span>
                {unitTxt && <span className="text-slate-700">{unitTxt}</span>}
              </div>
            </div>

            {/* RIGHT: Edit + Trash */}
            <div className="flex items-center gap-1 shrink-0">
              <IconButton label={`Edit ${item.name}`} onClick={handleEditOpen}>
                <EditIcon />
              </IconButton>
              {onDelete && (
                <TrashButton
                  onClick={() => onDelete(item.id)}
                  ariaLabel={`Delete ${item.name}`}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </li>
  );
}
