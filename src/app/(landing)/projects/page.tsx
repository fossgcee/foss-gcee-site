import AllProjects from "@/components/AllProjects";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Open Source Projects",
  description: "Explore all the open source projects, tools, and libraries built by the members of FOSS GCEE.",
  alternates: {
    canonical: "https://fossgcee.in/projects",
  },
};

export default function ProjectsPage() {
  return (
    <main>
      <AllProjects />
    </main>
  );
}
