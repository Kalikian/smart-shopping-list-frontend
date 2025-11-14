// src/components/LanguageSwitcher.tsx
// Language dropdown with same visual style as ThemeSwitcher.
// Uses i18next to switch between "en" and "de".

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

const LANGS = [
  { code: "en", labelKey: "language.en", fallback: "English" },
  { code: "de", labelKey: "language.de", fallback: "German" },
] as const;

type LangCode = (typeof LANGS)[number]["code"];

export default function LanguageSwitcher() {
  const { i18n, t } = useTranslation("common");

  // Normalize initial language to "en" / "de"
  const initial: LangCode = i18n.language.startsWith("de") ? "de" : "en";
  const [lang, setLang] = useState<LangCode>(initial);

  // Apply language change whenever dropdown value changes
  useEffect(() => {
    void i18n.changeLanguage(lang);
  }, [lang, i18n]);

  const labelText = t("language.label", { defaultValue: "Language:" });

  return (
    <div className="flex items-center gap-2 p-3">
      <label className="text-sm">{labelText}</label>
      <select
        className="chip px-3 py-2 rounded-xl"
        value={lang}
        onChange={(e) => setLang(e.target.value as LangCode)}
      >
        {LANGS.map((l) => (
          <option key={l.code} value={l.code}>
            {t(l.labelKey, { defaultValue: l.fallback })}
          </option>
        ))}
      </select>
    </div>
  );
}
