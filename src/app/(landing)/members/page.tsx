import BoardMembers from "@/components/BoardMembers";
import MembersGallery from "@/components/MembersGallery";
import { Metadata } from "next";
import JsonLd from "@/components/JsonLd";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://fossgcee.vercel.app";

export const metadata: Metadata = {
  title: "Board & Members",
  description:
    "Meet the student board leads, core developers, and active contributors driving the open source community at Government College of Engineering, Erode.",
  keywords: [
    "FOSS board members",
    "GCE Erode club leads",
    "FOSSGCEE core team",
    "open source student contributors",
    "GCE Erode developers",
  ],
  alternates: {
    canonical: "/members",
  },
  openGraph: {
    title: "Board & Members | FOSS Club GCE Erode",
    description:
      "Meet the student leaders and contributors building open source at GCE Erode.",
    url: `${siteUrl}/members`,
    type: "website",
    images: [
      {
        url: "/foss_gcee_logo.png",
        width: 512,
        height: 512,
        alt: "FOSSGCEE Members",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Board & Members | FOSS Club GCE Erode",
    description:
      "Meet the student leaders and contributors building open source at GCE Erode.",
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
      name: "Members",
      item: `${siteUrl}/members`,
    },
  ],
};

export default function MembersPage() {
  return (
    <>
      <JsonLd data={breadcrumbSchema} />
      <main>
        <BoardMembers />
        <MembersGallery />
      </main>
    </>
  );
}
