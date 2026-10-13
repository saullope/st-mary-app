'use client'

import { DescriptionForm } from "./DescriptionForm";
import { FirebaseError } from "firebase/app";
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { sendResetPasswordEmail } from "@/features/auth/services/authService";
import { TitleLoginForm } from "./TitleLoginForm";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import * as Yup from 'yup';
import Link from "next/link";
import styles2 from '@/styles/pages/auth-session.module.css';

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
        <div className={styles2.container}>
            <div className={styles2.card}>
                <div className={styles2.left}>
                    <TitleLoginForm icon="🔒" title={t("titleForgotPassword")} />
                    <DescriptionForm text={t("recoverDescription")} />

                    <Formik
                        initialValues={{ email: '' }}
                        validationSchema={validationSchema}
                        onSubmit={onSubmit}
                    >
                        {({ isSubmitting }) => (
                            <Form>
                                <div className={styles2['input-group']}>
                                    <Field
                                        type="email"
                                        name="email"
                                        placeholder={t("emailPlaceholder") || "name@example.com"}
                                        className={styles2['input']}
                                    />
                                    <ErrorMessage name="email" component="div" className="text-danger mt-1" />
                                </div>
                                <div className="text-center">
                                    {isSubmitting ? (
                                        <button
                                            type="submit"
                                            className={styles2['btn-primary']}
                                            disabled
                                        >
                                            <div className="spinner-border text-light spinner-border-sm" role="status">
                                                <span className="visually-hidden">Loading...</span>
                                            </div>
                                        </button>
                                    ) : (
                                        <button
                                            type="submit"
                                            className={styles2['btn-primary']}
                                            disabled={isSubmitting}
                                        >
                                            {t("sendButton") || "Send Recovery Email"}
                                        </button>
                                    )}


                                    <p>
                                        <Link href={'/auth/login'} className={styles2['back-link']}>
                                            {`← ${t("backToLogin")}`}
                                        </Link>
                                    </p>
                                </div>
                            </Form>
                        )}
                    </Formik>
                </div>

                <div className={styles2.right}>
                </div>
            </div>
        </div>
    );
}
