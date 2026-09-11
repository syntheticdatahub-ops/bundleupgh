import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        // Allow all well-behaved crawlers to index public pages
        userAgent: "*",
        allow: ["/", "/buy", "/track", "/help", "/about", "/terms", "/privacy", "/refund-policy"],
        disallow: ["/admin", "/api/", "/buy/callback", "/sign-in", "/sign-up"],
      },
    ],
    sitemap: "https://www.bundleupgh.shop/sitemap.xml",
    host: "https://www.bundleupgh.shop",
  };
}
