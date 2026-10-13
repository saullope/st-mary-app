import { ForgotPasswordForm } from "@/features/auth/components/ForgotPasswordForm";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { pageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Metadata");
  return pageMetadata({ title: t("forgotPassword.title"), description: t("forgotPassword.description") });
}

export default function ForgotPasswordPage() {
    return (
        <ForgotPasswordForm />
    );
}