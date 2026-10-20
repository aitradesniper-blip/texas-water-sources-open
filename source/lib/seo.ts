import type { Metadata } from "next";

export const SITE_NAME = "Texas Water Sources";
export const SITE_ORIGIN = "https://texaswatersources.com";

export function absoluteUrl(path = "/") {
  if (path === "" || path === "/") return SITE_ORIGIN;
  return new URL(path, SITE_ORIGIN).toString();
}

export function createPageMetadata({
  title,
  description,
  path,
  imagePath = "/og.png",
  absoluteTitle = false,
}: {
  title: string;
  description: string;
  path: string;
  imagePath?: string | null;
  absoluteTitle?: boolean;
}): Metadata {
  const url = absoluteUrl(path);
  const image = imagePath ? absoluteUrl(imagePath) : null;

  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      type: "website",
      ...(image ? { images: [{ url: image, alt: `${title} social preview` }] } : {}),
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title,
      description,
      ...(image ? { images: [image] } : {}),
    },
  };
}

export function createBreadcrumbList(items: Array<{ name: string; path: string }>) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}
