// src/components/CurrentListHeader.tsx
// Header row for the currently selected list:
// left = list name, right = "X open · Y total" summary.

import { useTranslation } from "react-i18next";

type CurrentListHeaderProps = {
  name: string;
  open: number;
  total: number;
};

export default function CurrentListHeader({
  name,
  open,
  total,
}: CurrentListHeaderProps) {
  const { t } = useTranslation("common");

  const summary = t("list.headerSummary", {
    open,
    total,
    defaultValue: "{{open}} open · {{total}} total",
  });

  return (
    <div className="mb-4 mt-4 flex items-center justify-between">
      <h2 className="text-base font-semibold">{name}</h2>
      <span className="text-sm opacity-70">{summary}</span>
    </div>
  );
}
