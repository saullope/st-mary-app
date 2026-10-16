import { Metadata } from "next";
import { GamePreferences } from "@/components/settings/GamePreferences";
import getSession from '@/lib/auth/getSession'; 
import { DecodedIdToken } from 'firebase-admin/auth';
import { redirect } from 'next/navigation';
import { getTranslations } from "next-intl/server";
import { pageMetadata } from "@/lib/seo/metadata";
import getCurrentUser from "@/lib/auth/getCurrentUser";
import { SubjectSettings } from "@/components/settings/SubjectSettings";
import { getSubjectsByGrade, getUserSubjectIdsByGrade } from "@/features/subjects/subjects.server";
import { NotificationSettings } from "@/components/settings/NotificationSettings";
import { getMutedTypes } from "@/features/notifications/notifications.server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Metadata");
  return pageMetadata({ title: t("settings.preferences.title"), description: t("settings.preferences.description") });
}

export default async function GamePreferencesPage() {
  const token: DecodedIdToken | null = await getSession();
  
  const user = await getCurrentUser();
  if (!token || !user) {
    redirect('/auth/login');
  }

  const [subjectsByGrade, selectedSubjects, mutedNotifications] = await Promise.all([
    getSubjectsByGrade(),
    getUserSubjectIdsByGrade(user.id),
    getMutedTypes(user.id),
  ]);

  return (
    <div style={{ padding: '10px' }}>
      <GamePreferences />
      <SubjectSettings subjectsByGrade={subjectsByGrade} initialSelected={selectedSubjects} />
      <NotificationSettings initialMuted={mutedNotifications} />
    </div>
  );
}