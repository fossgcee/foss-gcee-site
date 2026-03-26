import RegistrationPortal from "@/components/RegistrationPortal";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Join Us | FOSS-CIT",
  description: "Join the Free and Open Source Software Club of CIT and start contributing today.",
};

export default function JoinPage() {
  return (
    <main>
      <RegistrationPortal />
    </main>
  );
}
