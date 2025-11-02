// Renders a single item row with checkbox and optional qty/category
export type Item = {
  id: string;
  name: string;
  qty?: string;
  done: boolean;
  category?: string;
};

type ListItemProps = {
  item: Item;
  onToggle: (id: string) => void;
};

export default function ListItem({ item, onToggle }: ListItemProps) {
  return (
    <li className="px-4 py-3">
      <label className="flex items-center gap-3">
        {/* Checkbox */}
        <input
          type="checkbox"
          className="w-5 h-5 rounded-md accent-[hsl(var(--accent))]"
          checked={item.done}
          onChange={() => onToggle(item.id)}
          aria-label={`Mark ${item.name} as ${item.done ? "not done" : "done"}`}
        />

        {/* Name + Qty */}
        <div className="flex-1 min-w-0">
          <div className={`font-medium truncate ${item.done ? "line-through text-black/40" : ""}`}>
            {item.name}
          </div>
          {item.qty && <div className="text-sm text-[hsl(var(--muted))]">{item.qty}</div>}
        </div>

        {/* Optional category chip */}
        {item.category && <span className="chip">{item.category}</span>}
      </label>
    </li>
  );
}
