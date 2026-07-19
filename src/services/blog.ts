import { supabase } from "@/lib/supabase";

// --- Helpers ---

/** Converts a text string into a URL-safe slug. */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/** Error thrown when a requested resource does not exist. */
export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NotFoundError";
  }
}

// --- Blog Categories ---

export async function getBlogCategories() {
  const { data, error } = await supabase.from("blog_categories").select("*").order("name", { ascending: true });
  if (error) throw error;
  return data;
}

export async function getBlogCategoryById(id: string) {
  const { data, error } = await supabase
    .from("blog_categories")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new NotFoundError("Category not found");
  return data;
}

export async function addBlogCategory(name: string) {
  const slug = slugify(name);
  const { data, error } = await supabase
    .from("blog_categories")
    .insert({ name, slug })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateBlogCategory(id: string, name: string) {
  await getBlogCategoryById(id);
  const slug = slugify(name);
  const { data, error } = await supabase
    .from("blog_categories")
    .update({ name, slug })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteBlogCategory(id: string) {
  const existing = await getBlogCategoryById(id);
  const { error } = await supabase.from("blog_categories").delete().eq("id", id);
  if (error) throw error;
  return existing;
}

// --- Blog Posts ---

export async function getBlogPosts(filters?: { status?: string }) {
  let q = supabase.from("blog_posts").select("*, category:blog_categories(name, slug)");
  if (filters?.status) {
    q = q.eq("status", filters.status);
  }
  const { data, error } = await q.order("published_at", { ascending: false });
  if (error) throw error;

  // Format matching the mongoose return style where category is nested
  return data.map((item: any) => ({
    ...item,
    _id: item.id,
    coverImage: item.cover_image,
    publishedAt: item.published_at,
    createdAt: item.created_at,
    updatedAt: item.updated_at
  }));
}

export async function getBlogPostById(id: string) {
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*, category:blog_categories(name, slug)")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new NotFoundError("Post not found");

  return {
    ...data,
    _id: data.id,
    coverImage: data.cover_image,
    publishedAt: data.published_at,
    createdAt: data.created_at,
    updatedAt: data.updated_at
  };
}

export async function getBlogPostBySlug(slug: string) {
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*, category:blog_categories(name, slug)")
    .eq("slug", slug.toLowerCase().trim())
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;

  return {
    ...data,
    _id: data.id,
    coverImage: data.cover_image,
    publishedAt: data.published_at,
    createdAt: data.created_at,
    updatedAt: data.updated_at
  };
}

export async function addBlogPost(post: {
  title: string;
  content: string;
  excerpt?: string;
  coverImage?: string;
  category: string;
  author: string;
  status?: string;
}) {
  const slug = slugify(post.title);
  const status = post.status || "draft";

  const { data, error } = await supabase
    .from("blog_posts")
    .insert({
      title: post.title,
      slug,
      content: post.content,
      excerpt: post.excerpt,
      cover_image: post.coverImage,
      category_id: post.category,
      author: post.author,
      status,
      published_at: status === "published" ? new Date().toISOString() : null
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateBlogPost(id: string, post: {
  title: string;
  content: string;
  excerpt?: string;
  coverImage?: string;
  category: string;
  author: string;
  status?: string;
}) {
  const existing = await getBlogPostById(id);
  const slug = slugify(post.title);

  const mapped: Record<string, unknown> = {
    title: post.title,
    slug,
    content: post.content,
    excerpt: post.excerpt,
    cover_image: post.coverImage,
    category_id: post.category,
    author: post.author,
    status: post.status,
  };

  // Handle publishedAt transition logic
  if (post.status === "published" && existing.status !== "published") {
    mapped.published_at = new Date().toISOString();
  } else if (post.status === "draft") {
    mapped.published_at = null;
  }

  const { data, error } = await supabase
    .from("blog_posts")
    .update(mapped)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteBlogPost(id: string) {
  const existing = await getBlogPostById(id);
  const { error } = await supabase.from("blog_posts").delete().eq("id", id);
  if (error) throw error;
  return existing;
}
