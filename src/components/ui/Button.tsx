// src/components/ui/Button.tsx
import React from "react";

type ButtonProps = {
  children: React.ReactNode;
  onClick?: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: "primary" | "ghost";
  /** Size affects padding & font */
  size?: "sm" | "md" | "lg";
  /** If true, takes full width of its container (e.g., mobile stack) */
  fluid?: boolean;
  /** Extra classes to fine-tune layout (optional) */
  className?: string;
  type?: "button" | "submit";
};

/**
 * Responsive, accessible button:
 * - Keeps width stable while loading (no layout shift)
 * - Responsive min-widths so it doesn’t look tiny on desktop or huge on mobile
 * - Optional fluid mode for full-width buttons
 */
export default function Button({
  children,
  onClick,
  loading = false,
  disabled = false,
  variant = "primary",
  size = "md",
  fluid = false,
  className = "",
  type = "button",
}: ButtonProps) {
  const isDisabled = disabled || loading;

  const base =
    "inline-flex items-center justify-center gap-2 rounded-2xl font-semibold transition active:scale-[0.99] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 select-none";

  const sizes = {
    sm: "text-sm px-3 py-2",
    md: "text-sm px-4 py-3",
    lg: "text-base px-5 py-3.5",
  } as const;

  const variants = {
    primary:
      "bg-emerald-600 text-white hover:bg-emerald-700 focus-visible:ring-emerald-600 disabled:bg-emerald-400",
    ghost:
      "bg-white text-slate-900 border border-slate-300 hover:bg-slate-50 focus-visible:ring-slate-400 disabled:text-slate-400",
  } as const;

  // Fixed, responsive min-width to avoid jumping text on load
  // (≈144px mobile, 160px md, 176px lg)
  const fixedWidth = fluid
    ? "w-full"
    : "min-w-36 md:min-w-40 lg:min-w-44";

  return (
    <button
      type={type}
      onClick={isDisabled ? undefined : onClick}
      aria-busy={loading || undefined}
      aria-live="polite"
      disabled={isDisabled}
      className={[
        base,
        sizes[size],
        variants[variant],
        fixedWidth,
        className,
      ].join(" ")}
    >
      {loading && (
        <svg
          className="h-4 w-4 animate-spin"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
            opacity="0.25"
          />
          <path
            d="M22 12a10 10 0 0 0-10-10"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
          />
        </svg>
      )}
      <span className="whitespace-nowrap">{children}</span>
    </button>
  );
}