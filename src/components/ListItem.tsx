// src/components/ListItem.tsx
// Swipe-to-cart UX (right swipe => mark done), no local collapse.
// Visual swipe backgrounds + icons. All labels in English.

import { useMemo, useState } from "react";
import { useSwipeable } from "react-swipeable";
import {
  CATEGORY_ICON_BY_LABEL,
  CATEGORIES,
  UNITS,
  type CategoryLabel,
  type Unit,
} from "../constants/categories";
import TrashButton from "./ui/TrashButton";

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
  onToggle: (id: string) => void; // (kept for compatibility, not used here)
  onChange: (patch: Partial<Item>) => void;
  onDelete?: (id: string) => void;
  color: string;
};

// Build translucent tint from various color formats
function alphaTint(input: string, alpha = 0.12): string {
  const a = Math.max(0, Math.min(1, alpha));
  if (input.startsWith("hsl(")) return input.replace(/\)$/, ` / ${a})`);
  if (input.startsWith("rgb("))
    return input.replace(/^rgb\(/, "rgba(").replace(/\)$/, `, ${a})`);
  if (input.startsWith("#")) {
    const hex = input.slice(1);
    const norm =
      hex.length === 3
        ? hex
            .split("")
            .map((c) => c + c)
            .join("")
        : hex;
    const r = parseInt(norm.slice(0, 2), 16);
    const g = parseInt(norm.slice(2, 4), 16);
    const b = parseInt(norm.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${a})`;
  }
  if (input.startsWith("var(")) return `hsl(${input} / ${a})`;
  return "rgba(0,0,0,0.06)";
}

export default function ListItem({
  item,
  onChange,
  onDelete,
  color,
}: ListItemProps) {
  // ----- Quantity helpers (mobile-friendly with +/-) -----
  const isDecimal = item.unit === "kg" || item.unit === "L";
  const step = isDecimal ? 0.1 : 1;

  const parseAmount = (raw: string): number | undefined => {
    const norm = raw.trim().replace(",", ".");
    if (norm === "") return undefined;
    const num = Number(norm);
    if (!Number.isFinite(num) || num < 0) return 0;
    return isDecimal ? Math.round(num * 10) / 10 : Math.trunc(num);
  };

  const inc = () => {
    const base = item.amount ?? 1;
    const next = isDecimal
      ? Math.round((base + step) * 10) / 10
      : Math.max(0, Math.trunc(base + step));
    onChange({ amount: next });
  };

  const dec = () => {
    const base = item.amount ?? 1;
    const nextRaw = base - step;
    const next = isDecimal
      ? Math.max(0, Math.round(nextRaw * 10) / 10)
      : Math.max(0, Math.trunc(nextRaw));
    onChange({ amount: next });
  };

  const onAmountTyped: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const parsed = parseAmount(e.target.value);
    onChange({ amount: parsed });
  };

  const onAmountKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    const allowed = [
      "Backspace",
      "Delete",
      "ArrowLeft",
      "ArrowRight",
      "Tab",
      "Home",
      "End",
    ];
    const decimalChars = [",", "."];
    if (allowed.includes(e.key)) return;
    if (decimalChars.includes(e.key) && isDecimal) return;
    if (!/^[0-9]$/.test(e.key)) e.preventDefault();
  };

  // ----- Colors / tokens -----
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

  // ----- Swipe state -----
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
        onChange({ done: true }); // in cart
        return;
      }
      if (e.dir === "Left" && e.absX >= CONFIRM_X) {
        setDragX(0);
        onChange({ snoozed: true }); // move to Later
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
      ? "rgba(16,185,129,0.15)" // green-ish for "in cart"
      : dragDir === "left"
      ? "rgba(234,179,8,0.15)" // amber-ish for "later"
      : "transparent";

  const qtyId = `qty-${item.id}`;

  return (
    <li className="p-2">
      <div className="relative rounded-2xl overflow-hidden" {...handlers}>
        {/* Swipe background layer */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ backgroundColor: swipeBg }}
        >
          {/* Right swipe icon (cart) */}
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
          {/* Left swipe icon (clock) */}
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

        {/* Foreground card that translates with finger */}
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
              <span
                className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs"
                style={{
                  backgroundColor: isDefault
                    ? "#ffffff"
                    : alphaTint(effectiveColor!, 0.16),
                  boxShadow: isDefault
                    ? "0 0 0 1px rgba(0,0,0,0.12) inset"
                    : `0 0 0 1px ${alphaTint(effectiveColor!, 0.35)} inset`,
                }}
                title={categoryLabel}
              >
                {CATEGORY_ICON_BY_LABEL[categoryLabel] ? (
                  <img
                    src={CATEGORY_ICON_BY_LABEL[categoryLabel]}
                    alt=""
                    className="h-4 w-4 object-contain"
                    draggable={false}
                  />
                ) : (
                  <span className="h-4 w-4 inline-block rounded-full bg-black/10" />
                )}
                <span className="hidden sm:inline">{categoryLabel}</span>
              </span>

              {onDelete && (
                <TrashButton
                  onClick={() => onDelete(item.id)}
                  ariaLabel={`Delete ${item.name}`}
                />
              )}
            </div>
          </div>

          {/* Details with uniform labels */}
          <div className="grid grid-cols-1 gap-3 w-full sm:flex sm:items-start sm:gap-4">
            {/* Qty */}
            <div className="block sm:basis-0 sm:flex-1">
              <label
                htmlFor={qtyId}
                className="block text-xs font-medium text-slate-500 mb-1"
              >
                Qty
              </label>

              <div className="sm:flex sm:justify-center">
                <div
                  className="inline-flex sm:w-full sm:max-w-60 items-stretch rounded-full border border-black/10 bg-white overflow-hidden
                   transition focus-within:border-[hsl(var(--accent))] focus-within:ring-2 focus-within:ring-[hsl(var(--accent))/0.35]"
                >
                  <button
                    type="button"
                    onClick={dec}
                    className="w-10 h-10 grid place-items-center select-none hover:bg-slate-50 focus:outline-none"
                    aria-label="Decrease quantity"
                    title="Decrease"
                  >
                    –
                  </button>

                  <input
                    id={qtyId}
                    type="text"
                    inputMode={isDecimal ? "decimal" : "numeric"}
                    onWheel={(e) =>
                      (e.currentTarget as HTMLInputElement).blur()
                    }
                    className="h-10 w-20 sm:w-24 text-center outline-none px-2 border-0 focus:ring-0"
                    value={item.amount ?? ""}
                    onChange={onAmountTyped}
                    onKeyDown={onAmountKeyDown}
                    aria-label="Quantity"
                  />

                  <button
                    type="button"
                    onClick={inc}
                    className="w-10 h-10 grid place-items-center select-none hover:bg-slate-50 focus:outline-none"
                    aria-label="Increase quantity"
                    title="Increase"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Unit */}
            <label className="block sm:basis-0 sm:flex-1">
              <span className="block text-xs font-medium text-slate-500 mb-1">
                Unit
              </span>
              <select
                className="select-fix w-full dark:border-neutral-700 dark:bg-neutral-900"
                value={item.unit ?? ""}
                onChange={(e) =>
                  onChange({
                    unit: (e.target.value || undefined) as Unit | undefined,
                  })
                }
                aria-label="Unit"
              >
                <option value="">Unit</option>
                {UNITS.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </label>

            {/* Category */}
            <label className="block sm:basis-0 sm:flex-1">
              <span className="block text-xs font-medium text-slate-500 mb-1">
                Category
              </span>
              <select
                className="select-fix w-full dark:border-neutral-700 dark:bg-neutral-900"
                value={categoryLabel}
                onChange={(e) =>
                  onChange({ category: e.target.value as CategoryLabel })
                }
                aria-label="Category"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
      </div>
    </li>
  );
}
