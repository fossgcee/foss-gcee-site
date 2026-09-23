/* eslint-disable @next/next/no-img-element */
import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Calendar, User, Tag } from "lucide-react";
import { getBlogPostBySlug } from "@/services/blog";
import { marked } from "marked";
import JsonLd from "@/components/JsonLd";

interface Props {
  params: Promise<{ slug: string }>;
}

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://fossgcee.vercel.app";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const post = await getBlogPostBySlug(slug);
    if (!post || post.status !== "published") {
      return {
        title: "Blog Post Not Found",
        robots: { index: false, follow: false },
      };
    }

    const title = `${post.title} | FOSSGCEE Blog`;
    const description =
      post.excerpt ||
      `${post.title} — written by ${post.author} for FOSS Club GCE Erode.`;
    const canonicalUrl = `/blog/${post.slug}`;
    const coverUrl = post.coverImage || `${siteUrl}/foss_gcee_logo.png`;

    return {
      title,
      description,
      alternates: {
        canonical: canonicalUrl,
      },
      openGraph: {
        title: `${post.title} | FOSS Club GCE Erode`,
        description,
        url: `${siteUrl}/blog/${post.slug}`,
        type: "article",
        publishedTime: post.publishedAt || post.createdAt,
        modifiedTime: post.updatedAt || post.publishedAt || post.createdAt,
        authors: [post.author],
        tags: post.category?.name ? [post.category.name] : undefined,
        images: [
          {
            url: coverUrl,
            alt: post.title,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: post.title,
        description,
        images: [coverUrl],
      },
    };
  } catch {
    return { title: "Blog Post Not Found" };
  }
}

export default async function BlogDetailPage({ params }: Props) {
  const { slug } = await params;
  let post = null;
  try {
    post = await getBlogPostBySlug(slug);
  } catch (e) {
    console.error(e);
  }

  if (!post || post.status !== "published") {
    return (
      <div className="min-h-screen bg-bg flex flex-col items-center justify-center space-y-4">
        <h1 className="font-pixel text-xl text-text whitespace-nowrap">
          404_POST_NOT_FOUND
        </h1>
        <Link
          href="/blog"
          className="font-mono text-xs text-muted-2 hover:text-text border-b border-dashed border-muted-2"
        >
          Return to Blog
        </Link>
      </div>
    );
  }

  const rawHtml = await marked.parse(post.content || "");
  const pageUrl = `${siteUrl}/blog/${post.slug}`;
  const publishedDate = post.publishedAt || post.createdAt;
  const modifiedDate = post.updatedAt || publishedDate;

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${pageUrl}#article`,
    headline: post.title,
    description: post.excerpt || post.title,
    image: post.coverImage ? [post.coverImage] : [`${siteUrl}/foss_gcee_logo.png`],
    datePublished: publishedDate,
    dateModified: modifiedDate,
    author: {
      "@type": "Person",
      name: post.author,
    },
    publisher: {
      "@type": "Organization",
      name: "FOSS Club GCE Erode",
      url: siteUrl,
      logo: {
        "@type": "ImageObject",
        url: `${siteUrl}/foss_gcee_logo.png`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": pageUrl,
    },
    articleSection: post.category?.name || "Technology",
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
        name: "Blog",
        item: `${siteUrl}/blog`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: post.title,
        item: pageUrl,
      },
    ],
  };

  return (
    <>
      <JsonLd data={[articleSchema, breadcrumbSchema]} />
      <main className="min-h-screen bg-bg text-text pt-24 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto space-y-8">
          {/* Back Link */}
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 font-mono text-xs text-muted-2 hover:text-text transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> BACK_TO_BLOGS
          </Link>

          {/* Title details */}
          <div className="space-y-4">
            <div className="flex gap-2">
              <span className="text-[9px] uppercase font-mono bg-text text-bg px-2 py-0.5 rounded border border-text font-bold tracking-widest flex items-center gap-1">
                <Tag className="w-2.5 h-2.5" /> {post.category?.name || "BLOG"}
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-pixel text-text leading-tight uppercase text-balance">
              {post.title}
            </h1>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-xs text-muted-2 border-t border-b border-border py-3">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 opacity-50" />{" "}
                {new Date(publishedDate).toLocaleDateString("en-IN", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </span>
              <span className="flex items-center gap-1.5">
                <User className="w-4 h-4 opacity-50" /> By {post.author}
              </span>
            </div>
          </div>

          {/* Cover Image */}
          {post.coverImage && (
            <div className="w-full aspect-video rounded-2xl overflow-hidden border border-border/50 bg-surface">
              <img
                src={post.coverImage}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Article Body Content */}
          <article
            className="prose prose-invert max-w-none font-mono text-sm leading-relaxed text-text/80 space-y-6 pt-4"
            dangerouslySetInnerHTML={{ __html: rawHtml }}
          />
        </div>
      </main>
    </>
  );
}
