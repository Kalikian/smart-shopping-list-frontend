// src/components/HeroCard.tsx
import { useState } from "react";
import Button from "./ui/Button";

/**
 * Props for the hero card.
 * onCreateNew/onOpenExisting are optional so this component stays flexible.
 * You can pass async functions; loading state is handled locally.
 */
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

  // Handle "Create new list" with built-in loading state
  const handleCreate = async () => {
    if (creating) return;
    try {
      setCreating(true);
      await onCreateNew?.();
    } finally {
      setCreating(false);
    }
  };

  // "Open existing" stays enabled unless create is loading
  const handleOpen = async () => {
    await onOpenExisting?.();
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      {/* Tiny label */}
      <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
        <span className="inline-block h-2 w-2 rounded-full bg-emerald-600" />
        Quick &amp; simple
      </div>

      {/* Headline */}
      <h2 className="mb-3 text-2xl font-bold text-slate-900">{title}</h2>
      <p className="mb-6 max-w-prose text-slate-600">{subtitle}</p>

      {/* Actions */}
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
          Open existing
        </Button>
      </div>
    </section>
  );
}