import * as langEN from "../lang/en.json";

import i18n from "i18next";
import { ReactNode } from "react";
import { I18nextProvider, initReactI18next } from "react-i18next";

// the translations
// (tip move them in a JSON file and import them,
// or even better, manage them separated from your code: https://react.i18next.com/guides/multiple-translation-files)
const resources = {
    en: {
        translation: langEN,
    },
};

i18n.use(initReactI18next) // passes i18n down to react-i18next
    .init({
        resources,
        lng: "en",
        interpolation: {
            escapeValue: false, // react already safes from xss
        },
    });

export function TranslationProvider({
    children,
}: {
    children?: ReactNode | ReactNode[];
}) {
    return (
        <I18nextProvider i18n={i18n} defaultNS="translation">
            {children}
        </I18nextProvider>
    );
}
