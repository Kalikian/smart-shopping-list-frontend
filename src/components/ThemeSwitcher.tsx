import { useEffect, useMemo, useState } from "react";

const THEMES = ["", "theme-forest", "theme-ocean", "theme-lavender", "theme-sunset", "theme-mint", "theme-paper", "theme-candy"] as const;
type Theme = (typeof THEMES)[number]; // "" = default (kein Theme)

function applyTheme(theme: Theme) {
  const root = document.documentElement; // <html>
  // alle Themes entfernen
  THEMES.forEach(t => t && root.classList.remove(t));
  // neues setzen
  if (theme) root.classList.add(theme);
}

export default function ThemeSwitcher() {
  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem("theme") as Theme) || "");

  useEffect(() => {
    applyTheme(theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const niceName = useMemo(() => ({
    "": "Default",
    "theme-forest": "Forest",
    "theme-ocean": "Ocean",
    "theme-lavender": "Lavender",
    "theme-sunset": "Sunset",
    "theme-mint": "Mint",
    "theme-paper": "Paper",
    "theme-candy": "Candy",
  } as Record<string, string>), []);

  return (
    <div className="flex items-center gap-2 p-3">
      <label className="text-sm">Theme:</label>
      <select
        className="chip px-3 py-2 rounded-xl"
        value={theme}
        onChange={(e) => setTheme(e.target.value as Theme)}
      >
        {THEMES.map(t => (
          <option key={t || "default"} value={t}>
            {niceName[t || ""]}
          </option>
        ))}
      </select>
    </div>
  );
}
