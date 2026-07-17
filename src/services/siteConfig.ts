import { supabase } from "@/lib/supabase";

export async function getSiteConfig(section: string) {
  const { data, error } = await supabase
    .from("site_configs")
    .select("data")
    .eq("section", section)
    .single();
  if (error) return null;
  return data.data;
}

export async function updateSiteConfig(section: string, configData: any) {
  const { data, error } = await supabase
    .from("site_configs")
    .upsert({ section, data: configData, updated_at: new Date().toISOString() })
    .select()
    .single();
  if (error) throw error;
  return data.data;
}
