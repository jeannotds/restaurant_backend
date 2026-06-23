"use client";

import { useRef } from "react";
import { ImagePlus, RefreshCw, X } from "lucide-react";
import type { ImageReplacement, ProduitImage } from "@/lib/types";

type ProductImageFieldProps = {
  existingImages?: ProduitImage[];
  files: File[];
  onFilesChange: (files: File[]) => void;
  replacements: ImageReplacement[];
  onReplacementsChange: (replacements: ImageReplacement[]) => void;
};

export function ProductImageField({
  existingImages = [],
  files,
  onFilesChange,
  replacements,
  onReplacementsChange,
}: ProductImageFieldProps) {
  const addInputRef = useRef<HTMLInputElement>(null);
  const replaceInputRef = useRef<HTMLInputElement>(null);
  const replacingImageIdRef = useRef<string | null>(null);

  const replacedIds = new Set(replacements.map((r) => r.imageId));
  const visibleExisting = existingImages.filter((img) => !replacedIds.has(img.id));

  function handleAddSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files ?? []);
    if (selected.length > 0) {
      onFilesChange([...files, ...selected]);
    }
    e.target.value = "";
  }

  function handleReplaceSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const imageId = replacingImageIdRef.current;
    const selected = e.target.files?.[0];
    if (!imageId || !selected) {
      e.target.value = "";
      return;
    }

    const existing = existingImages.find((img) => img.id === imageId);
    onReplacementsChange([
      ...replacements.filter((r) => r.imageId !== imageId),
      {
        imageId,
        publicId: existing?.public_id ?? "",
        file: selected,
      },
    ]);
    replacingImageIdRef.current = null;
    e.target.value = "";
  }

  function startReplace(imageId: string) {
    replacingImageIdRef.current = imageId;
    replaceInputRef.current?.click();
  }

  function cancelReplacement(imageId: string) {
    onReplacementsChange(replacements.filter((r) => r.imageId !== imageId));
  }

  function removeFile(index: number) {
    onFilesChange(files.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-3">
      <span className="text-sm font-medium text-foreground">Images</span>

      {visibleExisting.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {visibleExisting.map((img) => (
            <div key={img.id} className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.url_image}
                alt="Image produit"
                className="h-20 w-20 rounded-lg border border-border object-cover"
              />
              <span className="absolute bottom-1 left-1 rounded bg-black/60 px-1 text-[10px] text-white">
                actuelle
              </span>
              <button
                type="button"
                onClick={() => startReplace(img.id)}
                className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white"
                aria-label="Remplacer l'image"
              >
                <RefreshCw size={10} />
              </button>
            </div>
          ))}
        </div>
      )}

      {replacements.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {replacements.map((replacement) => (
            <div key={replacement.imageId} className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={URL.createObjectURL(replacement.file)}
                alt={replacement.file.name}
                className="h-20 w-20 rounded-lg border border-primary object-cover"
              />
              <span className="absolute bottom-1 left-1 rounded bg-primary px-1 text-[10px] text-white">
                remplace
              </span>
              <button
                type="button"
                onClick={() => cancelReplacement(replacement.imageId)}
                className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-danger text-white"
                aria-label="Annuler le remplacement"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      {files.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {files.map((file, index) => (
            <div key={`${file.name}-${index}`} className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={URL.createObjectURL(file)}
                alt={file.name}
                className="h-20 w-20 rounded-lg border border-border object-cover"
              />
              <span className="absolute bottom-1 left-1 rounded bg-black/60 px-1 text-[10px] text-white">
                nouvelle
              </span>
              <button
                type="button"
                onClick={() => removeFile(index)}
                className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-danger text-white"
                aria-label="Retirer l'image"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      <input
        ref={addInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        multiple
        className="hidden"
        onChange={handleAddSelect}
      />
      <input
        ref={replaceInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={handleReplaceSelect}
      />

      <button
        type="button"
        onClick={() => addInputRef.current?.click()}
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-background px-4 py-6 text-sm text-muted transition-colors hover:border-primary hover:text-primary"
      >
        <ImagePlus size={18} />
        {files.length > 0 || replacements.length > 0
          ? "Ajouter d'autres images"
          : "Choisir des images (JPEG, PNG, WebP)"}
      </button>

      <p className="text-xs text-muted">
        Max 5 Mo par image. Upload vers Cloudinary. Cliquez sur l&apos;icône
        de remplacement pour mettre à jour une image existante.
      </p>
    </div>
  );
}
