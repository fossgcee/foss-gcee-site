import BoardMembers from "@/components/BoardMembers";
import MembersGallery from "@/components/MembersGallery";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Board Members | FOSS-CIT",
  description: "Meet the student board members and leaders of the FOSS Club of CIT.",
};

export default function MembersPage() {
  return (
    <main>
      <BoardMembers />
      <MembersGallery />
    </main>
  );
}
