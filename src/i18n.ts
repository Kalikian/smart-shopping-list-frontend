// src/i18n.ts
// Central i18n configuration for the React app.

import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import enCommon from "./locales/en/common.json";
import deCommon from "./locales/de/common.json";
import hyCommon from "./locales/hy/common.json";
void i18n
    .use(initReactI18next)
    .init({
        resources: {
            en: {
                common: enCommon,
            },
            de: {
                common: deCommon,
            },
            hy: { common: hyCommon },
        },
        lng: "en", // default UI language
        fallbackLng: "en",
        supportedLngs: ["en", "de", "hy"],
        ns: ["common"],
        defaultNS: "common",
        interpolation: {
            escapeValue: false, // React already escapes values
        },
    });

export default i18n;
