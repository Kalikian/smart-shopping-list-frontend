// src/components/ui/Button.tsx
import React from "react";

type ButtonProps = {
  children: React.ReactNode;
  onClick?: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: "primary" | "ghost";
  size?: "sm" | "md" | "lg";
  fluid?: boolean;
  className?: string;
  type?: "button" | "submit";
};

/**
 * Theme-aware, responsive button with spinner.
 * Uses tokens from styles/theme.css:
 *   --accent, --on-accent, --text, --border
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

  // Theme-aware variants via CSS variables
  const variants = {
    primary:
      "bg-[hsl(var(--accent))] text-[hsl(var(--on-accent))] " +
      "hover:brightness-95 focus-visible:ring-[hsl(var(--accent))] " +
      "disabled:opacity-60 disabled:cursor-not-allowed",
    ghost:
      "bg-white text-[hsl(var(--text))] border border-[hsl(var(--border))] " +
      "hover:bg-slate-50 focus-visible:ring-[hsl(var(--accent))] " +
      // behalten: beim Disable wird Text grau
      "disabled:text-slate-400 disabled:cursor-not-allowed",
  } as const;

  const fixedWidth = fluid ? "w-full" : "min-w-36 md:min-w-40 lg:min-w-44";

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
        <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" opacity="0.25" />
          <path d="M22 12a10 10 0 0 0-10-10" stroke="currentColor" strokeWidth="4" fill="none" strokeLinecap="round" />
        </svg>
      )}
      <span className="whitespace-nowrap">{children}</span>
    </button>
  );
}
