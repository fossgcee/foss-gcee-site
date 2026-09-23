import { Metadata } from "next";
import JsonLd from "@/components/JsonLd";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://fossgcee.vercel.app";

export const metadata: Metadata = {
  title: "Event Feedback",
  description:
    "Share your thoughts and review recent events and workshops organized by FOSS Club at Government College of Engineering, Erode.",
  alternates: {
    canonical: "/feedback",
  },
  openGraph: {
    title: "Event Feedback | FOSS Club GCE Erode",
    description: "Submit feedback for FOSSGCEE events and workshops.",
    url: `${siteUrl}/feedback`,
    type: "website",
    images: [
      {
        url: "/foss_gcee_logo.png",
        width: 512,
        height: 512,
        alt: "FOSSGCEE Feedback",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Event Feedback | FOSS Club GCE Erode",
    description: "Submit feedback for FOSSGCEE events and workshops.",
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
      name: "Feedback",
      item: `${siteUrl}/feedback`,
    },
  ],
};

export default function FeedbackLayout({
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
