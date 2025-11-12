// src/components/EditItemInline.tsx
import AddItemInline, { type AddItemInlineSubmit } from "./AddItemInline";
import type { Item } from "./ListItem";
import { X } from "lucide-react";

type EditItemInlineProps = {
  item: Item;
  onApply: (patch: Partial<Item>) => void;
  onCancel: () => void;
};

export default function EditItemInline({
  item,
  onApply,
  onCancel,
}: EditItemInlineProps) {
  const initial: AddItemInlineSubmit = {
    name: item.name ?? "",
    amount:
      typeof item.amount === "number" && !Number.isNaN(item.amount)
        ? item.amount
        : 1,
    unit: item.unit ?? "pcs",
    category: item.category ?? "Default",
  };

  const handleSubmit = (payload: AddItemInlineSubmit) => {
    const patch: Partial<Item> = {
      name: payload.name?.trim() || item.name,
      amount: payload.amount,
      unit: payload.unit,
      category: payload.category,
    };
    onApply(patch);
  };

  return (
    <div className="rounded-xl border border-black/10 bg-white shadow-sm p-2">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-semibold">Edit item</h4>
        <button
          type="button"
          onClick={onCancel}
          className="h-8 w-8 grid place-items-center rounded-md hover:bg-black/5"
          aria-label="Cancel edit"
          title="Cancel"
        >
          <X className="h-4 w-4" aria-hidden />
        </button>
      </div>

      {/* Offen rendern & vorbelegen */}
      <AddItemInline
        initial={initial}
        forceOpen
        title="Edit item"
        onSubmit={handleSubmit}
        onCancel={onCancel}
      />
    </div>
  );
}
