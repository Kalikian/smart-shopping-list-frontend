// src/components/CompactRow.tsx
// Compact list row used in Later / In cart sections.
// - Left: item name + meta (qty/unit · category)
// - Right: primary action pill + TrashButton for delete
// - All labels in English; UI-only component.

import TrashButton from "./ui/TrashButton";
import type { CategoryLabel } from "../constants/categories";
import type { Item } from "./ListItem";

type CompactRowProps = {
  item: Item;
  color: string; // HSL string used to tint the left accent (optional in this layout)
  primaryActionLabel: string;
  onPrimaryAction: () => void;
  onDelete?: (id: string) => void;
};

function metaLine(item: Item): string {
  // Build "1 pack · Frozen" like string if data exists
  const qty =
    item.amount != null
      ? `${item.amount}${item.unit ? ` ${item.unit}` : ""}`
      : null;
  const cat: CategoryLabel | undefined = item.category;
  if (qty && cat) return `${qty} · ${cat}`;
  if (qty) return qty;
  if (cat) return `${cat}`;
  return "";
}

export default function CompactRow({
  item,
  primaryActionLabel,
  onPrimaryAction,
  onDelete,
}: CompactRowProps) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-black/10 bg-white/70 px-4 py-3 shadow-sm">
      {/* Left: name + meta */}
      <div className="min-w-0">
        <div className="font-semibold truncate">{item.name}</div>
        <div className="text-sm text-slate-500 truncate">{metaLine(item)}</div>
      </div>

      {/* Right: actions */}
      <div className="ml-3 flex flex-none items-center gap-2">
        <button
          type="button"
          className="rounded-full border border-black/10 px-4 py-1.5 text-sm shadow-sm hover:bg-white"
          onClick={onPrimaryAction}
          aria-label={primaryActionLabel}
          title={primaryActionLabel}
        >
          {primaryActionLabel}
        </button>

        {/* TrashButton component */}
        <TrashButton
          onClick={() => onDelete?.(item.id)}
          title="Delete item"
          ariaLabel="Delete item"
        />
      </div>
    </div>
  );
}
