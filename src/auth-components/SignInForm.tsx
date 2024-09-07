'use client'
import { useTranslations } from "next-intl";
import { FcGoogle } from "react-icons/fc";
import Link from "next/link";
import { auth } from "@/firebase/firebase";
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { Button } from 'react-bootstrap';
import * as Yup from 'yup';
import { signInWithEmailAndPassword } from "firebase/auth";
import { useState } from "react";
import  {useRouter}  from "next/navigation";

export const SignInForm = () => {

    // se obtiene la traduccion del componente
    const t = useTranslations("SignInForm");
    const [ errorLogin, setErrorLogin ] = useState("");
    const router = useRouter();

    // Esquema de validación con Yup
    const validationSchema = Yup.object({
        emailUser: Yup.string().email(t("emailInvalid")).required(t("emailRequired")),
        password: Yup.string().required(t("passwordRequired")),
    });

    // Función para manejar el submit del formulario
    const onSubmit = async (values: { emailUser: string, password: string }) => {
        
        console.log("Cargando...");

        try {
            const userCredential = await signInWithEmailAndPassword(auth, values.emailUser, values.password);


            if (userCredential.user){
                const idToken = await userCredential.user.getIdToken(true);

                await fetch("/api/auth/login", {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${idToken}`,
                    },
                }).then((response) => {
                    if(response.status === 200){
                        console.log("setUpdate(true)");
                        router.push('/dashboard');
                        router.refresh();
                    }
                });
            };
        }catch(error: any) {
            console.log("Termino de cargar");
            if(error.code == "auth/invalid-login-credentials"){
                setErrorLogin(error)
            }
            else if (error.code == "auth/too-many-requests"){
                setErrorLogin(error);
            }
            else {
                setErrorLogin(`Error signin in, ${error}`)
            }
        }
        
       // dispatch(startLoginWithEmailPassword(values.emailUser, values.password) as any);
    }

    const onGoogleSignin = () => {
//        dispatch(startGoogleSignIn() as any)
    }

    return (
        <div className="card mt-5" style={{ width: "25rem" }}>
            <div className="d-flex justify-content-center card-title pt-5 pb-4">
                <h1>{t("titleForm")}</h1>
            </div>
            <div className="card-body ps4">
                <div className="">
                    <Formik
                        initialValues={{ emailUser: '', password: '' }}
                        validationSchema={validationSchema}
                        onSubmit={onSubmit}
                    >
                        {({ isSubmitting }) => (
                            <Form>
                                <div className="mb-3">
                                    <label className="form-label">
                                        {t("email")}
                                    </label>
                                    <Field
                                        type="email"
                                        name="emailUser"
                                        className="form-control"
                                    />
                                    <ErrorMessage name="emailUser" component="div" className="text-danger" />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">
                                        {t("password")}
                                    </label>
                                    <Field
                                        type="password"
                                        name="password"
                                        className="form-control"
                                    />
                                    <ErrorMessage name="password" component="div" className="text-danger" />
                                </div>
                                <div className="mb-3">
                                    {!!errorLogin && (
                                        <p className="text-danger">
                                            {errorLogin}
                                        </p>
                                    )}
                                </div>
                                <div className="d-flex form-text">
                                    <div><Link href={'/auth/forgot-password'}>{t('forgotPassword')}</Link></div>
                                </div>
                                <div className="d-flex form-text">
                                    <div>{`${t('noAccount')} `}</div>
                                    <div><Link href={'/auth/signup'}>{t('signUp')}</Link></div>
                                </div>
                                <div className="d-grid gap-2 mt-2" >
                                    <Button
                                        type="submit"
                                        variant="primary"
                                        disabled={isSubmitting}
                                    >
                                        {t("signInButton")}
                                    </Button>
                                </div>
                            </Form>
                        )}
                    </Formik>
                    <div className="d-grid gap-2 mt-3">
                        <Button
                            type="button"
                            variant="light"
                            onClick={onGoogleSignin}
                            className="d-flex align-items-center justify-content-center"
                        >
                            <FcGoogle className="me-2" />
                            {t("SignInWithGoogle")}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}