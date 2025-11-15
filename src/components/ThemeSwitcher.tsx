import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

// All available theme class names ("" means default/no theme)
const THEMES = [
  "",
  "theme-forest",
  "theme-ocean",
  "theme-lavender",
  "theme-sunset",
  "theme-mint",
  "theme-paper",
  "theme-candy",
] as const;

type Theme = (typeof THEMES)[number];

function applyTheme(theme: Theme) {
  // Apply theme class on <html> so it affects the whole app
  const root = document.documentElement;
  THEMES.forEach((t) => t && root.classList.remove(t));
  if (theme) root.classList.add(theme);
}

export default function ThemeSwitcher() {
  const { t } = useTranslation("common");

  // Read persisted theme or fall back to default
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem("theme") as Theme) || ""
  );

  useEffect(() => {
    applyTheme(theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const niceName = useMemo(
    () =>
      ({
        "": t("theme.default", { defaultValue: "Default" }),
        "theme-forest": t("theme.forest", { defaultValue: "Forest" }),
        "theme-ocean": t("theme.ocean", { defaultValue: "Ocean" }),
        "theme-lavender": t("theme.lavender", { defaultValue: "Lavender" }),
        "theme-sunset": t("theme.sunset", { defaultValue: "Sunset" }),
        "theme-mint": t("theme.mint", { defaultValue: "Mint" }),
        "theme-paper": t("theme.paper", { defaultValue: "Paper" }),
        "theme-candy": t("theme.candy", { defaultValue: "Candy" }),
      } as Record<Theme, string>),
    [t]
  );

  const labelText = t("theme.label", { defaultValue: "Theme:" });

  return (
    <div className="flex items-center gap-2 p-1">
      <label className="text-sm">{labelText}</label>
      <select
        className="chip px-3 py-2 rounded-xl"
        value={theme}
        onChange={(e) => setTheme(e.target.value as Theme)}
      >
        {THEMES.map((tKey) => (
          <option key={tKey || "default"} value={tKey}>
            {niceName[tKey]}
          </option>
        ))}
      </select>
    </div>
  );
}
