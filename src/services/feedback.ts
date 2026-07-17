import { supabase } from "@/lib/supabase";

export async function addFeedback(fb: any) {
  const { data, error } = await supabase
    .from("feedbacks")
    .insert({
      name: fb.name,
      email: fb.email,
      year: Number(fb.year),
      department: fb.department,
      event_name: fb.eventName,
      rating: Number(fb.rating),
      comments: fb.comments
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getFeedbacks() {
  const { data, error } = await supabase.from("feedbacks").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  
  return data.map(item => ({
    ...item,
    _id: item.id,
    eventName: item.event_name,
    createdAt: item.created_at,
    updatedAt: item.updated_at
  }));
}
