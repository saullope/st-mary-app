import { Metadata } from "next";
import { PersonalInfo } from "@/components/settings/PersonalInfo";
import getSession from '@/lib/auth/getSession'; 
import { DecodedIdToken } from 'firebase-admin/auth';
import { redirect } from 'next/navigation';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: `Información Personal | LudiGame`,
    description: 'Ajustes de información personal de LudiGame'
  };
}

export default async function SettingsPage() {
  const token: DecodedIdToken | null = await getSession();
  
  if (!token) {
    redirect('/auth/login');
  }

  return (
    <div style={{ padding: '10px' }}>
      <PersonalInfo />
    </div>
  );
}