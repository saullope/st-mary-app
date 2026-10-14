import { DashboardFrame, NavbarDashboard } from "@/components/dashboard";
import { SIDEBAR_COLLAPSED_COOKIE } from "@/components/dashboard/sidebarPreference";
import { cookies } from "next/headers";
import getSession from '@/lib/auth/getSession';
import getCurrentUser from "@/lib/auth/getCurrentUser";
import { isAdmin } from "@/lib/auth/guards";
import { redirect } from 'next/navigation';
import { DecodedIdToken } from 'firebase-admin/auth';
import styles from '@/styles/pages/sidebar.module.css';
import designStyles from '@/styles/pages/LudiDesign.module.css';

interface FirebaseSession {
  s: string;
  name: string;
  picture?: string; // La URL de la foto de perfil es opcional
  aud: string;
  auth_time: number;
  user_id: string;
  sub: string;
  iat: number;
  exp: number;
  email: string;
  email_verified: boolean;
  firebase: {
    identities: {
      email: string[];
      "google.com"?: string[]; // Opcional para usuarios de Google
    };
    sign_in_provider: string;
  };
  uid: string;
}

function mapDecodedIdTokenToFirebaseSession(token: DecodedIdToken, dbUser?: any): FirebaseSession {
  // Use Firebase token data as fallback, prioritize DB user if exists
  return {
    s: "https://session.firebase.google.com/st-mary-firebase-dev",
    name: dbUser?.nombre || token.name || '',
    picture: token.picture, // Google profile pic URL
    aud: token.aud,
    auth_time: token.auth_time,
    user_id: token.user_id,
    sub: token.sub,
    iat: token.iat,
    exp: token.exp,
    email: dbUser?.email || token.email || '',
    email_verified: token.email_verified || false,
    firebase: {
      identities: {
        email: token.firebase.identities.email || [],
        "google.com": token.firebase.identities["google.com"]
      },
      sign_in_provider: token.firebase.sign_in_provider
    },
    uid: token.uid
  };
}

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const token: DecodedIdToken | null = await getSession();

  // Si no hay un usuario autenticado, redirigir a la página de login
  if (!token) {
    redirect('/auth/login');
  }

  // Get user from our SQL database (via Prisma) to fetch real name
  const dbUser = await getCurrentUser();

  // Toda la sección /admin es solo para administradores, no solo cada página.
  if (!dbUser || !isAdmin(dbUser)) {
    redirect('/dashboard');
  }

  const user: FirebaseSession = mapDecodedIdTokenToFirebaseSession(token, dbUser);

  // Generamos partículas para el fondo
  const particles = Array.from({ length: 8 }).map((_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    duration: `${16 + Math.random() * 6}s`,
    delay: `${Math.random() * 5}s`
  }));

  const sidebarCollapsed = (await cookies()).get(SIDEBAR_COLLAPSED_COOKIE)?.value === "1";

  return (
    <div className={styles['bodySidebar']} style={{ minHeight: '100vh', position: 'relative', overflowX: 'hidden' }}>
        {/* Animated Background from new Design System */}
        <div className={designStyles.bgAnimation}>
          {particles.map((p) => (
            <span 
              key={p.id} 
              className={designStyles.particle} 
              style={{ 
                left: p.left, 
                animationDuration: p.duration, 
                animationDelay: p.delay 
              }} 
            />
          ))}
        </div>

        <DashboardFrame defaultCollapsed={sidebarCollapsed} navbar={<NavbarDashboard sessionData={user} />}>
          {children}
        </DashboardFrame>
    </div>
  );
}