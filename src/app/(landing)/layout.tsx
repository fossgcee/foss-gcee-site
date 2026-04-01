import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { FloatingThemeToggle } from "@/components/FloatingThemeToggle";

export default function LandingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
      <FloatingThemeToggle />
    </>
  );
}
