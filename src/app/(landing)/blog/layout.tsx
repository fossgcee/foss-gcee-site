import { Metadata } from "next";
import JsonLd from "@/components/JsonLd";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://fossgcee.vercel.app";

export const metadata: Metadata = {
  title: "Blog & Tutorials",
  description:
    "Read technical articles, Linux tutorials, event recaps, and open-source stories from the FOSS Club at Government College of Engineering, Erode.",
  keywords: [
    "FOSS blog",
    "Linux tutorials",
    "open source articles",
    "GCE Erode tech blog",
    "FOSSGCEE blogs",
    "developer guides",
    "git tutorials",
    "student open source blog",
  ],
  alternates: {
    canonical: "/blog",
  },
  openGraph: {
    title: "Blog & Tutorials | FOSS Club GCE Erode",
    description:
      "Explore tutorials, technical articles, and open source stories from FOSSGCEE.",
    url: `${siteUrl}/blog`,
    type: "website",
    images: [
      {
        url: "/foss_gcee_logo.png",
        width: 512,
        height: 512,
        alt: "FOSSGCEE Blog",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog & Tutorials | FOSS Club GCE Erode",
    description:
      "Explore tutorials, technical articles, and open source stories from FOSSGCEE.",
    images: ["/foss_gcee_logo.png"],
  },
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: "Home",
      item: siteUrl,
    },
    {
      "@type": "ListItem",
      position: 2,
      name: "Blog",
      item: `${siteUrl}/blog`,
    },
  ],
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <JsonLd data={breadcrumbSchema} />
      {children}
    </>
  );
}
