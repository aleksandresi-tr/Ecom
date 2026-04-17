import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { routing } from "@/i18n/routing";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

type LocaleLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const messages = await getMessages();
  const t = await getTranslations("app");

  return (
    <NextIntlClientProvider messages={messages}>
      <div className="min-h-screen bg-gradient-to-b from-muted/30 via-background to-background">
        <header className="sticky top-0 z-20 border-b border-border/80 bg-background/95 backdrop-blur">
          <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-4">
            <div>
              <h1 className="text-lg font-semibold tracking-tight">{t("title")}</h1>
              <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
            </div>
            <LanguageSwitcher locale={locale} label={t("languageSwitch")} />
          </div>
        </header>
        <main className="mx-auto w-full max-w-7xl px-4 py-6">{children}</main>
      </div>
    </NextIntlClientProvider>
  );
}
