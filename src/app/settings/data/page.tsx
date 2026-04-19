import { Metadata } from "next";
import { DataSettings } from "@/components/settings/DataSettings";
import getSession from '@/lib/auth/getSession'; 
import { DecodedIdToken } from 'firebase-admin/auth';
import { redirect } from 'next/navigation';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: `Gestión de Datos | LudiGame`,
    description: 'Exportar información y gestión de datos de cuenta'
  };
}

export default async function DataSettingsPage() {
  const token: DecodedIdToken | null = await getSession();
  
  if (!token) {
    redirect('/auth/login');
  }

  return (
    <div style={{ padding: '10px' }}>
      <DataSettings />
    </div>
  );
}