import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/dashboard",
          "/themes",
          "/auth/callback",
          "/en/dashboard",
          "/en/themes",
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
