import type { MetadataRoute } from "next";
import { PUBLIC_PATHS, SITE_URL } from "@/lib/seo/metadata";

export default function sitemap(): MetadataRoute.Sitemap {
  return PUBLIC_PATHS.map((path) => ({
    url: new URL(path, SITE_URL).toString(),
    changeFrequency: "monthly",
    priority: path === "/home" ? 1 : 0.6,
  }));
}
