import Community from "@/components/Community";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Events & Hackathons | FOSS-CIT",
  description: "Browse upcoming workshops, hackathons, and contribution drives hosted by the Free and Open Source Software Club.",
};

export default function EventsPage() {
  return (
    <main>
      <Community />
    </main>
  );
}
