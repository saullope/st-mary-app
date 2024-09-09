import { SignUpForm } from "@/auth-components/SignUpForm";
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";



export async function generateMetadata(): Promise<Metadata> {
    const t = await getTranslations("AuthenticationMeta");

    return {
        title: t('metaTitleSignUp'),
        description: t('metaSignUpDescription')
    };
}

export default function SignUpPage() {

    return (
        <>
            <SignUpForm/>
        </>
    )
}