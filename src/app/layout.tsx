import type { Metadata } from "next";
import { Press_Start_2P, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import "@/lib/env";

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


import { ThemeProvider } from "@/components/ThemeProvider";

export const metadata: Metadata = {
  metadataBase: new URL("https://fossgcee.vercel.app"),
  title: {
    default: "FOSSGCEE – FOSS Club GCE Erode",
    template: "%s | FOSSGCEE",
  },
  description:
    "Free and Open Source Software Club at Government College of Engineering, Erode. Promoting Linux, open-source culture, and real-world contributions.",
  keywords: ["FOSS", "open source", "Linux", "GCE Erode", "student club", "FOSSGCEE", "developer community", "open source india"],
  authors: [{ name: "FOSS Club GCE Erode" }],
  creator: "FOSS Club GCE Erode",
  publisher: "FOSS Club GCE Erode",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "FOSSGCEE – FOSS Club GCE Erode",
    description: "Promoting Linux, open-source culture, and real-world contributions at Government College of Engineering, Erode.",
    url: "https://fossgcee.in",
    siteName: "FOSSGCEE",
    images: [
      {
        url: "/icon.png",
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
    description: "Promoting Linux, open-source culture, and real-world contributions at Government College of Engineering, Erode.",
    images: ["/icon.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${pressStart2P.variable} ${jetbrainsMono.variable} antialiased font-body noise min-h-screen bg-bg text-text transition-colors duration-300`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
