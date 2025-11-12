// Reusable neutral icon-only button for small actions.
// - Bigger tap target by default (h-10 w-10)
// - Accessible: requires aria-label; optional title tooltip
// - Supports disabled, custom className, and onClick
// - ForwardRef for focus management in parents

import * as React from "react";

export type IconButtonProps = {
  "aria-label": string; // required for a11y
  title?: string; // optional tooltip
  onClick?: () => void;
  disabled?: boolean;
  className?: string; // allow style overrides
  children: React.ReactNode; // your SVG/icon
  type?: "button" | "submit" | "reset";
};

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      "aria-label": ariaLabel,
      title,
      onClick,
      disabled = false,
      className = "",
      children,
      type = "button",
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        type={type}
        aria-label={ariaLabel}
        title={title ?? ariaLabel}
        onClick={disabled ? undefined : onClick}
        disabled={disabled}
        className={[
          // base
          "h-10 w-10 grid place-items-center rounded-md",
          "text-slate-800",
          "transition-colors",
          disabled
            ? "opacity-50 cursor-not-allowed"
            : "hover:bg-black/5 active:bg-black/10",
          className,
        ].join(" ")}
      >
        {children}
      </button>
    );
  }
);

IconButton.displayName = "IconButton";
export default IconButton;
