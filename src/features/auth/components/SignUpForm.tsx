'use client'

import Link from 'next/link';
import { useTranslations } from "next-intl";
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import styles from '@/styles/pages/landing.module.css';
import { Toaster, toast } from "sonner";
import { registerUser } from "@/features/auth/services/authService";
import { useRouter } from "next/navigation";
import { FirebaseError } from "firebase/app";

export const SignUpForm = () => {

    const t = useTranslations("SignUpForm");
    const router = useRouter();

    const validationSchema = Yup.object({
        email: Yup.string().email(t("emailInvalid")).required(t("emailRequired")),
        password: Yup.string()
        .min(8, t("passwordMin"))
            .matches(/[0-9]/, t("passwordNumber"))
            .matches(/[a-z]/, t("passwordLowercase"))
            .matches(/[A-Z]/, t("passwordUppercase"))
            .required(t("passwordRequired")),
        confirmPassword: Yup.string()
            .oneOf([Yup.ref('password'), ""], t("passwordsDontMatch"))
            .required(t("confirmPasswordRequired")),
        name: Yup.string().required(t("nameRequired")),
        lastName: Yup.string().default("")
    });

    const onSubmit = async (
        values: { email: string, password: string, name: string, lastName: string }, 
        { setSubmitting, resetForm }: any
    ) => {
        try {
            const response = await registerUser(values.email, values.password, values.name, values.lastName);

            if (response.success) {
                toast.success(t("usercreate"));
                toast.message(t("verifyEmailTitle"), {
                    description: t("verifyEmailDescription"),
                });

                // Auto-login successful: Redirect
                // Small delay to let the toast be seen or immediately redirect? 
                // Usually immediate is fine with toast persistence or dashboard welcome.
                router.push('/welcome-educator');
                router.refresh();
                resetForm();
            } else {
                toast.error(response.message || t("genericError"));
            }

        } catch (error: unknown) {
            const errorCode = error instanceof FirebaseError ? error.code : "unknown";
            
            if (errorCode === 'auth/email-already-in-use') {
                toast.warning(t("errorEmailAlreadyInUse"));
            } else {
                // Log unhandled errors for debugging
                console.error("Registration error:", error);
                toast.error(t("genericError"));
            }
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <>
            <div className={styles['body-registro']}>
                <Toaster richColors position="bottom-right" closeButton={true} expand={true} duration={6000}/>
                    <div className="">
                        <Formik
                            initialValues={{ email: '', password: '', confirmPassword: '', name: '', lastName: '' }}
                            validationSchema={validationSchema}
                            onSubmit={onSubmit}
                        >
                            {({ isSubmitting }) => (
                                <Form className={styles['form-register']}>
                                    <h4>{t("titleForm")}</h4>
                                        <Field
                                            type="text"
                                            name="name"
                                            className={styles['input-register']}
                                            placeholder={t('name')}
                                        />
                                        <ErrorMessage name="name" component="div" className="text-danger" />
                                    
                                        <Field
                                            type="text"
                                            name="lastName"
                                            className={styles['input-register']}
                                            placeholder={t('lastName')}
                                        />
                                        <ErrorMessage name="lastName" component="div" className="text-danger" />
                                
                                        <Field
                                            type="email"
                                            name="email"
                                            className={styles['input-register']}
                                            placeholder={t('email')}
                                        />
                                        <ErrorMessage name="email" component="div" className="text-danger" />
                                    
                                    
                                        <Field
                                            type="password"
                                            name="password"
                                            className={styles['input-register']}
                                            placeholder={t('password')}
                                        />
                                        <ErrorMessage name="password" component="div" className="text-danger" />
                                    
                                    
                                        <Field
                                            type="password"
                                            name="confirmPassword"
                                            className={styles['input-register']}
                                            placeholder={t('confirmPassword')}
                                        />
                                        <ErrorMessage name="confirmPassword" component="div" className="text-danger" />
                                    
                                        <p>{t('haveAccount')}
                                        <Link href={'/auth/login'}>{t('signIn')}</Link>
                                        </p>
        
                                        {isSubmitting ? (
                                            <button
                                                type="submit"
                                                className={styles['btn-register']}
                                                disabled
                                            >
                                                <div className="spinner-border text-light spinner-border-sm" role="status">
                                                    <span className="visually-hidden">Loading...</span>
                                                </div>
                                            </button>
                                        ) : (
                                            <button
                                                type="submit"
                                                className={styles['btn-register']}
                                                disabled={isSubmitting}
                                            >
                                                {t("signUpButton")}
                                            </button>
                                        )}
                                </Form>
                            )}
                        </Formik>
                    </div>
            </div>
        </>
    )
}
