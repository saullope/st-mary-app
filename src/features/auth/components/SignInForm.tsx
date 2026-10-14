'use client'
import { useTranslations } from "next-intl";
import Link from "next/link";
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { safeRedirectPath } from "@/lib/auth/redirect";
import styles from '@/styles/pages/auth-session.module.css';
import Image from "next/image";
import { toast } from "sonner";
import { loginWithEmail, loginWithGoogle } from "@/features/auth/services/authService";
import { FirebaseError } from "firebase/app";
import { TitleLoginForm } from "./TitleLoginForm";
import { FcGoogle } from "react-icons/fc";

export const SignInForm = () => {
    const t = useTranslations("SignInForm");
    const [errorLogin, setErrorLogin] = useState("");
    const [isLoading, setLoading] = useState(false);
    const router = useRouter();

    // Explica por qué se cerró la sesión cuando se llega desde el cierre automático.
    useEffect(() => {
        const reason = new URLSearchParams(window.location.search).get("reason");
        if (reason === "idle") toast.info(t("sessionEndedIdle"));
        if (reason === "absolute") toast.info(t("sessionEndedAbsolute"));
    }, [t]);

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
        // Vuelve a la página protegida que pidió el usuario antes del login.
        router.push(safeRedirectPath(new URLSearchParams(window.location.search).get('redirect')));
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
            if (error?.code === 'auth/popup-closed-by-user' || error?.code === 'auth/cancelled-popup-request') {
                return; // User cancelled, no need to show error
            }
            // La primera ventana de la sesión espera a que Firebase cargue su iframe y el
            // navegador puede bloquearla; al reintentar ya abre en el mismo clic.
            if (error?.code === 'auth/popup-blocked') {
                toast.warning(t("errorPopupBlocked"));
                return;
            }

            console.error(error);
            toast.error(t("errorLogionWithGoogle"));
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <div className={styles.left}>

                    <TitleLoginForm icon="🔒" title={t("titleForm")} />

                    <div className="text-center">
                    <p>{t("orSignIn")}</p>
                    </div>
                    <Formik
                        initialValues={{ emailUser: '', password: '' }}
                        validationSchema={validationSchema}
                        onSubmit={onSubmit}
                    >
                        {({ isSubmitting }) => (
                            <Form>
                                <div className={styles['input-group']}>
                                    <Field
                                        type="email"
                                        name="emailUser"
                                        placeholder={t("email")}
                                        className={styles['input']}
                                    />
                                    <ErrorMessage name="emailUser" component="div" className="text-danger" />
                                </div>
                                <div className={`${styles['input-group']} mt-2`}>
                                    <Field
                                        type="password"
                                        name="password"
                                        placeholder={t("password")}
                                        className={styles['input']}
                                    />
                                    <ErrorMessage name="password" component="div" className="text-danger" />
                                </div>
                                <div>
                                    {!!errorLogin && (
                                        <p className="text-danger">
                                            {errorLogin}
                                        </p>
                                    )}
                                </div>
                                <p> {t('forgotPassword')}
                                    <Link className={styles['back-link']} href={'/auth/forgot-password'}>{` ${t('clickHere')}`}</Link>
                                </p>
                                <div className="text-center">
                                    {
                                        !isLoading ?
                                            <button
                                                type="submit"
                                                className={styles['btn-primary']}
                                                disabled={isSubmitting}
                                            >
                                                {t("signInButton")}
                                            </button>
                                            :
                                            <button
                                                type="submit"
                                                className={styles['btn-primary']}
                                                disabled
                                            >
                                                <div className="spinner-border text-light" role="status">
                                                </div>
                                            </button>
                                    }

                                </div>
                            </Form>
                        )}
                    </Formik>
                    <button
                        className={styles['btn-google']}
                        onClick={onGoogleSignin}
                        type="button"
                    >
                        <FcGoogle size={18} />
                        {t("SignInWithGoogle")}
                    </button>
                    <p>
                        {`${t('noAccount')} `}
                        <Link className={styles['back-link']} href={'/auth/signup'}>{t('signUp')}</Link>
                    </p>
                </div>
                <div className={styles.right}>
                </div>
            </div>
        </div>
    );
}
