import { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://fossgcee.vercel.app';

export const metadata: Metadata = {
  title: 'Events & Workshops',
  description:
    'Join upcoming workshops, installation fests, hackathons, and guest talks organized by FOSS Club at Government College of Engineering, Erode.',
  keywords: [
    'FOSS events',
    'Linux installation fest',
    'Git workshop GCE Erode',
    'GCE Erode hackathons',
    'open source meetups Erode',
    'FOSSGCEE events',
    'student tech workshops Tamil Nadu',
  ],
  alternates: {
    canonical: '/events',
  },
  openGraph: {
    title: 'Events & Workshops | FOSS Club GCE Erode',
    description:
      'Discover upcoming and past events organized by FOSS GCEE. Workshops, Hackathons, and Meetups.',
    url: `${siteUrl}/events`,
    type: 'website',
    images: [
      {
        url: '/foss_gcee_logo.png',
        width: 512,
        height: 512,
        alt: 'FOSSGCEE Events',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Events & Workshops | FOSS Club GCE Erode',
    description:
      'Discover upcoming and past events organized by FOSS GCEE. Workshops, Hackathons, and Meetups.',
    images: ['/foss_gcee_logo.png'],
  },
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: "Home",
      item: siteUrl,
    },
    {
      "@type": "ListItem",
      position: 2,
      name: "Events",
      item: `${siteUrl}/events`,
    },
  ],
};

export default function EventsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd data={breadcrumbSchema} />
      {children}
    </>
  );
}
