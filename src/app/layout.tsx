import {NextIntlClientProvider} from 'next-intl';
import {getLocale, getMessages, getTranslations} from 'next-intl/server';
import type { Metadata } from 'next';
import { SITE_NAME, SITE_URL } from '@/lib/seo/metadata';
import { ReduxProvider } from '@/components/ReduxProvider';
import { SessionInitializer } from '@/components/SessionInitializer';
import { Toaster } from 'sonner';
import Script from 'next/script';
import "bootstrap/dist/css/bootstrap.min.css";
import "@/styles/globals.css";

// Base para todas las páginas: cada una define su título y descripción con pageMetadata.
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Metadata.site');
  return {
    metadataBase: SITE_URL,
    title: { default: SITE_NAME, template: `%s | ${SITE_NAME}` },
    description: t('description'),
    keywords: t('keywords').split(',').map((keyword) => keyword.trim()),
    applicationName: SITE_NAME,
    openGraph: { siteName: SITE_NAME, type: 'website', images: ['/images/og-ludigame.jpg'] },
    twitter: { card: 'summary_large_image' },
  };
}

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
          {/* Único <Toaster/> de la app: accesible (role="status"/aria-live)
              desde cualquier componente cliente vía notify() en
              src/components/ui/notify.ts, sin volver a montarlo. */}
          <Toaster richColors position="bottom-right" closeButton expand duration={5000} />
          <Script
            src="https://cdn.userway.org/widget.js" 
            data-account="idtDhWyQBz"
            strategy="afterInteractive"
          />
        </body>
      </html>
    </ReduxProvider>
  );
}