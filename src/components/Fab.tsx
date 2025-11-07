// src/components/Fab.tsx
type FabProps = {
  /** Disable interactions (also sets aria-disabled) */
  disabled?: boolean;
  /** Tooltip / title attribute */
  title?: string;
  /** Click handler (optional) */
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

  return (
    <button
      type="button"
      className="fab"
      aria-label="Add item"
      title={title}
      aria-busy={loading || undefined}
      aria-disabled={isDisabled || undefined}
      disabled={isDisabled}
      onClick={isDisabled ? undefined : onClick}
    >
      ＋
    </button>
  );
}