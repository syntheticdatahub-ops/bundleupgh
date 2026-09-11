import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { GlobePreloader } from "@/components/globe-preloader";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.bundleupgh.shop"),
  title: "BundleUp — Buy Mobile Data in Ghana",
  description: "Buy MTN, Telecel, and AirtelTigo data bundles instantly. Fast delivery, secure payments, and 24/7 support. Ghana's premium data reselling platform.",
  authors: [{ name: "Play.ato" }],
  creator: "Play.ato",
  publisher: "Play.ato",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
  openGraph: {
    title: "BundleUp — Buy Mobile Data in Ghana",
    description: "Buy MTN, Telecel, and AirtelTigo data bundles instantly. Fast delivery, secure payments.",
    type: "website",
    url: "https://www.bundleupgh.shop",
    siteName: "BundleUp",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "BundleUp — Buy Mobile Data in Ghana",
    description: "Buy MTN, Telecel, and AirtelTigo data bundles instantly.",
    images: ["/og-image.png"],
  },
  other: {
    "humans-txt": "https://www.bundleupgh.shop/humans.txt",
    "ai-txt": "https://www.bundleupgh.shop/ai.txt",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": "https://www.bundleupgh.shop/#website",
        "url": "https://www.bundleupgh.shop",
        "name": "BundleUp",
        "description": "Ghana's fast and reliable mobile data bundle reselling platform.",
        "inLanguage": "en",
        "potentialAction": {
          "@type": "SearchAction",
          "target": "https://www.bundleupgh.shop/track?phone={search_term_string}",
          "query-input": "required name=search_term_string"
        }
      },
      {
        "@type": "Organization",
        "@id": "https://www.bundleupgh.shop/#organization",
        "name": "BundleUp",
        "url": "https://www.bundleupgh.shop",
        "founder": {
          "@type": "Person",
          "name": "Play.ato"
        },
        "foundingLocation": {
          "@type": "Place",
          "name": "Accra, Ghana"
        },
        "description": "BundleUp is owned and operated by Play.ato — a Ghanaian entrepreneur building fast, affordable data bundle services for everyone in Ghana.",
        "areaServed": {
          "@type": "Country",
          "name": "Ghana"
        },
        "knowsAbout": ["Mobile Data Bundles", "Ghana Telecom", "MTN Ghana", "Telecel Ghana", "AirtelTigo"],
        "address": {
          "@type": "PostalAddress",
          "addressLocality": "Accra",
          "addressCountry": "GH"
        }
      }
    ]
  };

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased font-sans dark`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <link rel="author" href="/humans.txt" />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <TooltipProvider>
          <GlobePreloader />
          {children}
        </TooltipProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
