export interface MembersGalleryImage {
  id: string;
  src: string;
  alt?: string;
}

// ─────────────────────────────────────────────────────────────────────
//  MEMBERS GALLERY — HOW TO ADD PHOTOS
//  1. Drop images into: public/members-gallery/
//  2. Add an entry below with the public path, e.g. "/members-gallery/pic-1.jpg"
// ─────────────────────────────────────────────────────────────────────

export const membersGallery: MembersGalleryImage[] = [
  // { id: "gcee-open-source-meetup-2026-01", src: "/members-gallery/meetup-1.jpg", alt: "Open source meetup 2026" },
];
