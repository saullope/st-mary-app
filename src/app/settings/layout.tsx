import { NavbarDashboard } from "@/components/dashboard";
import { SidebarSettings } from "@/components/settings/SidebarSettings";
import getSession from '@/lib/auth/getSession';
import getCurrentUser from '@/lib/auth/getCurrentUser';
import { redirect } from 'next/navigation';
import { DecodedIdToken } from 'firebase-admin/auth';
import styles from '@/styles/pages/sidebar.module.css';

interface FirebaseSession {
  s: string;
  name: string;
  picture?: string;
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
      "google.com"?: string[];
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

export default async function SettingsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const token: DecodedIdToken | null = await getSession();
  const dbUser = await getCurrentUser();

  if (!token || !dbUser) {
    redirect('/auth/login');
  }

  const user: FirebaseSession = mapDecodedIdTokenToFirebaseSession(token);

  return (
    <div className={styles['bodySidebar']}>
        <SidebarSettings rolId={dbUser.rolId} />
        <div style={{ marginLeft: '250px' }}> {/* Settings sidebar will be wider */}
          <NavbarDashboard sessionData={user} />
          <div style={{ padding: '80px 20px 20px' }}>
            {children}
          </div>
        </div>
    </div>
  );
}