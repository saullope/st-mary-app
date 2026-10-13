import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo/metadata";

// Las zonas privadas también llevan noindex; aquí se evita que se rastreen.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/dashboard", "/create", "/settings", "/admin", "/welcome-educator", "/play/student", "/view", "/views"],
    },
    sitemap: new URL("/sitemap.xml", SITE_URL).toString(),
  };
}
