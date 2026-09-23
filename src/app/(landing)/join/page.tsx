import RegistrationPortal from "@/components/RegistrationPortal";
import { Metadata } from "next";
import JsonLd from "@/components/JsonLd";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://fossgcee.vercel.app";

export const metadata: Metadata = {
  title: "Join FOSS Club GCE Erode | Registration Portal",
  description:
    "Register as a member of FOSS Club at Government College of Engineering, Erode. Learn Linux, master Git, build projects, and collaborate with passionate student developers.",
  keywords: [
    "join FOSS club",
    "GCE Erode club registration",
    "FOSS membership Erode",
    "student developer registration",
    "FOSSGCEE join",
  ],
  alternates: {
    canonical: "/join",
  },
  openGraph: {
    title: "Join FOSS Club GCE Erode | Registration Portal",
    description:
      "Register to join FOSS Club at Government College of Engineering, Erode.",
    url: `${siteUrl}/join`,
    type: "website",
    images: [
      {
        url: "/foss_gcee_logo.png",
        width: 512,
        height: 512,
        alt: "Join FOSSGCEE",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Join FOSS Club GCE Erode | Registration Portal",
    description:
      "Register to join FOSS Club at Government College of Engineering, Erode.",
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
      name: "Join Us",
      item: `${siteUrl}/join`,
    },
  ],
};

export default function JoinPage() {
  return (
    <>
      <JsonLd data={breadcrumbSchema} />
      <main>
        <RegistrationPortal />
      </main>
    </>
  );
}
