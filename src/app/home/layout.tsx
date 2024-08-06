import { Inter } from "next/font/google";
import "bootstrap/dist/css/bootstrap.min.css";
import Sidebar from '../../components/Sidebar';

const inter = Inter({ subsets: ["latin"] });
  
  export default function LandingLayout({
    children,
  }: Readonly<{
    children: React.ReactNode;
  }>) {
    return (
      <html>
        <body className={inter.className}>
            <div>
                <Sidebar/>
            </div>
            {children}
        </body>
      </html>
    );
  }