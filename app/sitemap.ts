import type { MetadataRoute } from "next";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

const BASE_URL = "https://www.axiol.store";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/terms`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/privacy`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/data-deletion`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.1,
    },
  ];

  try {
    const usernames = await convex.query(api.sitemap.getUsernames);
    const storeRoutes: MetadataRoute.Sitemap = usernames.map((u) => ({
      url: `${BASE_URL}/${u.username}`,
      lastModified: new Date(u.updatedAt),
      changeFrequency: "weekly" as const,
      priority: 0.9,
    }));

    const productUrls = await convex.query(api.sitemap.getProductUrls);
    const productRoutes: MetadataRoute.Sitemap = productUrls.map((p) => ({
      url: `${BASE_URL}/${p.username}/p/${p.productUrl}`,
      lastModified: new Date(p.updatedAt),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

    return [...staticRoutes, ...storeRoutes, ...productRoutes];
  } catch {
    return staticRoutes;
  }
}
