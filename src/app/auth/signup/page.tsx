import { SignUpForm } from "@/features/auth/components";
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import getSession from "@/lib/auth/getSession";



export async function generateMetadata(): Promise<Metadata> {
    const t = await getTranslations("AuthenticationMeta");

    return {
        title: t('metaTitleSignUp'),
        description: t('metaSignUpDescription')
    };
}

export default async function SignUpPage() {
    // Se valida la sesión de verdad: una cookie vencida no debe rebotar entre login y el panel.
    if (await getSession()) redirect("/welcome-educator");

    return (
        <>
            <SignUpForm/>
        </>
    )
}