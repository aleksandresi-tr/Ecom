import { TeamsManager } from "@/components/TeamsManager";
import { auth } from "@/lib/auth";
import { setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";

type TeamsPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function TeamsPage({ params }: TeamsPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const session = await auth();

  if (!session?.user?.id) {
    redirect(`/${locale}/login?next=/${locale}/teams`);
  }

  if (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN") {
    redirect(`/${locale}/listings`);
  }

  return <TeamsManager />;
}
