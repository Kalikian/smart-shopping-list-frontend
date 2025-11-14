// src/components/Fab.tsx
// Floating action button to trigger the inline add-item composer.

import { useTranslation } from "react-i18next";
import { ADD_EVENT } from "./AddItemInline";

type FabProps = {
  /** Disable interactions (also sets aria-disabled) */
  disabled?: boolean;
  /** Tooltip / title attribute override */
  title?: string;
  /** Click handler (optional). If not provided, a global ADD_EVENT is dispatched. */
  onClick?: () => void;
  /** Optional loading flag for future use (aria-busy) */
  loading?: boolean;
};

export default function Fab({
  disabled = false,
  title,
  onClick,
  loading = false,
}: FabProps) {
  const { t } = useTranslation("common");
  const isDisabled = disabled || loading;

  // Localized default label when no explicit title is provided
  const defaultLabel = t("buttons.addItem");
  const effectiveTitle = title ?? defaultLabel;

  // Unified click: prefer explicit handler, otherwise dispatch global event
  const handleClick = () => {
    if (isDisabled) return;
    if (onClick) {
      onClick();
    } else {
      // Fire-and-forget signal to open inline composer (handled in AddItemInline)
      window.dispatchEvent(new Event(ADD_EVENT));
    }
  };

  return (
    <button
      type="button"
      className="fab"
      aria-label={defaultLabel}
      title={effectiveTitle}
      aria-busy={loading || undefined}
      aria-disabled={isDisabled || undefined}
      disabled={isDisabled}
      onClick={handleClick}
    >
      ＋
    </button>
  );
}
