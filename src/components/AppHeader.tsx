// src/components/AppHeader.tsx
// Mobile-first top bar with logo, title and live counter.
// NOTE: We now display LEFT = total items, RIGHT = done items.

import logoPng from "../assets/icons/listIcon.png";

type AppHeaderProps = {
  /** Total number of items in the current list (shown on the LEFT) */
  open: number; // ← kept name for compatibility; interpreted as totalCount
  /** Number of completed items (shown on the RIGHT) */
  total: number; // ← kept name for compatibility; interpreted as doneCount
  /** Optional title override (defaults to app name) */
  title?: string;
};

export default function AppHeader({ open, total, title = "Smart Shopping List" }: AppHeaderProps) {
  // Interpret props: open = totalCount, total = doneCount
  const totalCount = open;
  const doneCount = total;

  // Progress is done / total
  const pct = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;

  return (
    <header className="appbar safe-x">
      <div className="mx-auto max-w-screen-sm flex items-center justify-between py-3">
        {/* Brand */}
        <div className="flex items-center gap-3">
          {/* Logo badge */}
          <div
            className="grid place-items-center w-9 h-9 rounded-xl shadow-sm"
            style={{
              background: "linear-gradient(180deg, hsl(var(--accent) / 0.18), hsl(var(--accent) / 0.10))",
              boxShadow: "var(--shadow-sm)",
            }}
            aria-hidden
          >
            <img src={logoPng} alt="" className="w-6 h-6 object-contain" />
          </div>

          <h1 className="text-base font-semibold tracking-tight">{title}</h1>
        </div>

        {/* Counter pill */}
        <div className="min-w-[88px]">
          <div className="rounded-full px-3 py-1 text-xs font-medium bg-white shadow-sm ring-1 ring-black/5 text-[hsl(var(--text))]">
            {/* Example: 4 / 2 done */}
            <span className="tabular-nums">{totalCount}</span>
            <span className="mx-1 text-[hsl(var(--muted))]">/</span>
            <span className="tabular-nums">{doneCount}</span>
            <span className="ml-1 text-[hsl(var(--muted))]">done</span>
          </div>

          {/* Tiny progress bar */}
          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-black/10">
            <div
              className="h-full rounded-full"
              style={{
                width: `${pct}%`,
                background: "linear-gradient(90deg, hsl(var(--accent)), hsl(var(--accent-600)))",
              }}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
