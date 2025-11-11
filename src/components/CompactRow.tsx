// src/components/CompactRow.tsx
// Presentational compact row for "Later" and "In cart" buckets.
// No <li> wrapper inside — parent list controls motion/layout.
// English comments by request.

import type { Item } from "./ListItem";
import type { CategoryLabel } from "../constants/categories";
import { CATEGORY_ICON_BY_LABEL } from "../constants/categories";

export type CompactRowProps = {
  item: Item;
  color: string;
  primaryActionLabel: string; // e.g., "Move to Open" or "Undo"
  onPrimaryAction: () => void;
  onDelete?: (id: string) => void;
};

export default function CompactRow({
  item,
  color,
  primaryActionLabel,
  onPrimaryAction,
  onDelete,
}: CompactRowProps) {
  const category: CategoryLabel = item.category ?? "Default";
  const iconSrc = CATEGORY_ICON_BY_LABEL[category];

  return (
    <div
      className="flex items-center justify-between gap-3 rounded-xl border bg-white p-3"
      style={{
        borderColor: "rgba(0,0,0,0.12)",
        boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
      }}
    >
      <div className="flex items-center gap-3 min-w-0">
        <span
          className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
          style={{ backgroundColor: color, opacity: 0.2 }}
          aria-hidden
        >
          {iconSrc ? (
            <img
              src={iconSrc}
              alt=""
              className="h-4 w-4 object-contain opacity-80"
            />
          ) : (
            <span className="h-3 w-3 rounded-full bg-black/20 inline-block" />
          )}
        </span>

        <div className="min-w-0">
          <div className="font-medium truncate">{item.name}</div>
          <div className="text-xs text-slate-500">
            {item.amount ?? "–"} {item.unit ?? ""}
            {category !== "Default" ? ` · ${category}` : ""}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onPrimaryAction}
          className="rounded-full px-3 py-1 text-sm border border-black/10 hover:bg-slate-50"
          title={primaryActionLabel}
        >
          {primaryActionLabel}
        </button>

        {onDelete && (
          <button
            type="button"
            onClick={() => onDelete(item.id)}
            className="rounded-full px-3 py-1 text-sm border border-black/10 hover:bg-slate-50"
            title="Delete item"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
}
