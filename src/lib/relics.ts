import { supabase } from "./supabase";
import type { Relic, RelicInput } from "../types";

const BUCKET = "relic-images";
const COLUMNS = "id,name,description,price_buy,price_current,images,status,created_at";
const MAX_IMAGE_DIM = 1600;
const JPEG_QUALITY = 0.82;

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

async function compressImage(file: File): Promise<File> {
  if (!file.type.startsWith("image/") || file.type === "image/gif") return file;
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_IMAGE_DIM / Math.max(bitmap.width, bitmap.height));
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();
    const blob: Blob | null = await new Promise((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY)
    );
    if (!blob || blob.size >= file.size) return file;
    const name = file.name.replace(/\.[^.]+$/, "") + ".jpg";
    return new File([blob], name, { type: "image/jpeg", lastModified: Date.now() });
  } catch {
    return file;
  }
}

export async function uploadImages(files: File[]): Promise<string[]> {
  const tasks = files.map(async (rawFile) => {
    const file = await compressImage(rawFile);
    const extension = (file.name.split(".").pop() ?? "jpg").toLowerCase();
    const path = `${crypto.randomUUID()}.${extension}`;
    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(path, file, {
        cacheControl: "31536000, immutable",
        upsert: false,
        contentType: file.type || "image/jpeg",
      });
    if (error) throw error;
    return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
  });
  return Promise.all(tasks);
}
