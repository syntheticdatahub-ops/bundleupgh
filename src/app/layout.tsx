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
  metadataBase: new URL("https://bundleup.com.gh"),
  title: "BundleUp — Buy Mobile Data in Ghana",
  description: "Buy MTN, Telecel, and AirtelTigo data bundles instantly. Fast delivery, secure payments, and 24/7 support. Ghana's premium data reselling platform.",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
  openGraph: {
    title: "BundleUp — Buy Mobile Data in Ghana",
    description: "Buy MTN, Telecel, and AirtelTigo data bundles instantly. Fast delivery, secure payments.",
    type: "website",
    url: "https://bundleup.com.gh",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "BundleUp — Buy Mobile Data in Ghana",
    description: "Buy MTN, Telecel, and AirtelTigo data bundles instantly.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased font-sans dark`}
    >
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
