// src/components/FeatureTiles.tsx
// Footer tiles with concise UX guidance for swipe + undo.
// - Keep visual style lightweight (white cards, subtle shadow/border)
// - Accessible labels + clear arrow semantics

import { useTranslation } from "react-i18next";

export default function FeatureTiles() {
  const { t } = useTranslation("common");

  const tiles = [
    {
      icon: "⚡",
      title: t("features.fastInput.title", { defaultValue: "Fast input" }),
      desc: t("features.fastInput.desc", {
        defaultValue: "Add multiple items quickly.",
      }),
    },
    {
      icon: "🧭",
      title: t("features.smartGrouping.title", {
        defaultValue: "Smart grouping",
      }),
      desc: t("features.smartGrouping.desc", {
        defaultValue: "Auto by aisle/category.",
      }),
    },
    {
      icon: "🛒",
      title: t("features.swipeComplete.title", {
        defaultValue: "Swipe to complete",
      }),
      desc: t("features.swipeComplete.desc", {
        defaultValue: "→ Right = move to In cart. ← Left = move to Later.",
      }),
    },
    {
      icon: "↩️",
      title: t("features.quickUndo.title", {
        defaultValue: "Quick undo",
      }),
      desc: t("features.quickUndo.desc", {
        defaultValue: "In In cart or Later: swipe right to send back to Open.",
      }),
    },
    {
      icon: "✏️",
      title: t("features.editDelete.title", {
        defaultValue: "Edit & delete",
      }),
      desc: t("features.editDelete.desc", {
        defaultValue:
          "Use the pencil to edit details, the bin to remove an item.",
      }),
    },
    {
      icon: "🌐",
      title: t("features.languageSwitch.title", {
        defaultValue: "Language switch",
      }),
      desc: t("features.languageSwitch.desc", {
        defaultValue:
          "Use the language menu in the header to switch between English, German and Armenian.",
      }),
    },
  ];

  return (
    <section
      aria-label={t("features.howItWorks", { defaultValue: "How it works" })}
      className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
    >
      {tiles.map((tTile) => (
        <article
          key={tTile.title}
          className="rounded-xl border border-black/10 bg-white shadow-sm p-4"
        >
          <div className="flex items-start gap-3">
            <div className="text-xl" aria-hidden>
              {tTile.icon}
            </div>
            <div className="min-w-0">
              <h4 className="font-semibold">{tTile.title}</h4>
              <p className="text-sm text-slate-600 mt-0.5">{tTile.desc}</p>
            </div>
          </div>
        </article>
      ))}
    </section>
  );
}
