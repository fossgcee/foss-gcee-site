import type { Metadata } from "next";
import { Press_Start_2P, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

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


export const metadata: Metadata = {
  title: "FOSSGCEE – FOSS Club GCE Erode",
  description:
    "Free and Open Source Software Club at Government College of Engineering, Erode. Promoting Linux, open-source culture, and real-world contributions.",
  keywords: ["FOSS", "open source", "Linux", "GCE Erode", "student club", "FOSSGCEE"],
  openGraph: {
    title: "FOSSGCEE – FOSS Club GCE Erode",
    description:
      "Promoting Linux, open-source culture, and real-world contributions at Government College of Engineering, Erode.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${pressStart2P.variable} ${jetbrainsMono.variable} antialiased font-body noise`} style={{ background: "#080808", color: "#f0f0f0", minHeight: "100vh" }}>
        {children}
      </body>
    </html>
  );
}
