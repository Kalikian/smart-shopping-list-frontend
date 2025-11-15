// src/components/PreferencesBar.tsx
// Compact Theme + Language row
// - Centered with small gap
// - Wraps on very narrow screens, both controls stay centered

import ThemeSelector from "./ThemeSwitcher";
import LanguageSwitcher from "./LanguageSwitcher";

export default function PreferencesBar() {
  return (
    <section className="flex flex-wrap items-center justify-center">
      <ThemeSelector />
      <LanguageSwitcher />
    </section>
  );
}
