"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import { detectLinkProvider } from "@/lib/materials";
import { Button } from "@/components/ui/button";

type MaterialItem = {
  id: string;
  fileName: string;
  url: string;
  type: "image" | "video" | "audio" | "document" | "external_link";
  mimeType?: string | null;
  fileSize?: number | null;
  title?: string | null;
  externalUrl?: string | null;
  description?: string | null;
};

function formatFileSize(bytes?: number | null) {
  if (!bytes) return null;
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileExtension(fileName: string) {
  const parts = fileName.split(".");
  return parts.length > 1 ? parts[parts.length - 1].toUpperCase() : null;
}

export function MaterialGallery({ items, onDelete }: { items: MaterialItem[]; onDelete?: (id: string) => void }) {
  const [lightbox, setLightbox] = useState<MaterialItem | null>(null);

  useEffect(() => {
    if (!lightbox) return;

    function onEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setLightbox(null);
    }

    window.addEventListener("keydown", onEscape);
    return () => window.removeEventListener("keydown", onEscape);
  }, [lightbox]);

  if (!items.length) {
    return <p className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">No materials yet</p>;
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {items.map((m) => {
          const label = m.title || m.fileName;
          const fileSize = formatFileSize(m.fileSize);
          const linkUrl = m.type === "external_link" ? (m.externalUrl || "") : m.url;
          const provider = m.type === "external_link" ? detectLinkProvider(m.externalUrl) : null;

          return (
            <article key={m.id} className="flex h-full min-h-56 cursor-default flex-col rounded-xl border bg-card p-4 text-sm transition-shadow hover:shadow-md">
              <div className="mb-2 flex items-start justify-between gap-2">
                <h3 className="line-clamp-2 font-medium" title={label}>{label}</h3>
                {onDelete ? (
                  <Button variant="outline" size="sm" className="h-7 px-2 text-xs" onClick={() => onDelete(m.id)} aria-label={`Delete ${label}`}>
                    🗑 Delete
                  </Button>
                ) : null}
              </div>

              {m.type === "image" && (
                <button type="button" className="relative h-60 w-full cursor-pointer overflow-hidden rounded-md border bg-muted" onClick={() => setLightbox(m)} aria-label={`Open image ${label}`}>
                  <Image src={m.url} alt={m.fileName} fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" />
                </button>
              )}

              {m.type === "video" && (
                <div className="h-60 w-full overflow-hidden rounded-md border bg-muted">
                  <video controls className="h-full w-full object-contain" src={m.url} />
                </div>
              )}

              {m.type === "audio" && (
                <div className="rounded-md border bg-muted/30 p-3">
                  <p className="mb-2 truncate text-xs font-medium" title={label}>{label}</p>
                  <audio controls className="w-full" src={m.url} />
                </div>
              )}

              {m.type === "document" && (
                <div className="flex flex-1 flex-col justify-between rounded-md border bg-muted/30 p-3">
                  <div className="space-y-1">
                    <p className="text-2xl" aria-hidden="true">📄</p>
                    <p className="line-clamp-2 text-xs font-medium">{m.fileName}</p>
                    <p className="text-xs text-muted-foreground">{getFileExtension(m.fileName) || "Document"}</p>
                  </div>
                  <a className="mt-3 inline-block rounded-md border px-3 py-1.5 text-xs font-medium hover:bg-muted" href={m.url} target="_blank" rel="noopener noreferrer">Open / Download</a>
                </div>
              )}

              {m.type === "external_link" && (
                <div className="flex flex-1 flex-col justify-between rounded-md border bg-muted/30 p-3">
                  <div className="space-y-1">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">{provider || "External link"}</p>
                    {m.description ? <p className="line-clamp-3 text-xs text-muted-foreground">{m.description}</p> : null}
                  </div>
                  <a className="mt-3 inline-block rounded-md border px-3 py-1.5 text-xs font-medium hover:bg-muted" href={linkUrl} target="_blank" rel="noopener noreferrer">Open link</a>
                </div>
              )}

              <div className="mt-3 text-xs text-muted-foreground">
                {m.mimeType || getFileExtension(m.fileName) || "Material"}
                {fileSize ? ` · ${fileSize}` : ""}
              </div>
            </article>
          );
        })}
      </div>

      {lightbox ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
          <button className="absolute right-4 top-4 rounded-md border border-white/40 px-3 py-1 text-sm text-white" onClick={() => setLightbox(null)} aria-label="Close image preview">✕ Close</button>
          <div className="w-full max-w-5xl space-y-2">
            <p className="text-center text-sm font-medium text-white">{lightbox.title || lightbox.fileName}</p>
            <div className="relative h-[75vh] w-full">
              <Image src={lightbox.url} alt={lightbox.fileName} fill className="object-contain" sizes="100vw" />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
