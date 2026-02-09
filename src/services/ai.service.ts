import { supabase } from "@/config/supabase";

interface GenerateCardParams {
  cardType: string;
  universe: string;
  powerLevel: string;
  role: string;
  customRequest: string;
  fields: { id: string; type: string; label: string }[];
}

interface GenerateCardResult {
  fieldValues: Record<string, string>;
  cardName: string;
}

export async function generateCard(params: GenerateCardParams): Promise<GenerateCardResult> {
  const { data, error } = await supabase.functions.invoke("generate-card", {
    body: params,
  });
  if (error) throw new Error(error.message || "Failed to generate card");
  if (data.error) throw new Error(data.error);
  return data as GenerateCardResult;
}

interface GenerateImageParams {
  cardName: string;
  cardType: string;
  universe: string;
  description: string;
  cardId: string;
}

interface GenerateImageResult {
  imageUrl: string;
}

export async function generateImage(params: GenerateImageParams): Promise<GenerateImageResult> {
  const { data, error } = await supabase.functions.invoke("generate-image", {
    body: params,
  });
  if (error) throw new Error(error.message || "Failed to generate image");
  if (data.error) throw new Error(data.error);
  return data as GenerateImageResult;
}
