// Item row with inline editing for amount, unit, category.
// Shows colored left bar; checkbox accent matches row color.

export type Category =
  | "Produce"
  | "Dairy"
  | "Meat & Fish"
  | "Bakery"
  | "Pantry (Dry)"
  | "Beverages"
  | "Frozen"
  | "Snacks & Sweets"
  | "Household & Care";

export type Item = {
  id: string;
  name: string;
  done: boolean;
  amount?: number;   // e.g. 6
  unit?: string;     // "pcs" | "kg" | "g" | "L" | "ml" | "pack" ...
  category?: Category;
};

type ListItemProps = {
  item: Item;
  onToggle: (id: string) => void;
  onChange: (patch: Partial<Item>) => void;
  color: string; // e.g. 'hsl(var(--cat-produce))'
};

// Narrow the select options to Category literals
export const CATEGORIES = [
  "Produce",
  "Dairy",
  "Meat & Fish",
  "Bakery",
  "Pantry (Dry)",
  "Beverages",
  "Frozen",
  "Snacks & Sweets",
  "Household & Care",
] as const satisfies readonly Category[];

const UNITS = ["pcs", "kg", "g", "L", "ml", "pack"] as const;

export default function ListItem({ item, onToggle, onChange, color }: ListItemProps) {
  const step = item.unit === "kg" || item.unit === "L" ? 0.1 : 1;

  return (
    <li className="p-2">
      <div
        className="relative flex flex-wrap items-center gap-3 rounded-xl border border-black/10 bg-white/60 shadow-sm hover:shadow-md transition-all focus-within:ring-2 focus-within:ring-black/10"
        style={{ boxShadow: `inset 4px 0 0 0 ${color}` }}
      >
        {/* Checkbox */}
        <input
          type="checkbox"
          className="ml-3 mr-1 h-5 w-5 rounded-md"
          checked={item.done}
          onChange={() => onToggle(item.id)}
          aria-label={`Mark ${item.name} as ${item.done ? "not done" : "done"}`}
          style={{ accentColor: color }}
        />

        {/* Name */}
        <div className="min-w-0 flex-1 py-3">
          <div className={`font-medium truncate ${item.done ? "line-through text-black/45" : ""}`}>
            {item.name}
          </div>

          {/* Inline controls: amount + unit + category */}
          <div className="mt-1 flex flex-wrap items-center gap-2 text-sm">
            {/* amount */}
            <label className="flex items-center gap-1">
              <span className="text-[hsl(var(--muted))]">Qty</span>
              <input
                type="number"
                inputMode="decimal"
                step={step}
                min={0}
                className="w-20 rounded-md border border-black/10 px-2 py-1"
                value={item.amount ?? ""}
                onChange={(e) => {
                  const raw = e.target.value;
                  onChange({ amount: raw === "" ? undefined : Number(raw) });
                }}
              />
            </label>

            {/* unit */}
            <select
              className="rounded-md border border-black/10 px-2 py-1"
              value={item.unit ?? ""}
              onChange={(e) => onChange({ unit: e.target.value || undefined })}
            >
              <option value="">Unit</option>
              {UNITS.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>

            {/* category */}
            <select
              className="rounded-md border border-black/10 px-2 py-1"
              value={item.category ?? ""}
              onChange={(e) => {
                // Narrow string to Category | undefined
                const val = (e.target.value || undefined) as Category | undefined;
                onChange({ category: val });
              }}
            >
              <option value="">Category</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Visual category chip */}
        {item.category && (
          <span
            className="chip mr-3 mb-3 sm:mb-0"
            style={{
              backgroundColor: `${color} / 0.12`,
              borderColor: `${color} / 0.35`,
            }}
          >
            {item.category}
          </span>
        )}
      </div>
    </li>
  );
}
