'use client'
import { useTranslations } from "next-intl";
import Link from "next/link";
import { auth } from "@/firebase/firebase";
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from '../../public/css/landing.module.css';
import logoGoogle from '../../public/images/LogoGoogle.png';
import loginBanner from '../../public/images/LoginBanner.png';
import Image from "next/image";


export const SignInForm = () => {

    // se obtiene la traduccion del componente
    const t = useTranslations("SignInForm");
    const googleProvider = new GoogleAuthProvider();
    const [errorLogin, setErrorLogin] = useState("");
    const [isLoading, setLoading] = useState(false);

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
                        //router.push('/dashboard');
                        router.push('/welcome-educator');
                        router.refresh();
                    }
                });
            };
        } catch (error: any) {
            setLoading(false);
            console.log("termino de cargar");
            if (error.code == "auth/invalid-login-credentials") {
                setErrorLogin(error)
            }
            else if (error.code == "auth/too-many-requests") {
                setErrorLogin(error);
            }
            else {
                setErrorLogin(`Error signin in, ${error}`)
            }
        }

    }

    const onGoogleSignin = async () => {
        try {
            const result = await signInWithPopup(auth, googleProvider);

            if (result.user) {
                const idToken = await result.user.getIdToken(true);

                await fetch("/api/auth/login", {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${idToken}`,
                    },
                }).then((response) => {
                    if (response.status === 200) {
                        console.log("setUpdate(true)");
                        //router.push('/dashboard');
                        router.push('/welcome-educator');
                        router.refresh();
                    }
                });
            }
        } catch (error: any) {
            console.log("Error en el inicio de sesión con Google");
            setErrorLogin(`Error signin in with Google, ${error.message}`);
        }
    }

    return (
        <div className={styles['login-container']}>
            <div className={styles['login-info-container']}>
                <h1 className={styles['title-login']}>
                    {t("titleForm")} </h1>
                <div className={styles['social-login']}>
                    <div
                        onClick={onGoogleSignin}
                        className={styles['social-login-element']}
                    >
                        <Image
                            src={logoGoogle}
                            width={50}
                            height={50}
                            alt="google-image"
                        />
                        {t("SignInWithGoogle")}
                    </div>
                </div>
                <p>o</p>
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
                src={loginBanner}
                width={400}
                height={540}
                alt="Log in Image"
            />
        </div>
    )
}