import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const paths = [
    { path: "/", changeFrequency: "weekly" as const, priority: 1 },
    { path: "/register", changeFrequency: "monthly" as const, priority: 0.8 },
    { path: "/login", changeFrequency: "monthly" as const, priority: 0.5 },
  ];

  return paths.flatMap(({ path, changeFrequency, priority }) => [
    {
      url: `${SITE_URL}${path}`,
      lastModified: now,
      changeFrequency,
      priority,
    },
    {
      url: `${SITE_URL}/en${path === "/" ? "" : path}`,
      lastModified: now,
      changeFrequency,
      priority,
    },
  ]);
}
