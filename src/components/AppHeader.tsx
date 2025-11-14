// src/components/AppHeader.tsx
// Mobile-first top bar with logo, title and live counter.
// - Shows TOTAL on the left and DONE on the right
// - Progress bar reflects done/total
// - Colors come from theme.css tokens (accent + neutrals)

import { useTranslation } from "react-i18next";
import logoPng from "../assets/icons/mainListIcon.png";

type AppHeaderProps = {
  /** Number of items not completed yet */
  open: number;
  /** Total number of items in the current list */
  total: number;
  /** Optional title override (defaults to localized app name) */
  title?: string;
};

export default function AppHeader({ open, total, title }: AppHeaderProps) {
  const { t } = useTranslation("common");

  const done = Math.max(0, total - open);
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  // Use provided title if present; otherwise fall back to localized app title
  const effectiveTitle = title ?? t("app.title");

  const chipAriaLabel = t("stats.headerAria", {
    total,
    done,
    defaultValue: `Total ${total}, Done ${done}`,
  });

  const chipTitle = t("stats.headerTitle", {
    total,
    done,
    defaultValue: `Total ${total} • Done ${done}`,
  });

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
          <h1 className="text-base font-semibold">{effectiveTitle}</h1>
        </div>

        {/* Counter chip: TOTAL / DONE */}
        <div className="flex items-center gap-3">
          <div
            className="px-3 py-1.5 rounded-full text-sm bg-white ring-1 ring-black/10 shadow-sm"
            aria-label={chipAriaLabel}
            title={chipTitle}
          >
            <span className="tabular-nums">{total}</span>
            <span className="mx-1 text-neutral-400">/</span>
            <span className="tabular-nums">{done}</span>
            <span className="ml-1 text-neutral-500">
              {t("stats.doneSuffix", { defaultValue: "done" })}
            </span>
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
