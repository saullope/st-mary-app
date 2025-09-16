import {NextIntlClientProvider} from 'next-intl';
import {getMessages} from 'next-intl/server';
import { ReduxProvider } from '@/components/ReduxProvider';
import { SessionInitializer } from '@/components/SessionInitializer';
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
    <ReduxProvider>
      <html lang={locale}>
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