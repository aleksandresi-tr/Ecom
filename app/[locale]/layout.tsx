import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { routing } from "@/i18n/routing";
import { auth, signOut } from "@/lib/auth";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import Link from "next/link";
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
  const session = await auth();

  async function handleSignOut() {
    "use server";
    await signOut({
      redirectTo: `/${locale}/login`,
    });
  }

  return (
    <NextIntlClientProvider messages={messages}>
      <div className="min-h-screen bg-grid-soft bg-gradient-to-b from-muted/30 via-background to-background">
        <div className="pointer-events-none fixed inset-x-0 top-0 -z-10 mx-auto h-64 max-w-[1600px] bg-[radial-gradient(circle_at_20%_20%,color-mix(in_oklab,var(--primary)_14%,transparent),transparent_45%),radial-gradient(circle_at_80%_10%,color-mix(in_oklab,var(--chart-1)_20%,transparent),transparent_40%)]" />
        <header className="sticky top-0 z-20 border-b border-border/80 bg-background/88 shadow-[0_6px_24px_rgba(0,0,0,0.05)] backdrop-blur-xl">
          <div className="mx-auto flex w-full max-w-[1600px] items-center justify-between gap-4 px-4 py-4">
            <div>
              <h1 className="text-lg font-semibold tracking-tight">{t("title")}</h1>
              <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
            </div>
            <div className="flex items-center gap-2">
              {session?.user ? (
                <>
                  <Link
                    href={`/${locale}/listings`}
                    className="rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium shadow-sm transition hover:-translate-y-px hover:bg-muted"
                  >
                    {t("navListings")}
                  </Link>
                  {session.user.role === "ADMIN" || session.user.role === "SUPER_ADMIN" ? (
                    <>
                      <Link
                        href={`/${locale}/admin`}
                        className="rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium shadow-sm transition hover:-translate-y-px hover:bg-muted"
                      >
                        {t("navAdmin")}
                      </Link>
                      <Link
                        href={`/${locale}/teams`}
                        className="rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium shadow-sm transition hover:-translate-y-px hover:bg-muted"
                      >
                        {t("navTeams")}
                      </Link>
                    </>
                  ) : null}
                  <form action={handleSignOut}>
                    <button
                      type="submit"
                      className="rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium shadow-sm transition hover:-translate-y-px hover:bg-muted"
                    >
                      {t("signOut")}
                    </button>
                  </form>
                </>
              ) : (
                <Link
                  href={`/${locale}/login`}
                  className="rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium shadow-sm transition hover:-translate-y-px hover:bg-muted"
                >
                  {t("signIn")}
                </Link>
              )}
              <LanguageSwitcher locale={locale} label={t("languageSwitch")} />
            </div>
          </div>
        </header>
        <main className="mx-auto w-full max-w-[1600px] px-4 py-6">{children}</main>
      </div>
    </NextIntlClientProvider>
  );
}
