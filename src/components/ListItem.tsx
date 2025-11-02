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
  /** CSS color string e.g. 'hsl(var(--c1))' */
  color: string;
};

export default function ListItem({ item, onToggle, color }: ListItemProps) {
  return (
    <li className="p-2">
      <div
        className={[
          "relative flex items-center gap-3 rounded-xl border",
          "border-black/10 bg-white/60 dark:bg-white/5",
          "shadow-sm hover:shadow-md",
          "transition-all focus-within:ring-2 focus-within:ring-black/10",
        ].join(" ")}
        style={{
          // thin left color bar
          boxShadow: `inset 4px 0 0 0 ${color}`,
        }}
      >
        {/* Checkbox with per-row accent color */}
        <input
          type="checkbox"
          className="ml-3 mr-1 h-5 w-5 rounded-md"
          checked={item.done}
          onChange={() => onToggle(item.id)}
          aria-label={`Mark ${item.name} as ${item.done ? "not done" : "done"}`}
          style={{ accentColor: color }}
        />

        {/* Name + Qty */}
        <div className="flex-1 min-w-0 py-3 pr-3">
          <div className={`font-medium truncate ${item.done ? "line-through text-black/45" : ""}`}>
            {item.name}
          </div>
          {item.qty && <div className="text-sm text-[hsl(var(--muted))]">{item.qty}</div>}
        </div>

        {/* Optional category chip */}
        {item.category && (
          <span
            className="chip mr-3"
            style={{ backgroundColor: `${color} / 0.12`, color: "inherit", borderColor: `${color} / 0.35` }}
          >
            {item.category}
          </span>
        )}
      </div>
    </li>
  );
}
