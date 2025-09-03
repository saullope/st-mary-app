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
      <html>
        <head>
            <meta charSet="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com" />
        </head>
        <body style={{ backgroundColor: "#e0f0ff", color: "#222", lineHeight: "1.6" }} className={poppins.className}>
            <header>
                <Sidebar/>
            </header>
            <main>
            {children}
            </main>
        </body>
      </html>
    );
  }