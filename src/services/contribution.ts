import { supabase } from "@/lib/supabase";

export async function getContributions() {
  const { data, error } = await supabase
    .from("contributions")
    .select("*, member:registrations(name, department, year)")
    .order("order", { ascending: true })
    .order("created_at", { ascending: false });
  if (error) throw error;

  return data.map(item => ({
    _id: item.id,
    memberId: item.member_id,
    title: item.title,
    description: item.description,
    url: item.url,
    links: item.links,
    imageUrl: item.image_url,
    isFeatured: item.is_featured,
    order: item.order,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
    memberIdPopulated: item.member
  }));
}

export async function addContribution(contrib: any) {
  const { data, error } = await supabase
    .from("contributions")
    .insert({
      member_id: contrib.memberId,
      title: contrib.title,
      description: contrib.description,
      url: contrib.url,
      links: contrib.links || [],
      image_url: contrib.imageUrl,
      is_featured: contrib.isFeatured || false,
      order: contrib.order || 0
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateContribution(id: string, updates: any) {
  const mapped: any = {};
  if (updates.title !== undefined) mapped.title = updates.title;
  if (updates.description !== undefined) mapped.description = updates.description;
  if (updates.url !== undefined) mapped.url = updates.url;
  if (updates.links !== undefined) mapped.links = updates.links;
  if (updates.imageUrl !== undefined) mapped.image_url = updates.imageUrl;
  if (updates.isFeatured !== undefined) mapped.is_featured = updates.isFeatured;
  if (updates.order !== undefined) mapped.order = updates.order;
  if (updates.memberId !== undefined) mapped.member_id = updates.memberId;

  const { data, error } = await supabase
    .from("contributions")
    .update(mapped)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteContribution(id: string) {
  const { error } = await supabase.from("contributions").delete().eq("id", id);
  if (error) throw error;
}
