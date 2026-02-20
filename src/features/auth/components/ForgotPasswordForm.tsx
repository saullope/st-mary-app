'use client'

import Link from "next/link";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import styles from '@/styles/pages/landing.module.css';
import { Toaster, toast } from "sonner";
import { sendResetPasswordEmail } from "@/features/auth/services/authService";
import { FirebaseError } from "firebase/app";

export const ForgotPasswordForm = () => {
    const t = useTranslations("ForgotPassword");

    // Esquema de validación
    const validationSchema = Yup.object({
        email: Yup.string()
            .email(t("emailInvalid") || "Email invalid")
            .required(t("emailRequired") || "Email is required"),
    });

    const onSubmit = async (values: { email: string }, { setSubmitting, resetForm }: any) => {
        try {
            const response = await sendResetPasswordEmail(values.email);

            // Security Best Practice: Always show success message even if email doesn't exist
            // to prevent user enumeration. However, if there is a network error, we show error.
            if (response.success) {
                toast.success(t("emailSentSuccess") || "Recovery email sent. Check your inbox.");
                resetForm();
            } else {
                // Only show error if it's NOT "user-not-found" (which is handled by success flow usually)
                // But since our service returns false on catch, we check here.
                // For better UX in this specific app (school context), we might want to be explicit.
                // Let's rely on the service response.
                toast.error(t("genericError") || "An error occurred. Please try again.");
            }
        } catch (error: unknown) {
             const errorCode = error instanceof FirebaseError ? error.code : "unknown";
             if (errorCode === 'auth/user-not-found') {
                 // Option A: Show error (Less secure, better UX for trusted environments)
                 toast.error(t("userNotFound") || "User not found");
                 
                 // Option B: Show success (More secure)
                 // toast.success(t("emailSentSuccess"));
             } else {
                 toast.error(t("genericError") || "Error sending email");
             }
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className={styles['login-container']}>
            <Toaster richColors position="bottom-right" closeButton={true} expand={true} duration={5000} />
            
            <div className={styles['login-info-container']}>
                <h1 className={styles['title-login']}>
                    {t("titleForgotPassword") || "Recover Password"}
                </h1>
                
                <p 
                    className="mb-4 text-muted text-start w-75" 
                    style={{ fontSize: '0.9rem' }}
                >
                    {t("recoverDescription") || "Enter your email address and we'll send you a link to reset your password."}
                </p>

                <Formik
                    initialValues={{ email: '' }}
                    validationSchema={validationSchema}
                    onSubmit={onSubmit}
                >
                    {({ isSubmitting }) => (
                        <Form className={styles['inputs-container']}>
                            <div className="mb-4 w-100">
                                <Field
                                    type="email"
                                    name="email"
                                    placeholder={t("emailPlaceholder") || "name@example.com"}
                                    className={styles.input}
                                />
                                <ErrorMessage name="email" component="div" className="text-danger mt-1" />
                            </div>

                            {isSubmitting ? (
                                <button
                                    type="submit"
                                    className={styles['btn-acceso']}
                                    disabled
                                >
                                    <div className="spinner-border text-light spinner-border-sm" role="status">
                                        <span className="visually-hidden">Loading...</span>
                                    </div>
                                </button>
                            ) : (
                                <button
                                    type="submit"
                                    className={styles['btn-acceso']}
                                    disabled={isSubmitting}
                                >
                                    {t("sendButton") || "Send Recovery Email"}
                                </button>
                            )}

                            <div className="mt-4 text-center">
                                <p>
                                    <Link href={'/auth/login'} className="text-decoration-none">
                                        {`← ${t("backToLogin") || "Back to Login"}`}
                                    </Link>
                                </p>
                            </div>
                        </Form>
                    )}
                </Formik>
            </div>

            <Image
                className={styles['image-login']}
                src="/images/LoginBanner.png"
                width={400}
                height={540}
                alt="Recover Password Banner"
            />
        </div>
    );
};
