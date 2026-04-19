'use client'
import { useTranslations } from "next-intl";
import Link from "next/link";
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from '@/styles/pages/landing.module.css';
import Image from "next/image";
import { Toaster, toast } from "sonner";
import { loginWithEmail, loginWithGoogle } from "@/features/auth/services/authService";
import { FirebaseError } from "firebase/app";

export const SignInForm = () => {
    const t = useTranslations("SignInForm");
    const [errorLogin, setErrorLogin] = useState("");
    const [isLoading, setLoading] = useState(false);
    const router = useRouter();

    const validationSchema = Yup.object({
        emailUser: Yup.string().email(t("emailInvalid")).required(t("emailRequired")),
        password: Yup.string().required(t("passwordRequired")),
    });

    const handleAuthError = (error: unknown) => {
        setLoading(false);
        
        // Define specific Firebase error type locally or import if available
        const errorCode = error instanceof FirebaseError ? error.code : "unknown";

        const errorMap: Record<string, { message: string, type: "error" | "warning" | "info" }> = {
            "auth/invalid-credential": { message: t("errorInvalidCredentials"), type: "error" },
            "auth/user-not-found": { message: t("errorUserNotFound"), type: "error" },
            "auth/wrong-password": { message: t("errorWrongPassword"), type: "error" },
            "auth/invalid-email": { message: t("errorInvalidEmail"), type: "error" },
            "auth/user-disabled": { message: t("errorUserDisabled"), type: "error" },
            "auth/too-many-requests": { message: t("errorTooManyRequests"), type: "warning" },
            "auth/network-request-failed": { message: t("errorNetwork"), type: "warning" },
            "auth/internal-error": { message: t("errorInternal"), type: "info" },
        };

        const fallbackMessage = t("genericError");
        const errorData = errorMap[errorCode] || { message: fallbackMessage, type: "error" };

        switch (errorData.type) {
            case "error": toast.error(errorData.message); break;
            case "warning": toast.warning(errorData.message); break;
            case "info": toast.info(errorData.message); break;
        }
    };

    const handleSuccess = (userName?: string | null) => {
        toast.success(`${t("welcome")}, ${userName || 'User'}`);
        router.push('/welcome-educator');
        router.refresh();
    };

    const onSubmit = async (values: { emailUser: string, password: string }) => {
        setLoading(true);
        setErrorLogin(""); // Clear previous errors

        try {
            const response = await loginWithEmail(values.emailUser, values.password);
            
            if (response.success) {
                handleSuccess(response.user?.displayName); 
            } else {
                setLoading(false);
                toast.error(response.message || t("genericError"));
            }
        } catch (error) {
            handleAuthError(error);
        }
    };

    const onGoogleSignin = async () => {
        try {
            const response = await loginWithGoogle();
            
            if (response.success) {
                handleSuccess(response.user?.displayName);
            } else {
                toast.error(response.message || t("genericError"));
            }
        } catch (error: any) {
            // Handle Google popup closure gracefully
            if (error?.code === 'auth/popup-closed-by-user') {
                return; // User cancelled, no need to show error
            }
            
            console.error(error);
            toast.error(t("errorLogionWithGoogle"));
        }
    };

    return (
        <div className={styles['login-container']}>
            <Toaster richColors position="bottom-right" closeButton={true} expand={true} duration={5000} />
            <div className={styles['login-info-container']}>
                <h1 className={styles['title-login']}>
                    {t("titleForm")} </h1>
                <div className={styles['social-login']}>
                    <div
                        onClick={onGoogleSignin}
                        className={styles['social-login-element']}
                        role="button"
                        tabIndex={0}
                    >
                        <Image
                            src="/images/LogoGoogle.png"
                            width={50}
                            height={50}
                            alt="google-image"
                        />
                        {t("SignInWithGoogle")}
                    </div>
                </div>
                <p>{t("orSignIn")}</p>
                <Formik
                    initialValues={{ emailUser: '', password: '' }}
                    validationSchema={validationSchema}
                    onSubmit={onSubmit}
                >
                    {({ isSubmitting }) => (
                        <Form className={styles['inputs-container']}>
                            <Field
                                type="email"
                                name="emailUser"
                                placeholder={t("email")}
                                className={styles.input}
                            />
                            <ErrorMessage name="emailUser" component="div" className="text-danger" />
                            <Field
                                type="password"
                                name="password"
                                placeholder={t("password")}
                                className={styles.input}
                            />
                            <ErrorMessage name="password" component="div" className="text-danger" />
                            <div className="mb-3">
                                {!!errorLogin && (
                                    <p className="text-danger">
                                        {errorLogin}
                                    </p>
                                )}
                            </div>
                            <p> {t('forgotPassword')}
                                <Link href={'/auth/forgot-password'}>{` ${t('clickHere')}`}</Link>
                            </p>
                            {
                                !isLoading ?
                                    <button
                                        type="submit"
                                        className={styles['btn-acceso']}
                                        disabled={isSubmitting}
                                    >
                                        {t("signInButton")}
                                    </button>
                                    :
                                    <button
                                        type="submit"
                                        className={styles['btn-acceso']}
                                        disabled
                                    >
                                        <div className="spinner-border text-primary" role="status">
                                        </div>
                                    </button>
                            }
                            <p>
                                {`${t('noAccount')} `}
                                <Link href={'/auth/signup'}>{t('signUp')}</Link>
                            </p>
                        </Form>
                    )}
                </Formik>
            </div>
            <Image
                className={styles['image-login']}
                src="/images/LoginBanner.png"
                width={400}
                height={540}
                alt="Log in Image"
            />
        </div>
    )
}
