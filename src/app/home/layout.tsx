import "bootstrap/dist/css/bootstrap.min.css";
import {Sidebar} from '../../components';

  
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
        <body>
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