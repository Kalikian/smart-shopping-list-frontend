// src/components/EditItemInline.tsx
import AddItemInline, { type AddItemInlineSubmit } from "./AddItemInline";
import type { Item } from "./ListItem";

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

  // Minimal: kein eigener Rahmen/Title/Close-Button; nur das Formular
  return (
    <AddItemInline
      initial={initial}
      forceOpen
      onSubmit={handleSubmit}
      onCancel={onCancel}
    />
  );
}
