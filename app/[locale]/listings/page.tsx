import { ListingsWorkspace } from "@/components/ListingsWorkspace";
import { setRequestLocale } from "next-intl/server";

type ListingsPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function ListingsPage({ params }: ListingsPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <ListingsWorkspace />;
}
