import { Metadata } from "next";
import { GamePreferences } from "@/components/settings/GamePreferences";
import getSession from '@/lib/auth/getSession'; 
import { DecodedIdToken } from 'firebase-admin/auth';
import { redirect } from 'next/navigation';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: `Preferencias de Juego | LudiGame`,
    description: 'Ajustes predeterminados para la creación de juegos en LudiGame'
  };
}

export default async function GamePreferencesPage() {
  const token: DecodedIdToken | null = await getSession();
  
  if (!token) {
    redirect('/auth/login');
  }

  return (
    <div style={{ padding: '10px' }}>
      <GamePreferences />
    </div>
  );
}