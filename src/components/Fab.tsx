// src/components/Fab.tsx
import { ADD_EVENT } from "./AddItemInline";

type FabProps = {
  /** Disable interactions (also sets aria-disabled) */
  disabled?: boolean;
  /** Tooltip / title attribute */
  title?: string;
  /** Click handler (optional). If not provided, a global ADD_EVENT is dispatched. */
  onClick?: () => void;
  /** Optional loading flag for future use (aria-busy) */
  loading?: boolean;
};

export default function Fab({
  disabled = false,
  title = "Add item",
  onClick,
  loading = false,
}: FabProps) {
  const isDisabled = disabled || loading;

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
      aria-label="Add item"
      title={title}
      aria-busy={loading || undefined}
      aria-disabled={isDisabled || undefined}
      disabled={isDisabled}
      onClick={handleClick}
    >
      ＋
    </button>
  );
}
