import { SignInForm } from "@/features/auth/components";
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import getCurrentUser from "@/lib/auth/getCurrentUser";
import { pageMetadata } from "@/lib/seo/metadata";


export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("AuthenticationMeta");
  return pageMetadata({ title: t("metaTitleSignIn"), description: t("metaSignInDescription"), path: "/auth/login", index: true });
}

export default async function LoginPage() {
    // Se valida la sesión de verdad y que tenga usuario local: una cookie vencida, o de una
    // cuenta de Firebase que ya no coincide con la BD, no debe rebotar entre login y el panel.
    if (await getCurrentUser()) redirect("/welcome-educator");

    return (
        <>
            <SignInForm />
        </>
    );
}
