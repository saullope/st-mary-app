import {NextIntlClientProvider} from 'next-intl';
import {getLocale, getMessages} from 'next-intl/server';
import { ReduxProvider } from '@/components/ReduxProvider';
import { SessionInitializer } from '@/components/SessionInitializer';
import "bootstrap/dist/css/bootstrap.min.css";
import "@/styles/globals.css";

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<any>;
}) {
  const locale = await getLocale();
  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();
 
  return (
    <ReduxProvider>
      <html lang={locale} data-scroll-behavior="smooth">
        <head />
        <body>
          <NextIntlClientProvider messages={messages}>
            <SessionInitializer />
            {children}
          </NextIntlClientProvider>
        </body>
      </html>
    </ReduxProvider>
  );
}