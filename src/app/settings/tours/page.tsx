import { Metadata } from 'next';
import { TourSettings } from '@/components/settings/TourSettings';
import getSession from '@/lib/auth/getSession';
import { DecodedIdToken } from 'firebase-admin/auth';
import { redirect } from 'next/navigation';
import { getTranslations } from "next-intl/server";
import { pageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Metadata");
  return pageMetadata({ title: t("settings.tours.title"), description: t("settings.tours.description") });
}

export default async function ToursPage() {
  const token: DecodedIdToken | null = await getSession();

  if (!token) {
    redirect('/auth/login');
  }

  return (
    <div style={{ padding: '10px' }}>
      <TourSettings />
    </div>
  );
}
