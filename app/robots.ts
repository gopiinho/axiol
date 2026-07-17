import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/dashboard/",
          "/login/",
          "/signup/",
          "/verify-email/",
          "/onboarding/",
          "/api/",
          "/preview-email/",
        ],
      },
    ],
    sitemap: "https://www.axiol.store/sitemap.xml",
  };
}
