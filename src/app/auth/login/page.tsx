import { SignInForm } from "@/auth-components/SignInForm";
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";


export async function generateMetadata(): Promise<Metadata> {
    const t = await getTranslations("AuthenticationMeta");

    return {
        title: t('metaTitleSignIn'),
        description: t('metaSignInDescription')
    };
}

export default async function LoginPage() {

    return (
        <>
            <SignInForm />
        </>
    );
}
