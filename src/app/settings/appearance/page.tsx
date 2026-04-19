import { Metadata } from "next";
import { AppearanceSettings } from "@/components/settings/AppearanceSettings";
import getSession from '@/lib/auth/getSession'; 
import { DecodedIdToken } from 'firebase-admin/auth';
import { redirect } from 'next/navigation';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: `Apariencia e Idioma | LudiGame`,
    description: 'Configuración visual y lenguaje de LudiGame'
  };
}

export default async function AppearancePage() {
  const token: DecodedIdToken | null = await getSession();
  
  if (!token) {
    redirect('/auth/login');
  }

  return (
    <div style={{ padding: '10px' }}>
      <AppearanceSettings />
    </div>
  );
}