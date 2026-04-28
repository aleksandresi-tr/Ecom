import { signIn } from "@/lib/auth";
import { routing } from "@/i18n/routing";
import { auth } from "@/lib/auth";
import { AuthError } from "next-auth";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";

type LoginPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ next?: string; error?: string }>;
};

export default async function LoginPage({ params, searchParams }: LoginPageProps) {
  const [{ locale }, { next, error }] = await Promise.all([params, searchParams]);
  const t = await getTranslations("auth");

  if (!routing.locales.includes(locale as "ka" | "en")) {
    redirect(`/${routing.defaultLocale}/login`);
  }

  const session = await auth();
  if (session?.user?.id) {
    redirect(`/${locale}/listings`);
  }

  const callbackUrl = next && next.startsWith("/") ? next : `/${locale}/listings`;

  async function handleLogin(formData: FormData) {
    "use server";

    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");
    const nextPath = String(formData.get("next") ?? "");
    const localeValue = String(formData.get("locale") ?? routing.defaultLocale);

    try {
      await signIn("credentials", {
        email,
        password,
        redirectTo: nextPath && nextPath.startsWith("/") ? nextPath : `/${localeValue}/listings`,
      });
    } catch (authError) {
      if (authError instanceof AuthError) {
        redirect(`/${localeValue}/login?error=credentials&next=${encodeURIComponent(nextPath)}`);
      }
      throw authError;
    }
  }

  return (
    <div className="mx-auto mt-10 w-full max-w-md rounded-2xl border border-border/80 bg-card/95 p-6 shadow-[0_10px_30px_rgba(0,0,0,0.07)]">
      <h2 className="text-xl font-semibold tracking-tight">{t("title")}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{t("hint")}</p>

      <form action={handleLogin} className="mt-6 space-y-4">
        <input type="hidden" name="locale" value={locale} />
        <input type="hidden" name="next" value={callbackUrl} />
        <label className="grid gap-1.5">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {t("email")}
          </span>
          <input
            name="email"
            type="email"
            required
            className="h-10 rounded-lg border border-border bg-background px-3 text-sm outline-none transition focus:border-primary"
            placeholder={t("emailPlaceholder")}
          />
        </label>
        <label className="grid gap-1.5">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {t("password")}
          </span>
          <input
            name="password"
            type="password"
            required
            className="h-10 rounded-lg border border-border bg-background px-3 text-sm outline-none transition focus:border-primary"
            placeholder={t("passwordPlaceholder")}
          />
        </label>

        {error === "credentials" ? (
          <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {t("invalidCredentials")}
          </p>
        ) : null}

        <button
          type="submit"
          className="h-10 w-full rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:opacity-90"
        >
          {t("signIn")}
        </button>
      </form>
    </div>
  );
}
