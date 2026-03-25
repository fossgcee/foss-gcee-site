export interface Member {
  id: string;
  name: string;
  role: string;
  year: string;
  imageUrl: string;
  linkedInUrl?: string;
}

export const membersData: Member[] = Array.from({ length: 10 }).map((_, i) => ({
  id: `placeholder-${i + 1}`,
  name: `Member Name ${i + 1}`,
  role: "Board Member",
  year: "2025 - 26",
  imageUrl: "", // Empty so it shows the placeholder SVG
  linkedInUrl: "https://linkedin.com/",
}));

export const getUniqueYears = (): string[] => {
  const years = Array.from(new Set(membersData.map(m => m.year)));
  // Sort descending so the newest year is first
  return years.sort((a, b) => b.localeCompare(a));
};
