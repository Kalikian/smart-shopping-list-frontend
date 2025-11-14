// src/components/CategoryBadge.tsx
import {
  CATEGORY_ICON_BY_LABEL,
  type CategoryLabel,
} from "../../constants/categories";

type Props = {
  /** Category label, e.g. "Produce" or "Default" */
  category?: CategoryLabel;
  /** Base category color used to tint the badge background and ring (e.g. 'hsl(var(--cat-produce))') */
  color?: string;
  /** Circular badge size in px */
  size?: number;
  /** Optionally render the text label next to the icon */
  showLabel?: boolean;
};

/** Create a translucent tint from various color formats */
function alphaTint(input?: string, alpha = 0.18): string {
  if (!input) return "rgba(0,0,0,0.06)";
  const a = Math.max(0, Math.min(1, alpha));

  // hsl(...) → append slash alpha
  if (input.startsWith("hsl(")) return input.replace(/\)$/, ` / ${a})`);

  // rgb(...) → convert to rgba(...)
  if (input.startsWith("rgb("))
    return input.replace(/^rgb\(/, "rgba(").replace(/\)$/, `, ${a})`);

  // #rrggbb or #rgb → convert to rgba(r,g,b,a)
  if (input.startsWith("#")) {
    const hex = input.slice(1);
    const norm =
      hex.length === 3
        ? hex
            .split("")
            .map((c) => c + c)
            .join("")
        : hex;
    const r = parseInt(norm.slice(0, 2), 16);
    const g = parseInt(norm.slice(2, 4), 16);
    const b = parseInt(norm.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${a})`;
  }

  // var(--token) → wrap as hsl(var(--token) / a)
  if (input.startsWith("var(")) return `hsl(${input} / ${a})`;

  // Fallback neutral tint
  return "rgba(0,0,0,0.06)";
}

export default function CategoryBadge({
  category = "Default",
  color,
  size = 32,
  showLabel = false,
}: Props) {
  const isDefault = category === "Default";
  const iconSrc = CATEGORY_ICON_BY_LABEL[category];

  // Default stays colorless (white); others are softly tinted
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
            className="w-[60%] h-[60%] object-contain"
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
