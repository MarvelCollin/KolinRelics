import { useState } from "react";
import { Loader2, Upload, X, Camera } from "lucide-react";
import { toast } from "sonner";
import type { Relic, RelicInput, RelicStatus } from "@/types";
import { uploadImages } from "@/lib/relics";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface Props {
  initial?: Relic;
  onSubmit: (input: RelicInput) => Promise<void>;
  onCancel: () => void;
}

function RelicForm({ initial, onSubmit, onCancel }: Props) {
  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [priceBuy, setPriceBuy] = useState(String(initial?.price_buy ?? ""));
  const [priceCurrent, setPriceCurrent] = useState(String(initial?.price_current ?? ""));
  const [images, setImages] = useState<string[]>(initial?.images ?? []);
  const [status, setStatus] = useState<RelicStatus>(initial?.status ?? "new");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    setUploading(true);
    setError("");
    try {
      const uploaded = await uploadImages(Array.from(fileList));
      setImages((prev) => [...prev, ...uploaded]);
      toast.success(
        `${uploaded.length} ${uploaded.length === 1 ? "photo" : "photos"} uploaded`
      );
    } catch (err) {
      setError((err as Error).message);
      toast.error("Upload failed", { description: (err as Error).message });
    } finally {
      setUploading(false);
    }
  }

  function removeImage(url: string) {
    setImages((prev) => prev.filter((item) => item !== url));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      await onSubmit({
        name: name.trim(),
        description: description.trim(),
        price_buy: Number(priceBuy) || 0,
        price_current: Number(priceCurrent) || 0,
        images,
        status,
      });
    } catch (err) {
      setError((err as Error).message);
      setSaving(false);
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ancient amulet"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Provenance, condition, notes..."
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="priceBuy">Buy price</Label>
          <Input
            id="priceBuy"
            type="number"
            step="1"
            min="0"
            value={priceBuy}
            onChange={(e) => setPriceBuy(e.target.value)}
            placeholder="0"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="priceCurrent">Current price</Label>
          <Input
            id="priceCurrent"
            type="number"
            step="1"
            min="0"
            value={priceCurrent}
            onChange={(e) => setPriceCurrent(e.target.value)}
            placeholder="0"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <select
          id="status"
          value={status}
          onChange={(e) => setStatus(e.target.value as RelicStatus)}
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          <option value="new">New</option>
          <option value="sold">Sold</option>
        </select>
      </div>

      <div className="space-y-3">
        <Label>Images</Label>
        <div className="grid grid-cols-2 gap-2">
          <label className="flex cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed border-input py-6 text-sm text-muted-foreground transition-colors hover:border-ring hover:text-foreground">
            {uploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            {uploading ? "Uploading" : "Upload"}
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
              disabled={uploading}
            />
          </label>
          <label className="flex cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed border-input py-6 text-sm text-muted-foreground transition-colors hover:border-ring hover:text-foreground">
            <Camera className="h-4 w-4" />
            Take photo
            <input
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
              disabled={uploading}
            />
          </label>
        </div>
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {images.map((url) => (
            <div key={url} className="group relative aspect-square">
              <img
                src={url}
                alt="relic"
                loading="lazy"
                decoding="async"
                className="h-full w-full rounded-md object-cover"
              />
              <button
                type="button"
                onClick={() => removeImage(url)}
                className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={saving || uploading}>
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          {saving ? "Saving" : "Save relic"}
        </Button>
      </div>
    </form>
  );
}

export default RelicForm;
