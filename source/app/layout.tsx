import type { Metadata } from "next";
import { SiteAnalytics } from "./components/SiteAnalytics";
import { SITE_NAME, SITE_ORIGIN } from "@/lib/seo";
import "./globals.css";
import "./launch-ux.css";

export const metadata: Metadata = {
  title: { default: "Texas Water Sources: Texas Water Record Research", template: `%s | ${SITE_NAME}` },
  description: "Independent source navigation and research guidance for official Texas water records, agencies, districts, and TREC Form 61-0 topics.",
  metadataBase: new URL(SITE_ORIGIN),
  icons: { icon: "/texas-water-logo.png", apple: "/texas-water-logo.png" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}<SiteAnalytics /></body></html>;
}
