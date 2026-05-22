"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ImagePlus, Package, X } from "lucide-react";

type ModpackIconPickerProps = {
  initialIconUrl?: string | null;
  onChange: (selection: {
    iconFile: File | null;
    removeIcon: boolean;
  }) => void;
};

export function ModpackIconPicker({
  initialIconUrl = null,
  onChange,
}: ModpackIconPickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialIconUrl);
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [removeIcon, setRemoveIcon] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  function updateSelection(next: {
    iconFile: File | null;
    removeIcon: boolean;
    previewUrl: string | null;
  }) {
    setIconFile(next.iconFile);
    setRemoveIcon(next.removeIcon);
    setPreviewUrl(next.previewUrl);
    onChange({ iconFile: next.iconFile, removeIcon: next.removeIcon });
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    setError(null);
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    if (!["image/jpeg", "image/png"].includes(file.type)) {
      setError("Choose a JPEG or PNG image.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError("Icon must be 2 MB or smaller.");
      return;
    }

    if (previewUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }

    updateSelection({
      iconFile: file,
      removeIcon: false,
      previewUrl: URL.createObjectURL(file),
    });
  }

  function handleRemove() {
    if (previewUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }

    updateSelection({
      iconFile: null,
      removeIcon: Boolean(initialIconUrl),
      previewUrl: null,
    });
    setError(null);
  }

  const showPreview = Boolean(previewUrl) && !removeIcon;

  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-sm font-medium text-zinc-300">Modpack icon</h2>
        <p className="mt-1 text-sm text-zinc-500">
          Optional square image shown on your modpack cards. JPEG or PNG, max 2 MB.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl bg-violet-500/15 ring-1 ring-violet-400/20">
          {showPreview ? (
            <Image
              src={previewUrl!}
              alt="Modpack icon preview"
              width={80}
              height={80}
              unoptimized
              className="h-full w-full object-cover"
            />
          ) : (
            <Package className="h-8 w-8 text-violet-300" />
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-[#111111] px-4 py-2.5 text-sm font-medium text-zinc-200 transition hover:border-violet-400/30 hover:text-white"
          >
            <ImagePlus className="h-4 w-4" />
            {showPreview ? "Change icon" : "Upload icon"}
          </button>

          {showPreview ? (
            <button
              type="button"
              onClick={handleRemove}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm font-medium text-zinc-400 transition hover:border-red-400/30 hover:text-red-300"
            >
              <X className="h-4 w-4" />
              Remove
            </button>
          ) : null}
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png"
        className="hidden"
        onChange={handleFileChange}
      />

      {error ? <p className="text-sm text-red-400">{error}</p> : null}
    </section>
  );
}

export async function applyModpackIconChanges(
  modpackId: string,
  selection: { iconFile: File | null; removeIcon: boolean },
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (selection.iconFile) {
    const formData = new FormData();
    formData.append("icon", selection.iconFile);

    const response = await fetch(`/api/modpacks/${modpackId}/icon`, {
      method: "POST",
      body: formData,
    });

    const payload = (await response.json()) as { error?: string };
    if (!response.ok) {
      return { ok: false, error: payload.error ?? "Could not upload icon." };
    }

    return { ok: true };
  }

  if (selection.removeIcon) {
    const response = await fetch(`/api/modpacks/${modpackId}/icon`, {
      method: "DELETE",
    });

    const payload = (await response.json()) as { error?: string };
    if (!response.ok) {
      return { ok: false, error: payload.error ?? "Could not remove icon." };
    }
  }

  return { ok: true };
}
