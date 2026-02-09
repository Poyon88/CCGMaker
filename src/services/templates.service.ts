import { supabase } from "@/config/supabase";
import type { TablesInsert, TablesUpdate } from "@/types/database";

export async function fetchTemplates(projectId: string) {
  const { data, error } = await supabase
    .from("templates")
    .select("*")
    .eq("project_id", projectId)
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function fetchTemplate(id: string) {
  const { data, error } = await supabase
    .from("templates")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
}

export async function createTemplate(template: TablesInsert<"templates">) {
  const { data, error } = await supabase
    .from("templates")
    .insert(template)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateTemplate(id: string, updates: TablesUpdate<"templates">) {
  const { data, error } = await supabase
    .from("templates")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteTemplate(id: string) {
  const { error } = await supabase.from("templates").delete().eq("id", id);
  if (error) throw error;
}
