// List section showing header with counters + items
import ListItem, { type Item } from "./ListItem";

type ListProps = {
  items: Item[];
  onToggle: (id: string) => void;
};

export default function List({ items, onToggle }: ListProps) {
  const total = items.length;
  const done = items.filter((i) => i.done).length;

  return (
    <section className="mt-5 card p-0 overflow-hidden">
      <header className="px-4 py-3 border-b border-black/5">
        <h3 className="font-semibold">Current list</h3>
        <p className="text-sm text-[hsl(var(--muted))]">
          {total} total • {done} done
        </p>
      </header>

      <ul className="divide-y divide-black/5">
        {items.map((it) => (
          <ListItem key={it.id} item={it} onToggle={onToggle} />
        ))}
      </ul>
    </section>
  );
}
