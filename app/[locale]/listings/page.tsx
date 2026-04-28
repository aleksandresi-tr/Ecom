import { ListingsWorkspace } from "@/components/ListingsWorkspace";
import { auth } from "@/lib/auth";
import { setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";

type ListingsPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function ListingsPage({ params }: ListingsPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const session = await auth();

  if (!session?.user?.id) {
    redirect(`/${locale}/login?next=/${locale}/listings`);
  }

  const isAdmin = session.user.role === "ADMIN" || session.user.role === "SUPER_ADMIN";

  return (
    <ListingsWorkspace
      canManageTopics={isAdmin}
      isAdmin={isAdmin}
    />
  );
}
