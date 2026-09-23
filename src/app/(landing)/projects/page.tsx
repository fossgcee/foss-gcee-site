import AllProjects from "@/components/AllProjects";
import { Metadata } from "next";
import JsonLd from "@/components/JsonLd";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://fossgcee.vercel.app";

export const metadata: Metadata = {
  title: "Open Source Projects & Contributions",
  description:
    "Explore open source tools, web applications, libraries, and contributions created by student developers at FOSS Club GCE Erode.",
  keywords: [
    "FOSS projects",
    "GCE Erode github",
    "student open source projects",
    "open source repositories Erode",
    "FOSSGCEE contributions",
    "Tamil Nadu developer projects",
  ],
  alternates: {
    canonical: "/projects",
  },
  openGraph: {
    title: "Open Source Projects | FOSS Club GCE Erode",
    description:
      "Explore open source tools, web applications, and repositories built by FOSSGCEE members.",
    url: `${siteUrl}/projects`,
    type: "website",
    images: [
      {
        url: "/foss_gcee_logo.png",
        width: 512,
        height: 512,
        alt: "FOSSGCEE Projects",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Open Source Projects | FOSS Club GCE Erode",
    description:
      "Explore open source tools, web applications, and repositories built by FOSSGCEE members.",
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
      name: "Projects",
      item: `${siteUrl}/projects`,
    },
  ],
};

export default function ProjectsPage() {
  return (
    <>
      <JsonLd data={breadcrumbSchema} />
      <main>
        <AllProjects />
      </main>
    </>
  );
}
