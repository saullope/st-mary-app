import { Metadata } from "next";
import { SecuritySettings } from "@/components/settings/SecuritySettings";
import getSession from '@/lib/auth/getSession'; 
import { DecodedIdToken } from 'firebase-admin/auth';
import { redirect } from 'next/navigation';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: `Seguridad | LudiGame`,
    description: 'Ajustes de seguridad y contraseña'
  };
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