// src/components/list-item/CategoryBadge.tsx
// Compact pill with icon and optional label.

import { useTranslation } from "react-i18next";
import {
  CATEGORY_ICON_BY_LABEL,
  type CategoryLabel,
} from "../../constants/categories";
import { alphaTint } from "../../utils/color";

type Props = {
  label: CategoryLabel;
  color?: string; // undefined for Default
  showTextOnSmUp?: boolean;
};

export default function CategoryBadge({
  label,
  color,
  showTextOnSmUp = true,
}: Props) {
  const { t } = useTranslation("common");

  const isDefault = label === "Default";
  // Map category enum value to translated label
  const displayLabel = t(`categories.${label}`);

  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs"
      style={{
        backgroundColor: isDefault ? "#ffffff" : alphaTint(color!, 0.16),
        boxShadow: isDefault
          ? "0 0 0 1px rgba(0,0,0,0.12) inset"
          : `0 0 0 1px ${alphaTint(color!, 0.35)} inset`,
      }}
      title={displayLabel}
    >
      {CATEGORY_ICON_BY_LABEL[label] ? (
        <img
          src={CATEGORY_ICON_BY_LABEL[label]}
          alt=""
          className="h-4 w-4 object-contain"
          draggable={false}
        />
      ) : (
        <span className="h-4 w-4 inline-block rounded-full bg-black/10" />
      )}
      {showTextOnSmUp && (
        <span className="hidden sm:inline">{displayLabel}</span>
      )}
    </span>
  );
}
