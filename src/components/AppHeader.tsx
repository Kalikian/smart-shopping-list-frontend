// src/components/AppHeader.tsx
// Mobile-first top bar with logo, title and live counter.
// - Shows TOTAL on the left and DONE on the right (as requested)
// - Progress bar reflects done/total
// - Colors come from theme.css tokens (accent + neutrals)

import logoPng from "../assets/icons/mainListIcon.png";

type AppHeaderProps = {
  /** Number of items not completed yet */
  open: number;
  /** Total number of items in the current list */
  total: number;
  /** Optional title override (defaults to app name) */
  title?: string;
};

export default function AppHeader({
  open,
  total,
  title = "Smart Shopping List",
}: AppHeaderProps) {
  const done = Math.max(0, total - open);
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <header className="appbar safe-x">
      <div className="mx-auto max-w-screen-sm flex items-center justify-between py-3">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <img
            src={logoPng}
            alt=""
            className="size-8 rounded-xl ring-1 ring-black/5 object-contain"
            aria-hidden
          />
          <h1 className="text-base font-semibold">{title}</h1>
        </div>

        {/* Counter chip: TOTAL / DONE */}
        <div className="flex items-center gap-3">
          <div
            className="px-3 py-1.5 rounded-full text-sm bg-white ring-1 ring-black/10 shadow-sm"
            aria-label={`Total ${total}, Done ${done}`}
            title={`Total ${total} • Done ${done}`}
          >
            <span className="tabular-nums">{total}</span>
            <span className="mx-1 text-neutral-400">/</span>
            <span className="tabular-nums">{done}</span>
            <span className="ml-1 text-neutral-500">done</span>
          </div>
        </div>
      </div>

      {/* Mini progress bar */}
      <div className="mx-auto max-w-screen-sm pb-2">
        <div className="h-1 w-full bg-black/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-[hsl(var(--accent))] transition-[width] duration-300"
            style={{ width: `${pct}%` }}
            aria-hidden
          />
        </div>
      </div>
    </header>
  );
}
