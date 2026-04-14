"use client";

import Link from "next/link";

import { RoleSwitcher } from "@/components/layout/RoleSwitcher";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n/i18nContext";

export function AppHeader() {
  const { locale, setLocale, messages } = useI18n();

  return (
    <header className="sticky top-0 z-40 border-b bg-background/70 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <Link href="/" className="font-semibold tracking-tight">
            {messages.appName}
          </Link>
          <nav className="hidden items-center gap-3 text-sm text-muted-foreground md:flex">
            <Link href="/bicycles" className="hover:text-foreground">
              {messages.nav.bicycles}
            </Link>
            <Link href="/buyer/orders" className="hover:text-foreground">
              {messages.nav.buyer}
            </Link>
            <Link href="/seller/listings" className="hover:text-foreground">
              {messages.nav.seller}
            </Link>
            <Link href="/inspector/assignments" className="hover:text-foreground">
              {messages.nav.inspector}
            </Link>
            <Link href="/admin/listings/pending" className="hover:text-foreground">
              {messages.nav.admin}
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setLocale(locale === "vi" ? "en" : "vi")}
          >
            {messages.common.language}: {locale.toUpperCase()}
          </Button>
          <RoleSwitcher />
        </div>
      </div>
    </header>
  );
}

