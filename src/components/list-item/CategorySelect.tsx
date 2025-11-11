// src/components/list-item/CategorySelect.tsx
// Category selector with provided options.

import { CATEGORIES, type CategoryLabel } from "../../constants/categories";

type Props = {
  value: CategoryLabel;
  onChange: (c: CategoryLabel) => void;
};

export default function CategorySelect({ value, onChange }: Props) {
  return (
    <label className="block sm:basis-0 sm:flex-1">
      <span className="block text-xs font-medium text-slate-500 mb-1">
        Category
      </span>
      <select
        className="select-fix w-full dark:border-neutral-700 dark:bg-neutral-900"
        value={value}
        onChange={(e) => onChange(e.target.value as CategoryLabel)}
        aria-label="Category"
      >
        {CATEGORIES.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
    </label>
  );
}
