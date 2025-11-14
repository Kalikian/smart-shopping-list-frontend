// src/i18n.ts
// Central i18n configuration for the React app.
// Currently only English is wired; other languages (e.g. German) will be added later.

import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// Import base English translations from JSON
import enCommon from "./locales/en/common.json";

void i18n
    .use(initReactI18next)
    .init({
        resources: {
            en: {
                common: enCommon,
            },
            // de will be added later, e.g.:
            // de: { common: deCommon },
        },
        lng: "en", // default language
        fallbackLng: "en",
        ns: ["common"],
        defaultNS: "common",
        interpolation: {
            escapeValue: false, // React already escapes values
        },
    });

export default i18n;
