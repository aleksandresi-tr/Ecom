import { redirect } from "@/i18n/navigation";

type LocaleRootPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function LocaleRootPage({ params }: LocaleRootPageProps) {
  const { locale } = await params;
  redirect({ href: "/listings", locale });
}
