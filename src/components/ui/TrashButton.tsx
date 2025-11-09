import type { ButtonHTMLAttributes } from "react";

type Props = {
  /** Click handler */
  onClick: () => void;
  /** Accessible label like "Delete Banana" */
  ariaLabel: string;
  /** Optional title tooltip */
  title?: string;
  /** Size in px (icon). Defaults to 18 to match items. */
  size?: number;
  /** Extra classes to adjust spacing/placement */
  className?: string;
} & Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "onClick" | "aria-label" | "title" | "className"
>;

/**
 * Reusable red trash button with the exact same SVG + styles used in item cards.
 * Use this everywhere to keep a consistent look.
 */
export default function TrashButton({
  onClick,
  ariaLabel,
  title = "Delete",
  size = 18,
  className = "",
  ...rest
}: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      title={title}
      className={[
        "rounded-full p-2 hover:bg-red-50 text-red-500 hover:text-red-600",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-red-200",
        "transition-colors",
        className,
      ].join(" ")}
      {...rest}
    >
      {/* Exact same icon as your items button */}
      <svg
        viewBox="0 0 24 24"
        width={size}
        height={size}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <polyline points="3 6 5 6 21 6" />
        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
        <path d="M10 11v6" />
        <path d="M14 11v6" />
        <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
      </svg>
    </button>
  );
}
