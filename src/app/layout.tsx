import type { Metadata, Viewport } from "next";
import { Press_Start_2P, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import "@/lib/env";
import JsonLd from "@/components/JsonLd";
import { ThemeProvider } from "@/components/ThemeProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const pressStart2P = Press_Start_2P({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-pixel",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://fossgcee.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "FOSSGCEE – FOSS Club GCE Erode",
    template: "%s | FOSSGCEE",
  },
  description:
    "Free and Open Source Software Club at Government College of Engineering, Erode. Promoting Linux, open-source culture, developer workshops, hackathons, and real-world contributions.",
  keywords: [
    "FOSS",
    "FOSSGCEE",
    "FOSS Club GCE Erode",
    "Government College of Engineering Erode",
    "GCE Erode",
    "Open Source Club",
    "Linux Club Erode",
    "Student Developer Community",
    "Tamil Nadu Open Source",
    "FOSS United GCEE",
    "GCEE Club",
    "Engineering College Erode",
    "Free Software India",
    "Git Workshops",
    "Hackathons Tamil Nadu",
    "Open Source Contributions",
  ],
  authors: [{ name: "FOSS Club GCE Erode", url: siteUrl }],
  creator: "FOSS Club GCE Erode",
  publisher: "FOSS Club GCE Erode",
  alternates: {
    canonical: "/",
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "FOSSGCEE – FOSS Club GCE Erode",
    description:
      "Promoting Linux, open-source culture, developer workshops, hackathons, and real-world contributions at Government College of Engineering, Erode.",
    url: siteUrl,
    siteName: "FOSSGCEE",
    images: [
      {
        url: "/foss_gcee_logo.png",
        width: 512,
        height: 512,
        alt: "FOSS Club GCE Erode Logo",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "FOSSGCEE – FOSS Club GCE Erode",
    description:
      "Promoting Linux, open-source culture, developer workshops, and real-world contributions at Government College of Engineering, Erode.",
    images: ["/foss_gcee_logo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  category: "technology",
  ...(process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
    ? {
        verification: {
          google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
        },
      }
    : {}),
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#080808" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

const rootStructuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "EducationalOrganization",
      "@id": `${siteUrl}/#organization`,
      name: "FOSS Club GCE Erode",
      alternateName: ["FOSSGCEE", "FOSS GCE Erode", "Free and Open Source Software Club GCEE"],
      url: siteUrl,
      logo: {
        "@type": "ImageObject",
        url: `${siteUrl}/foss_gcee_logo.png`,
        width: 512,
        height: 512,
      },
      image: `${siteUrl}/foss_gcee_logo.png`,
      email: "fossgcee@gmail.com",
      description:
        "Free and Open Source Software Club at Government College of Engineering, Erode. Fostering a culture of Linux, open-source contribution, and real-world collaboration.",
      sameAs: [
        "https://github.com/fossgcee",
        "https://www.instagram.com/fossgcee/",
        "https://www.youtube.com/channel/UCTtzkb23e6iQAMMkgigHQqQ",
        "https://discord.com/invite/d6SUMn4JF",
        "https://forum.fossunited.org/t/foss-club-government-college-of-engineering-erode/",
      ],
      parentOrganization: {
        "@type": "CollegeOrUniversity",
        name: "Government College of Engineering, Erode",
        alternateName: "GCE Erode",
        address: {
          "@type": "PostalAddress",
          streetAddress: "Perundurai",
          addressLocality: "Erode",
          addressRegion: "Tamil Nadu",
          postalCode: "638053",
          addressCountry: "IN",
        },
      },
    },
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      url: siteUrl,
      name: "FOSSGCEE",
      alternateName: "FOSS Club GCE Erode Portal",
      description:
        "Official website of Free and Open Source Software Club at Government College of Engineering, Erode.",
      publisher: {
        "@id": `${siteUrl}/#organization`,
      },
      inLanguage: "en-IN",
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <JsonLd data={rootStructuredData} />
      </head>
      <body
        className={`${inter.variable} ${pressStart2P.variable} ${jetbrainsMono.variable} antialiased font-body noise min-h-screen bg-bg text-text transition-colors duration-300`}
        suppressHydrationWarning
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
