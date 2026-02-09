import { supabase } from "@/config/supabase";
import type { TablesInsert, TablesUpdate } from "@/types/database";

export async function fetchCards(projectId?: string) {
  let query = supabase.from("cards").select("*").order("updated_at", { ascending: false });
  if (projectId) query = query.eq("project_id", projectId);
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function fetchCard(id: string) {
  const { data, error } = await supabase
    .from("cards")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
}

export async function createCard(card: TablesInsert<"cards">) {
  const { data, error } = await supabase
    .from("cards")
    .insert(card)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateCard(id: string, updates: TablesUpdate<"cards">) {
  const { data, error } = await supabase
    .from("cards")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteCard(id: string) {
  const { error } = await supabase.from("cards").delete().eq("id", id);
  if (error) throw error;
}
