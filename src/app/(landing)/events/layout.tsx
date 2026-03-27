import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Events",
  description: "Join upcoming workshops, talks, and hackathons at FOSS Club GCE Erode. Learn, build, and contribute to open source.",
  openGraph: {
    title: "Events | FOSS Club GCE Erode",
    description: "Discover upcoming and past events organized by FOSS GCEE. Workshops, Hackathons, and Meetups.",
  },
};

export default function EventsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
