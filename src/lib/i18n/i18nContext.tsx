"use client";

import * as React from "react";

import { messagesEn } from "@/lib/i18n/messages.en";
import { messagesVi } from "@/lib/i18n/messages.vi";

export type Locale = "vi" | "en";

const MESSAGES = {
  vi: messagesVi,
  en: messagesEn,
} as const;

type Messages = (typeof MESSAGES)[Locale];

type I18nContextValue = {
  locale: Locale;
  messages: Messages;
  setLocale: (locale: Locale) => void;
};

const I18nContext = React.createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = React.useState<Locale>("vi");

  const value = React.useMemo<I18nContextValue>(
    () => ({
      locale,
      messages: MESSAGES[locale],
      setLocale,
    }),
    [locale]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = React.useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within <I18nProvider>");
  return ctx;
}

