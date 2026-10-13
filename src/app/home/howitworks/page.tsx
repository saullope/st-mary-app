import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { pageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Metadata");
  return pageMetadata({ title: t("howItWorks.title"), description: t("howItWorks.description") });
}

export default function HowitWorks (){
    return (
        <>
        How it works Page
        </>
    )
}