import type { Metadata } from "next";
import { getLocale } from "next-intl/server";

export const SITE_NAME = "LudiGame";

/** URL pública del sitio, para canónicas y Open Graph. Configúrala por entorno. */
export const SITE_URL = new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000");

const OG_IMAGE = { url: "/images/og-ludigame.jpg", width: 1200, height: 630, alt: SITE_NAME };

// No hay segmento [locale] en las URL: el idioma sale de la cookie, así que una
// página tiene una sola URL y Open Graph declara el idioma con que se generó.
const OG_LOCALES: Record<string, string> = { es: "es_ES", en: "en_US" };

interface PageMetadataOptions {
  /** Sin " | LudiGame": la plantilla del layout raíz lo agrega. */
  title: string;
  description: string;
  /** Ruta canónica; solo para páginas públicas. */
  path?: string;
  /** Las páginas privadas (panel, editor, juego) no deben aparecer en buscadores. */
  index?: boolean;
}

/** Metadatos completos de una página: título, descripción, robots, Open Graph y Twitter. */
export async function pageMetadata({ title, description, path, index = false }: PageMetadataOptions): Promise<Metadata> {
  const locale = await getLocale();
  const fullTitle = `${title} | ${SITE_NAME}`;
  return {
    title,
    description,
    alternates: path ? { canonical: path } : undefined,
    robots: index ? { index: true, follow: true } : { index: false, follow: false },
    openGraph: {
      title: fullTitle,
      description,
      url: path,
      siteName: SITE_NAME,
      locale: OG_LOCALES[locale] ?? OG_LOCALES.es,
      type: "website",
      images: [OG_IMAGE],
    },
    twitter: { card: "summary_large_image", title: fullTitle, description, images: [OG_IMAGE.url] },
  };
}

/** Rutas públicas que vale la pena indexar (sitemap.ts las publica). */
export const PUBLIC_PATHS = ["/home", "/play", "/auth/login", "/auth/signup"] as const;
