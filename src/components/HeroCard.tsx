// Simple hero/CTA card with primary + ghost actions
type HeroCardProps = {
  creating: boolean;
  onCreate: () => void;
};

export default function HeroCard({ creating, onCreate }: HeroCardProps) {
  return (
    <section className="card p-5 mt-2">
      <p className="chip">
        <span aria-hidden>✨</span> Quick & simple
      </p>
      <h2 className="mt-3 text-2xl font-bold tracking-tight">
        Build smarter lists in seconds.
      </h2>
      <p className="mt-2 text-[15px] text-[hsl(var(--muted))]">
        Add items fast, group by category, and check them off in-store.
      </p>

      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={onCreate}
          disabled={creating}
          className="btn btn-primary"
        >
          {creating ? "Creating…" : "Create new list"}
        </button>
        <button type="button" className="btn btn-ghost" disabled title="Coming soon">
          Open existing
        </button>
      </div>
    </section>
  );
}
