import { supabase } from "@/config/supabase";
import { useGuestStore } from "@/stores/guest-store";
import {
  mapProjectToInsert,
  mapTemplateToInsert,
  mapCardToInsert,
  mapCardTypeToInsert,
  mapAttributeToInsert,
  mapRarityToInsert,
  mapPowerToInsert,
  mapTribeToInsert,
} from "@/lib/mappers";

/**
 * Migrates all guest (localStorage) data to Supabase for the given user.
 * Inserts in FK order: projects -> rules -> templates -> cards.
 * Clears the guest store on success.
 */
export async function migrateGuestData(userId: string): Promise<void> {
  const { projects, templates, cards, rules, clearAll } =
    useGuestStore.getState();

  // Nothing to migrate
  if (projects.length === 0) return;

  // 1. Projects — set real user_id
  const projectInserts = projects.map((p) => ({
    ...mapProjectToInsert({ ...p, userId }),
    user_id: userId,
  }));
  const { error: projErr } = await supabase
    .from("projects")
    .insert(projectInserts);
  if (projErr) throw new Error(`Projects migration failed: ${projErr.message}`);

  // 2. Rules — for each project, insert all rule entities in parallel
  for (const projectId of Object.keys(rules)) {
    const r = rules[projectId];
    void projectId; // used as iteration key

    async function insertCardTypes() {
      if (r.cardTypes.length === 0) return;
      const { error } = await supabase.from("card_types").insert(r.cardTypes.map(mapCardTypeToInsert));
      if (error) throw new Error(`card_types migration failed: ${error.message}`);
    }
    async function insertAttributes() {
      if (r.attributes.length === 0) return;
      const { error } = await supabase.from("attributes").insert(r.attributes.map(mapAttributeToInsert));
      if (error) throw new Error(`attributes migration failed: ${error.message}`);
    }
    async function insertRarities() {
      if (r.rarities.length === 0) return;
      const { error } = await supabase.from("rarities").insert(r.rarities.map(mapRarityToInsert));
      if (error) throw new Error(`rarities migration failed: ${error.message}`);
    }
    async function insertPowers() {
      if (r.powers.length === 0) return;
      const { error } = await supabase.from("powers").insert(r.powers.map(mapPowerToInsert));
      if (error) throw new Error(`powers migration failed: ${error.message}`);
    }
    async function insertTribes() {
      if (r.tribes.length === 0) return;
      const { error } = await supabase.from("tribes").insert(r.tribes.map(mapTribeToInsert));
      if (error) throw new Error(`tribes migration failed: ${error.message}`);
    }

    await Promise.all([
      insertCardTypes(),
      insertAttributes(),
      insertRarities(),
      insertPowers(),
      insertTribes(),
    ]);
  }

  // 3. Templates
  if (templates.length > 0) {
    const templateInserts = templates.map(mapTemplateToInsert);
    const { error: tplErr } = await supabase
      .from("templates")
      .insert(templateInserts);
    if (tplErr)
      throw new Error(`Templates migration failed: ${tplErr.message}`);
  }

  // 4. Cards — set real user_id
  if (cards.length > 0) {
    const cardInserts = cards.map((c) => mapCardToInsert(c, userId));
    const { error: cardErr } = await supabase
      .from("cards")
      .insert(cardInserts);
    if (cardErr)
      throw new Error(`Cards migration failed: ${cardErr.message}`);
  }

  // 5. Clear guest store
  clearAll();
}
