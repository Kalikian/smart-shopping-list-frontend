// src/components/list-item/CategorySelect.tsx
// Category selector with provided options.

import { useTranslation } from "react-i18next";
import { CATEGORIES, type CategoryLabel } from "../../constants/categories";

type Props = {
  value: CategoryLabel;
  onChange: (c: CategoryLabel) => void;
};

export default function CategorySelect({ value, onChange }: Props) {
  const { t } = useTranslation("common");

  return (
    <label className="block sm:basis-0 sm:flex-1">
      {/* Label text is now translated via i18n */}
      <span className="block text-xs font-medium text-slate-500 mb-1">
        {t("item.categoryLabel")}
      </span>
      <select
        className="select-fix w-full dark:border-neutral-700 dark:bg-neutral-900"
        value={value}
        onChange={(e) => onChange(e.target.value as CategoryLabel)}
        aria-label={t("item.categoryLabel")}
      >
        {CATEGORIES.map((c) => (
          // Option labels stay as raw category labels for now
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
    </label>
  );
}
