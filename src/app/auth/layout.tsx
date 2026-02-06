import { Inter } from "next/font/google";
import "bootstrap/dist/css/bootstrap.min.css";
import { NavbarAuth } from '@/components/auth';
import styles from '@/styles/pages/landing.module.css';

const inter = Inter({ subsets: ["latin"] });

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className={`${styles['body-iniciosesion']} ${styles['root-login']} ${styles['body-login']}`}>
      <div className={inter.className}>
        <NavbarAuth />
      </div>
      <div>
        {children}
      </div>
    </div>
  );
}