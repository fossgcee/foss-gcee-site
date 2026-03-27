import RegistrationPortal from "@/components/RegistrationPortal";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Join the Club",
  description: "Become a member of FOSS GCEE. Start your open source journey today, build projects, and collaborate with like-minded students.",
  alternates: {
    canonical: "https://fossgcee.in/join",
  },
};

export default function JoinPage() {
  return (
    <main>
      <RegistrationPortal />
    </main>
  );
}
