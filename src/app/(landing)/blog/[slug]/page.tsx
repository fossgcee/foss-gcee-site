/* eslint-disable @next/next/no-img-element */
import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Calendar, User, Tag } from "lucide-react";
import { getBlogPostBySlug } from "@/services/blog";
import { marked } from "marked";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const post = await getBlogPostBySlug(slug);
    if (!post || post.status !== "published") return { title: "Blog Post Not Found" };
    return {
      title: `${post.title} | FOSS Club GCE Erode`,
      description: post.excerpt || "FOSS GCE Erode Blog Post",
    };
  } catch (e) {
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
        <h1 className="font-pixel text-xl text-text whitespace-nowrap">404_POST_NOT_FOUND</h1>
        <Link href="/blog" className="font-mono text-xs text-muted-2 hover:text-text border-b border-dashed border-muted-2">Return to Blog</Link>
      </div>
    );
  }

  const rawHtml = await marked.parse(post.content || "");

  return (
    <main className="min-h-screen bg-bg text-text pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Back Link */}
        <Link href="/blog" className="inline-flex items-center gap-2 font-mono text-xs text-muted-2 hover:text-text transition-colors">
          <ArrowLeft className="w-4 h-4" /> BACK_TO_BLOGS
        </Link>

        {/* Title details */}
        <div className="space-y-4">
          <div className="flex gap-2">
            <span className="text-[9px] uppercase font-mono bg-text text-bg px-2 py-0.5 rounded border border-text font-bold tracking-widest flex items-center gap-1">
              <Tag className="w-2.5 h-2.5" /> {post.category?.name || "BLOG"}
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-pixel text-text leading-tight uppercase text-balance">{post.title}</h1>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-xs text-muted-2 border-t border-b border-border py-3">
            <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 opacity-50" /> {new Date(post.publishedAt || post.createdAt).toLocaleDateString()}</span>
            <span className="flex items-center gap-1.5"><User className="w-4 h-4 opacity-50" /> By {post.author}</span>
          </div>
        </div>

        {/* Cover Image */}
        {post.coverImage && (
          <div className="w-full aspect-video rounded-2xl overflow-hidden border border-border/50 bg-surface">
            <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover" />
          </div>
        )}

        {/* Article Body Content */}
        <article 
          className="prose prose-invert max-w-none font-mono text-sm leading-relaxed text-text/80 space-y-6 pt-4"
          dangerouslySetInnerHTML={{ __html: rawHtml }}
        />

      </div>
    </main>
  );
}
