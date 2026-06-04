import { useState } from "react";
import type { Relic, RelicInput } from "../types";
import { uploadImages } from "../lib/relics";

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
    } catch (err) {
      setError((err as Error).message);
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
      });
    } catch (err) {
      setError((err as Error).message);
      setSaving(false);
    }
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <h3>{initial ? "Edit relic" : "New relic"}</h3>

      <label>
        Name
        <input value={name} onChange={(e) => setName(e.target.value)} required />
      </label>

      <label>
        Description
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
        />
      </label>

      <div className="form-row">
        <label>
          Buy price
          <input
            type="number"
            step="0.01"
            value={priceBuy}
            onChange={(e) => setPriceBuy(e.target.value)}
          />
        </label>
        <label>
          Current price
          <input
            type="number"
            step="0.01"
            value={priceCurrent}
            onChange={(e) => setPriceCurrent(e.target.value)}
          />
        </label>
      </div>

      <label>
        Images
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => handleFiles(e.target.files)}
        />
      </label>
      {uploading && <p className="muted">Uploading...</p>}

      {images.length > 0 && (
        <div className="form-images">
          {images.map((url) => (
            <div key={url} className="form-thumb">
              <img src={url} alt="relic" />
              <button type="button" onClick={() => removeImage(url)}>
                Remove
              </button>
            </div>
          ))}
        </div>
      )}

      {error && <p className="error">{error}</p>}

      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={saving || uploading}>
          {saving ? "Saving..." : "Save"}
        </button>
        <button type="button" className="btn" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}

export default RelicForm;
