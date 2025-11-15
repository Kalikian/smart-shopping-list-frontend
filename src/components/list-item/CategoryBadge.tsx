// src/components/CategoryBadge.tsx
import {
  CATEGORY_ICON_BY_LABEL,
  type CategoryLabel,
} from "../../constants/categories";
import { alphaTint } from "../../utils/color";

type Props = {
  category?: CategoryLabel;
  color?: string;
  size?: number;
  showLabel?: boolean;
};

export default function CategoryBadge({
  category = "Default",
  color,
  size = 32,
  showLabel = false,
}: Props) {
  const isDefault = category === "Default";
  const iconSrc = CATEGORY_ICON_BY_LABEL[category];

  const bg = isDefault ? "#ffffff" : alphaTint(color, 0.18);
  const ring = isDefault
    ? "0 0 0 1px rgba(0,0,0,0.12) inset"
    : `0 0 0 1px ${alphaTint(color, 0.35)} inset`;

  return (
    <div
      className="inline-flex items-center gap-2"
      title={category}
      aria-label={category}
    >
      <span
        className="inline-flex items-center justify-center rounded-full"
        style={{
          width: size,
          height: size,
          backgroundColor: bg,
          boxShadow: ring,
        }}
      >
        {iconSrc ? (
          <img
            src={iconSrc}
            alt=""
            className="h-[60%] w-[60%] object-contain"
            draggable={false}
          />
        ) : (
          <span className="text-xs text-gray-500">?</span>
        )}
      </span>
      {showLabel && <span className="text-sm font-medium">{category}</span>}
      <span className="sr-only">{category}</span>
    </div>
  );
}
