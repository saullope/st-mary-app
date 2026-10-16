import { Metadata } from "next";
import { AdminUsers } from "@/components/settings/AdminUsers";
import { TemplateCatalogSync } from "@/components/settings/TemplateCatalogSync";
import getSession from '@/lib/auth/getSession'; 
import getCurrentUser from '@/lib/auth/getCurrentUser';
import { DecodedIdToken } from 'firebase-admin/auth';
import { redirect } from 'next/navigation';
import { getTranslations } from "next-intl/server";
import { pageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Metadata");
  return pageMetadata({ title: t("settings.admin.title"), description: t("settings.admin.description") });
}

export default async function AdminPage() {
  const token: DecodedIdToken | null = await getSession();
  const dbUser = await getCurrentUser();
  
  if (!token || !dbUser) {
    redirect('/auth/login');
  }

  // Verificar que es administrador (rolId === 1)
  if (dbUser.rolId !== 1) {
    redirect('/dashboard');
  }

  return (
    <div style={{ padding: '10px' }}>
      <AdminUsers />
      <TemplateCatalogSync />
    </div>
  );
}