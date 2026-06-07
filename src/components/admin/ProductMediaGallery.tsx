"use client";

import { useCallback, useRef, useState } from "react";
import { Camera, Trash2, GripVertical, Loader2 } from "lucide-react";
import { uploadProductImage, resolveImageMime } from "@/lib/upload-product-image";

type Props = {
  imageUrl: string;
  galleryUrls: string[];
  onChange: (imageUrl: string, galleryUrls: string[]) => void;
};

function uniqueImages(imageUrl: string, galleryUrls: string[]) {
  const all = [imageUrl, ...galleryUrls].filter(Boolean);
  return all.filter((url, i) => all.indexOf(url) === i);
}

function splitImages(ordered: string[]): {
  imageUrl: string;
  galleryUrls: string[];
} {
  if (ordered.length === 0) return { imageUrl: "", galleryUrls: [] };
  return { imageUrl: ordered[0], galleryUrls: ordered.slice(1) };
}

export function ProductMediaGallery({
  imageUrl,
  galleryUrls,
  onChange,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const images = uniqueImages(imageUrl, galleryUrls);

  const applyOrder = useCallback(
    (ordered: string[]) => {
      const { imageUrl: nextMain, galleryUrls: nextGallery } =
        splitImages(ordered);
      onChange(nextMain, nextGallery);
    },
    [onChange]
  );

  async function uploadFiles(files: FileList | File[]) {
    const list = Array.from(files).filter(
      (f) => f.type.startsWith("image/") || resolveImageMime(f)
    );
    if (!list.length) {
      setError("Please choose image files (JPEG, PNG, WebP, GIF).");
      return;
    }

    setUploading(true);
    setError(null);
    const newUrls: string[] = [];

    for (const file of list) {
      try {
        const url = await uploadProductImage(file);
        newUrls.push(url);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Upload failed.");
        break;
      }
    }

    if (newUrls.length) {
      applyOrder([...images, ...newUrls]);
    }

    setUploading(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    if (uploading) return;
    if (e.dataTransfer.files?.length) {
      uploadFiles(e.dataTransfer.files);
    }
  }

  function removeImage(url: string) {
    applyOrder(images.filter((u) => u !== url));
  }

  function onThumbDragStart(index: number) {
    setDragIndex(index);
  }

  function onThumbDragOver(e: React.DragEvent, index: number) {
    e.preventDefault();
    if (dragIndex === null || dragIndex === index) return;

    const next = [...images];
    const [moved] = next.splice(dragIndex, 1);
    next.splice(index, 0, moved);
    setDragIndex(index);
    applyOrder(next);
  }

  function onThumbDragEnd() {
    setDragIndex(null);
  }

  return (
    <div className="space-y-4">
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.length) uploadFiles(e.target.files);
        }}
      />

      <div
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
        }}
        onClick={() => !uploading && inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={`w-full max-w-[200px] aspect-square border-2 border-dashed rounded-lg flex flex-col items-center justify-center gap-2 transition-colors cursor-pointer ${
          dragOver
            ? "border-primary bg-primary-light/30"
            : "border-slate-200 hover:border-primary hover:bg-primary-light/20"
        } ${uploading ? "opacity-60 pointer-events-none" : ""}`}
      >
        {uploading ? (
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
        ) : (
          <Camera className="w-10 h-10 text-emerald-600" />
        )}
        <span className="text-xs text-slate-500 px-3 text-center">
          {uploading
            ? "Uploading..."
            : "Drop images here or click to browse"}
        </span>
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      {images.length > 0 && (
        <div>
          <p className="text-xs text-slate-500 mb-2">
            Drag thumbnails to reorder. The first image is the main product
            photo.
          </p>
          <div className="flex flex-wrap gap-3">
            {images.map((url, index) => (
              <div
                key={url}
                draggable
                onDragStart={() => onThumbDragStart(index)}
                onDragOver={(e) => onThumbDragOver(e, index)}
                onDragEnd={onThumbDragEnd}
                className={`relative w-24 h-24 rounded-lg overflow-hidden border-2 group cursor-grab active:cursor-grabbing ${
                  index === 0 ? "border-primary" : "border-slate-200"
                } ${dragIndex === index ? "opacity-70 ring-2 ring-primary" : ""}`}
              >
                <img
                  src={url}
                  alt=""
                  className="w-full h-full object-cover pointer-events-none"
                />
                {index === 0 && (
                  <span className="absolute top-1 left-1 text-[10px] font-semibold bg-primary text-white px-1.5 py-0.5 rounded">
                    Main
                  </span>
                )}
                <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <GripVertical className="w-4 h-4 text-white drop-shadow" />
                </div>
                <button
                  type="button"
                  onClick={() => removeImage(url)}
                  className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
