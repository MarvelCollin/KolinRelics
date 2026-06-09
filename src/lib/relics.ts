import { supabase } from "./supabase";
import type { Relic, RelicInput } from "../types";

const BUCKET = "relic-images";
const COLUMNS = "id,name,description,price_buy,price_current,images,status,created_at";

export async function listRelics(limit = 200): Promise<Relic[]> {
  const { data, error } = await supabase
    .from("relics")
    .select(COLUMNS)
    .order("status", { ascending: true })
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as Relic[];
}

export async function createRelic(input: RelicInput): Promise<Relic> {
  const { data, error } = await supabase
    .from("relics")
    .insert(input)
    .select(COLUMNS)
    .single();
  if (error) throw error;
  return data as Relic;
}

export async function updateRelic(id: string, input: RelicInput): Promise<Relic> {
  const { data, error } = await supabase
    .from("relics")
    .update(input)
    .eq("id", id)
    .select(COLUMNS)
    .single();
  if (error) throw error;
  return data as Relic;
}

export async function deleteRelic(id: string): Promise<void> {
  const { error } = await supabase.from("relics").delete().eq("id", id);
  if (error) throw error;
}

export async function uploadImages(files: File[]): Promise<string[]> {
  const tasks = files.map(async (file) => {
    const extension = (file.name.split(".").pop() ?? "bin").toLowerCase();
    const path = `${crypto.randomUUID()}.${extension}`;
    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(path, file, {
        cacheControl: "31536000",
        upsert: false,
        contentType: file.type || undefined,
      });
    if (error) throw error;
    return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
  });
  return Promise.all(tasks);
}
