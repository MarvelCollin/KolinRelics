import { supabase } from "./supabase";
import type { Relic, RelicInput } from "../types";

const BUCKET = "relic-images";

export async function listRelics(): Promise<Relic[]> {
  const { data, error } = await supabase
    .from("relics")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as Relic[];
}

export async function createRelic(input: RelicInput): Promise<Relic> {
  const { data, error } = await supabase
    .from("relics")
    .insert(input)
    .select()
    .single();
  if (error) throw error;
  return data as Relic;
}

export async function updateRelic(id: string, input: RelicInput): Promise<Relic> {
  const { data, error } = await supabase
    .from("relics")
    .update(input)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as Relic;
}

export async function deleteRelic(id: string): Promise<void> {
  const { error } = await supabase.from("relics").delete().eq("id", id);
  if (error) throw error;
}

export async function uploadImages(files: File[]): Promise<string[]> {
  const urls: string[] = [];
  for (const file of files) {
    const extension = file.name.split(".").pop() ?? "bin";
    const path = `${crypto.randomUUID()}.${extension}`;
    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(path, file, { cacheControl: "3600", upsert: false });
    if (error) throw error;
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    urls.push(data.publicUrl);
  }
  return urls;
}
