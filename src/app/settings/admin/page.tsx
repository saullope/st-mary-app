import { Metadata } from "next";
import { AdminUsers } from "@/components/settings/AdminUsers";
import getSession from '@/lib/auth/getSession'; 
import getCurrentUser from '@/lib/auth/getCurrentUser';
import { DecodedIdToken } from 'firebase-admin/auth';
import { redirect } from 'next/navigation';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: `Administración | LudiGame`,
    description: 'Gestión de usuarios y sistema'
  };
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
    </div>
  );
}