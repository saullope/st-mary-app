import { Inter } from "next/font/google";
import "bootstrap/dist/css/bootstrap.min.css";
import {NavbarAuth} from '../../auth-components';

const inter = Inter({ subsets: ["latin"] });
  
  export default function AuthLayout({
    children,
  }: Readonly<{
    children: React.ReactNode;
  }>) {
    return (
      <>
      <div className={inter.className}>
        <NavbarAuth />
      </div>
      <div className="d-flex justify-content-center">
        {children}
      </div>
    </>
    );
  }