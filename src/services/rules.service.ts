import { supabase } from "@/config/supabase";
import type { TablesInsert } from "@/types/database";

// ── Card Types ──
export async function fetchCardTypes(projectId: string) {
  const { data, error } = await supabase
    .from("card_types")
    .select("*")
    .eq("project_id", projectId)
    .order("sort_order");
  if (error) throw error;
  return data;
}

export async function upsertCardTypes(projectId: string, items: TablesInsert<"card_types">[]) {
  // Delete existing then insert all (simpler for reordering)
  const { error: delErr } = await supabase.from("card_types").delete().eq("project_id", projectId);
  if (delErr) throw delErr;
  if (items.length === 0) return [];
  const { data, error } = await supabase.from("card_types").insert(items).select();
  if (error) throw error;
  return data;
}

// ── Attributes ──
export async function fetchAttributes(projectId: string) {
  const { data, error } = await supabase
    .from("attributes")
    .select("*")
    .eq("project_id", projectId)
    .order("sort_order");
  if (error) throw error;
  return data;
}

export async function upsertAttributes(projectId: string, items: TablesInsert<"attributes">[]) {
  const { error: delErr } = await supabase.from("attributes").delete().eq("project_id", projectId);
  if (delErr) throw delErr;
  if (items.length === 0) return [];
  const { data, error } = await supabase.from("attributes").insert(items).select();
  if (error) throw error;
  return data;
}

// ── Rarities ──
export async function fetchRarities(projectId: string) {
  const { data, error } = await supabase
    .from("rarities")
    .select("*")
    .eq("project_id", projectId)
    .order("sort_order");
  if (error) throw error;
  return data;
}

export async function upsertRarities(projectId: string, items: TablesInsert<"rarities">[]) {
  const { error: delErr } = await supabase.from("rarities").delete().eq("project_id", projectId);
  if (delErr) throw delErr;
  if (items.length === 0) return [];
  const { data, error } = await supabase.from("rarities").insert(items).select();
  if (error) throw error;
  return data;
}

// ── Powers ──
export async function fetchPowers(projectId: string) {
  const { data, error } = await supabase
    .from("powers")
    .select("*")
    .eq("project_id", projectId)
    .order("sort_order");
  if (error) throw error;
  return data;
}

export async function upsertPowers(projectId: string, items: TablesInsert<"powers">[]) {
  const { error: delErr } = await supabase.from("powers").delete().eq("project_id", projectId);
  if (delErr) throw delErr;
  if (items.length === 0) return [];
  const { data, error } = await supabase.from("powers").insert(items).select();
  if (error) throw error;
  return data;
}

// ── Tribes ──
export async function fetchTribes(projectId: string) {
  const { data, error } = await supabase
    .from("tribes")
    .select("*")
    .eq("project_id", projectId)
    .order("sort_order");
  if (error) throw error;
  return data;
}

export async function upsertTribes(projectId: string, items: TablesInsert<"tribes">[]) {
  const { error: delErr } = await supabase.from("tribes").delete().eq("project_id", projectId);
  if (delErr) throw delErr;
  if (items.length === 0) return [];
  const { data, error } = await supabase.from("tribes").insert(items).select();
  if (error) throw error;
  return data;
}
