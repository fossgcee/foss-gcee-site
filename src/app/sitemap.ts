import type { MetadataRoute } from 'next';
import { getEvents } from '@/services/event';
import { getBlogPosts } from '@/services/blog';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://fossgcee.vercel.app';
  const now = new Date();

  // Core static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/events`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/projects`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/join`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/members`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/feedback`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  // Dynamic event pages
  let eventPages: MetadataRoute.Sitemap = [];
  try {
    const events = await getEvents();
    eventPages = (events || [])
      .filter((e) => e.status !== 'draft' && e.slug)
      .map((e) => ({
        url: `${baseUrl}/events/${e.slug}`,
        lastModified: e.updatedAt ? new Date(e.updatedAt) : e.createdAt ? new Date(e.createdAt) : now,
        changeFrequency: (e.status === 'completed' ? 'monthly' : 'daily') as MetadataRoute.Sitemap[number]['changeFrequency'],
        priority: 0.8,
      }));
  } catch (err) {
    console.warn('Failed to fetch events for sitemap generation:', err);
  }

  // Dynamic blog post pages
  let blogPages: MetadataRoute.Sitemap = [];
  try {
    const posts = await getBlogPosts({ status: 'published' });
    blogPages = (posts || [])
      .filter((p) => p.slug)
      .map((p) => ({
        url: `${baseUrl}/blog/${p.slug}`,
        lastModified: p.updatedAt ? new Date(p.updatedAt) : p.publishedAt ? new Date(p.publishedAt) : now,
        changeFrequency: 'weekly' as MetadataRoute.Sitemap[number]['changeFrequency'],
        priority: 0.8,
      }));
  } catch (err) {
    console.warn('Failed to fetch blog posts for sitemap generation:', err);
  }

  return [...staticPages, ...eventPages, ...blogPages];
}
