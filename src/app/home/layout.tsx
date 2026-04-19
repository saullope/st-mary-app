import "bootstrap/dist/css/bootstrap.min.css";
import {Sidebar} from '../../components';
import { Poppins } from "next/font/google";

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '700'], // puedes agregar más pesos si quieres
  display: 'swap',        // igual que en el <link>
})

export default function LandingLayout({
    children,
  }: Readonly<{
    children: React.ReactNode;
  }>) {
    return (
        <div style={{ backgroundColor: "#e0f0ff", color: "#222", lineHeight: "1.6", minHeight: "100vh" }} className={poppins.className}>
            <header>
                <Sidebar/>
            </header>
            <main>
            {children}
            </main>
        </div>
    );
  }