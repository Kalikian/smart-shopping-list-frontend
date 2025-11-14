// src/components/list-item/UnitSelect.tsx
// Normalized unit selector.

import { useTranslation } from "react-i18next";
import { UNITS, type Unit } from "../../constants/categories";

type Props = {
  value?: Unit;
  onChange: (u?: Unit) => void;
};

export default function UnitSelect({ value, onChange }: Props) {
  const { t } = useTranslation("common");

  return (
    <label className="block sm:basis-0 sm:flex-1">
      <span className="block text-xs font-medium text-slate-500 mb-1">
        {/* Visible label uses translated unit label */}
        {t("item.unitLabel")}
      </span>
      <select
        className="select-fix w-full dark:border-neutral-700 dark:bg-neutral-900"
        value={value ?? ""}
        onChange={(e) =>
          onChange((e.target.value || undefined) as Unit | undefined)
        }
        aria-label={t("item.unitLabel")}
      >
        {/* Placeholder option also uses the same label */}
        <option value="">{t("item.unitLabel")}</option>
        {UNITS.map((u) => (
          <option key={u} value={u}>
            {u}
          </option>
        ))}
      </select>
    </label>
  );
}
