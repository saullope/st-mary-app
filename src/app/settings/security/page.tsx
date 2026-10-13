import { Metadata } from "next";
import { SecuritySettings } from "@/components/settings/SecuritySettings";
import getSession from '@/lib/auth/getSession'; 
import { DecodedIdToken } from 'firebase-admin/auth';
import { redirect } from 'next/navigation';
import { getTranslations } from "next-intl/server";
import { pageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Metadata");
  return pageMetadata({ title: t("settings.security.title"), description: t("settings.security.description") });
}

export default async function SecurityPage() {
  const token: DecodedIdToken | null = await getSession();
  
  if (!token) {
    redirect('/auth/login');
  }

  return (
    <div style={{ padding: '10px' }}>
      <SecuritySettings />
    </div>
  );
}