'use client'
import { useTranslations } from "next-intl";
import Link from "next/link";
import { auth } from "@/firebase/firebase";
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from '@/styles/pages/landing.module.css';
import Image from "next/image";
import { Toaster, toast } from "sonner";


export const SignInForm = () => {

    // se obtiene la traduccion del componente
    const t = useTranslations("SignInForm");
    const googleProvider = new GoogleAuthProvider();
    const [errorLogin, setErrorLogin] = useState("");
    const [isLoading, setLoading] = useState(false);

    googleProvider.setCustomParameters({
    prompt: 'select_account',
});

    const router = useRouter();

    // Esquema de validación con Yup
    const validationSchema = Yup.object({
        emailUser: Yup.string().email(t("emailInvalid")).required(t("emailRequired")),
        password: Yup.string().required(t("passwordRequired")),
    });

    // Función para manejar el submit del formulario
    const onSubmit = async (values: { emailUser: string, password: string }) => {

        setLoading(true);

        try {
            const userCredential = await signInWithEmailAndPassword(auth, values.emailUser, values.password);

            if (userCredential.user) {
                const idToken = await userCredential.user.getIdToken(true);

                await fetch("/api/auth/login", {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${idToken}`,
                    },
                }).then((response) => {
                    if (response.status === 200) {
                        toast.success(`${t("welcome")}, ${userCredential.user.displayName}`);
                        router.push('/welcome-educator');
                        router.refresh();
                    }
                });
            };
        } catch (error: any) {
            setLoading(false);
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
        const errorData = errorMap[error.code] || { message: fallbackMessage, type: "error" };

        switch (errorData.type) {
            case "error":
                toast.error(errorData.message);
                break;
            case "warning":
                toast.warning(errorData.message);
                break;
            case "info":
                toast.info(errorData.message);
                break;
        }
        }

    }

    const onGoogleSignin = async () => {
        try {
            const result = await signInWithPopup(auth, googleProvider);
    
            if (result.user) {
                const idToken = await result.user.getIdToken(true);
    
                const response = await fetch("/api/auth/login", {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${idToken}`,
                    },
                });
    
                if (response.status === 200) {
                    toast.success(`${t("welcome")}, ${result.user.displayName}`);
                    router.push('/welcome-educator');
                    router.refresh();
                } else {
                    toast.error(t("genericError"));
                }
            } else {
                toast.error(t("errorNotFindUser"));
            }
        } catch (error: any) {
            toast.error(`${t("errorLogionWithGoogle")}`);
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