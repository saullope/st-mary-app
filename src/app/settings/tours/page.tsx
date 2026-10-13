import { Metadata } from 'next';
import { TourSettings } from '@/components/settings/TourSettings';
import getSession from '@/lib/auth/getSession';
import { DecodedIdToken } from 'firebase-admin/auth';
import { redirect } from 'next/navigation';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Visitas Guiadas | LudiGame',
    description: 'Configuración de visitas guiadas interactivas de LudiGame',
  };
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
