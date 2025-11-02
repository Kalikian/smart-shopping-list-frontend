// Floating Action Button (placeholder)
type FabProps = {
  disabled?: boolean;
  title?: string;
};

export default function Fab({ disabled = true, title = "Add item (coming soon)" }: FabProps) {
  return (
    <button type="button" className="fab" aria-label="Add item" title={title} disabled={disabled}>
      ＋
    </button>
  );
}
