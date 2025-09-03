'use client'

import Link from 'next/link';
import { useTranslations } from "next-intl";
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { createUserWithEmailAndPassword, sendEmailVerification, updateProfile } from "firebase/auth";
import { auth } from "@/firebase/firebase";
import * as Yup from 'yup';
import styles from '../../public/css/landing.module.css';
import { Toaster, toast } from "sonner";

export const SignUpForm = () => {

    const t = useTranslations("SignUpForm");

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

    const onSubmit = async (values: { email: string, password: string, name: string, lastName: string }, { setSubmitting, setErrors, resetForm }: any) => {
        
        try {
            
            const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
            const user = userCredential.user;

            await sendEmailVerification(user);
       
            if (auth.currentUser) {
                await updateProfile(auth.currentUser, { displayName: `${values.name} ${values.lastName}` });
                toast.success(t("usercreate"));

                toast.message(t("verifyEmailTitle"), {
                    description: t("verifyEmailDescription"),
                });

            }

            // clear los inputs
            resetForm();
        } catch (error: any) {
            if (error.code === 'auth/email-already-in-use') {
                //setErrors({ email: t("emailInUse") });
                toast.warning(t("errorEmailAlreadyInUse"));
            } else {
                setErrors({ submit: "No hay error" });
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
                            {({ isSubmitting, errors }) => (
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
        
                                        <button
                                            type="submit"
                                            className={styles['btn-register']}
                                            disabled={isSubmitting}
                                        >
                                            {t("signUpButton")}
                                        </button>
                                </Form>
                            )}
                        </Formik>
                    </div>
            </div>
        </>
    )
}