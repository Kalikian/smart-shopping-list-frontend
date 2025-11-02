// List section showing header with counters + items and visible card border
import ListItem, { type Item } from "./ListItem";

type ListProps = {
  items: Item[];
  onToggle: (id: string) => void;
};

export default function List({ items, onToggle }: ListProps) {
  const total = items.length;
  const done = items.filter((i) => i.done).length;

  // Cycle through 4 pleasant hues
  const hues = ["--c1", "--c2", "--c3", "--c4"] as const;
  const colorForIndex = (i: number) => `hsl(var(${hues[i % hues.length]}))`;

  return (
    <section className="mt-5 card p-0 overflow-hidden border border-black/10">
      <header
        className="px-4 py-3 border-b border-black/10"
        style={{
          background:
            "linear-gradient(180deg, hsl(var(--bg)) 0%, hsl(var(--bg)) 60%, rgba(0,0,0,0.02) 100%)",
        }}
      >
        <h3 className="font-semibold">Current list</h3>
        <p className="text-sm text-[hsl(var(--muted))]">
          {total} total • {done} done
        </p>
      </header>

      <ul className="divide-y divide-black/5">
        {items.map((it, i) => (
          <ListItem key={it.id} item={it} onToggle={onToggle} color={colorForIndex(i)} />
        ))}
      </ul>
    </section>
  );
}
