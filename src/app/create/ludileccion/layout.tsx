import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { pageMetadata } from "@/lib/seo/metadata";

// La página es un componente cliente: el título del editor se declara aquí.
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Metadata.editor");
  return pageMetadata({ title: t("ludileccion"), description: t("description") });
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
