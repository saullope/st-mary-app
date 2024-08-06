import { Metadata } from "next";
import { useTranslations } from "next-intl";

export const metadata: Metadata = {
    title: "St. Mary App",
    description: "",
  };

export default function HomePage(){

    const t = useTranslations("HomePage");

    return (
        <>
        <p>{t('message')}</p>
        </>
    )
}