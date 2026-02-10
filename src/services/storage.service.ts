import { supabase } from "@/config/supabase";

const BUCKET = "template-backgrounds";

export async function uploadBackgroundImage(
  userId: string,
  templateId: string,
  file: File | Blob,
  extension: string,
): Promise<string> {
  const path = `${userId}/${templateId}.${extension}`;
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { upsert: true, contentType: file.type });
  if (error) throw error;

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export async function deleteBackgroundImage(
  userId: string,
  templateId: string,
): Promise<void> {
  const paths = [
    `${userId}/${templateId}.png`,
    `${userId}/${templateId}.jpg`,
    `${userId}/${templateId}.jpeg`,
  ];
  await supabase.storage.from(BUCKET).remove(paths);
}
