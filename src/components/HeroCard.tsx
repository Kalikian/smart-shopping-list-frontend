// src/components/HeroCard.tsx
import { useState } from "react";
import Button from "./ui/Button";

type HeroCardProps = {
  onCreateNew?: () => Promise<void> | void;
  onOpenExisting?: () => Promise<void> | void;
  title?: string;
  subtitle?: string;
};

export default function HeroCard({
  onCreateNew,
  onOpenExisting,
  title = "Build smarter lists in seconds.",
  subtitle = "Add items fast, group by category, and check them off in-store.",
}: HeroCardProps) {
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    if (creating) return;
    try {
      setCreating(true);
      await onCreateNew?.();
    } finally {
      setCreating(false);
    }
  };

  const handleOpen = async () => {
    await onOpenExisting?.();
  };

  return (
    <section className="rounded-2xl border border-[hsl(var(--border))] bg-white p-6 shadow-sm">
      {/* Theme-aware badge */}
      <div className="mb-4 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold
                      bg-[hsl(var(--accent)/0.12)] text-[hsl(var(--accent))]">
        <span className="inline-block h-2 w-2 rounded-full bg-[hsl(var(--accent))]" />
        Quick &amp; simple
      </div>

      <h2 className="mb-3 text-2xl font-bold text-[hsl(var(--text))]">{title}</h2>
      <p className="mb-6 max-w-prose text-slate-600">{subtitle}</p>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button
          variant="primary"
          size="lg"
          fluid
          loading={creating}
          onClick={handleCreate}
          className="sm:flex-1"
        >
          Create new list
        </Button>

        <Button
          variant="ghost"
          size="lg"
          fluid
          disabled={creating}
          onClick={handleOpen}
          className="sm:flex-1"
        >
          My Lists
        </Button>
      </div>
    </section>
  );
}
