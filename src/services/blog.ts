import { supabase } from "@/lib/supabase";

export async function getBlogCategories() {
  const { data, error } = await supabase.from("blog_categories").select("*").order("name", { ascending: true });
  if (error) throw error;
  return data;
}

export async function addBlogCategory(name: string, slug: string) {
  const { data, error } = await supabase
    .from("blog_categories")
    .insert({ name, slug })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateBlogCategory(id: string, name: string, slug: string) {
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
  const { error } = await supabase.from("blog_categories").delete().eq("id", id);
  if (error) throw error;
}

export async function getBlogPosts(filters?: { status?: string }) {
  let q = supabase.from("blog_posts").select("*, category:blog_categories(name, slug)");
  if (filters?.status) {
    q = q.eq("status", filters.status);
  }
  const { data, error } = await q.order("published_at", { ascending: false });
  if (error) throw error;
  
  // Format matching the mongoose return style where category is nested
  return data.map(item => ({
    ...item,
    _id: item.id,
    coverImage: item.cover_image,
    publishedAt: item.published_at,
    createdAt: item.created_at,
    updatedAt: item.updated_at
  }));
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

export async function addBlogPost(post: any) {
  const { data, error } = await supabase
    .from("blog_posts")
    .insert({
      title: post.title,
      slug: post.slug.toLowerCase().trim(),
      content: post.content,
      excerpt: post.excerpt,
      cover_image: post.coverImage,
      category_id: post.category,
      author: post.author,
      status: post.status || "draft",
      published_at: post.publishedAt
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateBlogPost(id: string, post: any) {
  const mapped: any = {};
  if (post.title !== undefined) mapped.title = post.title;
  if (post.slug !== undefined) mapped.slug = post.slug.toLowerCase().trim();
  if (post.content !== undefined) mapped.content = post.content;
  if (post.excerpt !== undefined) mapped.excerpt = post.excerpt;
  if (post.coverImage !== undefined) mapped.cover_image = post.coverImage;
  if (post.category !== undefined) mapped.category_id = post.category;
  if (post.author !== undefined) mapped.author = post.author;
  if (post.status !== undefined) mapped.status = post.status;
  if (post.publishedAt !== undefined) mapped.published_at = post.publishedAt;

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
  const { error } = await supabase.from("blog_posts").delete().eq("id", id);
  if (error) throw error;
}
