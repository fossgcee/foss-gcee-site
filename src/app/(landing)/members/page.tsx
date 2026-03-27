import BoardMembers from "@/components/BoardMembers";
import MembersGallery from "@/components/MembersGallery";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Board & Members",
  description: "Meet the core team and members of FOSS GCEE. Our student board leads the way in promoting open source at GCE Erode.",
  alternates: {
    canonical: "https://fossgcee.in/members",
  },
};

export default function MembersPage() {
  return (
    <main>
      <BoardMembers />
      <MembersGallery />
    </main>
  );
}
