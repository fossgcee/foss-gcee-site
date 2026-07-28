/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState, useRef, startTransition } from "react";
import Link from "next/link";
import { Image as ImageIcon, Loader2, Calendar, User } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

interface BlogCategory {
  _id: string;
  name: string;
  slug: string;
}

interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
  coverImage?: string;
  category: BlogCategory;
  author: string;
  publishedAt: string;
  createdAt: string;
}

export default function BlogsPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pRes, cRes] = await Promise.all([
          fetch("/api/blogs"),
          fetch("/api/blogs/categories")
        ]);
        const pData = await pRes.json();
        const cData = await cRes.json();
        if (pData.success) setPosts(pData.data);
        if (cData.success) setCategories(cData.data);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredPosts = posts.filter(post => 
    selectedCategory === "all" || post.category?.slug === selectedCategory
  );

  useEffect(() => {
    if (loading || posts.length === 0) return;
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      gsap.from(".blog-hero", { opacity: 0, y: 30, duration: 0.8, ease: "power2.out" });
      gsap.from(".blog-card", {
        opacity: 0, y: 20, stagger: 0.1, duration: 0.6, ease: "power2.out",
        scrollTrigger: { trigger: ".blogs-grid", start: "top 80%" }
      });
    }, containerRef);
    return () => ctx.revert();
  }, [loading, posts, selectedCategory]);

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 text-text animate-spin" />
        <p className="font-pixel text-[10px] text-muted-2 tracking-[0.2em]">INITIALIZING_BLOGS_SYSTEM...</p>
      </div>
    );
  }

  return (
    <main ref={containerRef} className="min-h-screen bg-bg text-text pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-16">
        <div className="blog-hero text-center pt-8">
          <h1 className="text-4xl sm:text-5xl font-pixel tracking-tight text-text">BLOGS</h1>
          <p className="font-mono text-xs text-muted-2 mt-4 uppercase tracking-[0.15em]">Updates, tutorials, and tips from the core team</p>
        </div>

        {posts.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-24 text-muted-2">
            <span className="font-pixel text-2xl">{"{ }"}</span>
            <p className="font-mono text-sm uppercase tracking-widest">No articles found.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Filter tabs */}
            <div className="flex flex-wrap items-center justify-center gap-2 border-b border-border pb-4">
              <button
                onClick={() => startTransition(() => setSelectedCategory("all"))}
                className={`px-4 py-2 rounded-lg font-mono text-[10px] uppercase tracking-widest border transition-all ${selectedCategory === "all" ? "bg-text text-bg border-text" : "border-border text-muted-2 hover:text-text"}`}
              >
                ALL
              </button>
              {categories.map(c => (
                <button
                  key={c._id}
                  onClick={() => startTransition(() => setSelectedCategory(c.slug))}
                  className={`px-4 py-2 rounded-lg font-mono text-[10px] uppercase tracking-widest border transition-all ${selectedCategory === c.slug ? "bg-text text-bg border-text" : "border-border text-muted-2 hover:text-text"}`}
                >
                  {c.name}
                </button>
              ))}
            </div>

            {/* Grid */}
            <div className="blogs-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPosts.map(post => (
                <Link key={post._id} href={`/blog/${post.slug}`} className="blog-card block group">
                  <div className="bg-bg border border-border rounded-xl p-4 transition-all duration-300 hover:border-text/30 hover:bg-surface shadow-sm h-full flex flex-col">
                    <div className="flex gap-2 mb-3">
                      <span className="text-[9px] uppercase font-mono bg-text text-bg px-2 py-0.5 rounded border border-text font-bold tracking-widest">
                        {post.category?.name || "POST"}
                      </span>
                    </div>
                    <div className="w-full aspect-[16/9] rounded-lg overflow-hidden bg-surface mb-4 relative border border-border/50">
                      {post.coverImage ? (
                        <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-2 bg-surface-2"><ImageIcon className="w-8 h-8 opacity-20" /></div>
                      )}
                    </div>
                    <h3 className="font-pixel text-sm w-full text-text uppercase mb-2 line-clamp-2 leading-relaxed min-h-[3rem]">{post.title}</h3>
                    {post.excerpt && <p className="font-mono text-[11px] text-muted-2 line-clamp-3 mb-4">{post.excerpt}</p>}
                    
                    <div className="mt-auto space-y-1.5 pt-4 border-t border-border">
                      <p className="text-[9px] font-mono text-muted flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-text opacity-50" />
                        <span className="text-text">DATE:</span> {new Date(post.publishedAt || post.createdAt).toLocaleDateString()}
                      </p>
                      <p className="text-[9px] font-mono text-muted flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-text opacity-50" />
                        <span className="text-text">AUTHOR:</span> {post.author}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
