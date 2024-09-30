import { Inter } from "next/font/google";
import "bootstrap/dist/css/bootstrap.min.css";
import styles from '../../../public/css/landing.module.css';
import { NavbarDashboard } from "@/dashboard-components";
import getSession from '@/lib/auth/getSession'; 
import { redirect } from 'next/navigation';
import { DecodedIdToken } from 'firebase-admin/auth';

const inter = Inter({ subsets: ["latin"] });

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

function mapDecodedIdTokenToFirebaseSession(token: DecodedIdToken): FirebaseSession {
    return {
        s: "https://session.firebase.google.com/st-mary-firebase-dev",
        name: token.name || '',
        picture: token.picture,
        aud: token.aud,
        auth_time: token.auth_time,
        user_id: token.user_id,
        sub: token.sub,
        iat: token.iat,
        exp: token.exp,
        email: token.email || '',
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
  
    const user: FirebaseSession = mapDecodedIdTokenToFirebaseSession(token);
  
  return (
    <div className="">
      <div className={inter.className}>
        <NavbarDashboard sessionData={user}/>
      </div>
      <div>
        {children}
      </div>
    </div>
  );
}