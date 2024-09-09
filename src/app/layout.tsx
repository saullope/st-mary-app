import {NextIntlClientProvider} from 'next-intl';
import {getMessages} from 'next-intl/server';
//import {AuthProvider} from '@/components';
import SessionProvider from '../contexts/SessionContext';
import getSession from '@/lib/auth/getSession';

export default async function LocaleLayout({
  children,
  params: {locale}
}: {
  children: React.ReactNode;
  params: {locale: string};
}) {
  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();
 
  return (
    <SessionProvider >
    <html lang={locale}>
      <body>
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
    </SessionProvider>
  );
}