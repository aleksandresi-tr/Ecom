"use client";

import { Link, usePathname } from "@/i18n/navigation";

type LanguageSwitcherProps = {
  locale: string;
  label: string;
};

export function LanguageSwitcher({ locale, label }: LanguageSwitcherProps) {
  const pathname = usePathname();
  const otherLocale = locale === "ka" ? "en" : "ka";

  return (
    <Link
      href={pathname}
      locale={otherLocale}
      className="rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium shadow-sm transition hover:-translate-y-px hover:bg-muted"
    >
      {label}
    </Link>
  );
}
