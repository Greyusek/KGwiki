"use client";

import Image from "next/image";
import { useState } from "react";

import { detectLinkProvider } from "@/lib/materials";

type MaterialItem = { id: string; fileName: string; url: string; type: "image"|"video"|"audio"|"document"|"external_link"; mimeType?: string|null; fileSize?: number|null; title?: string|null; externalUrl?: string|null; description?: string|null };

export function MaterialGallery({ items, onDelete }: { items: MaterialItem[]; onDelete?: (id: string) => void }) {
  const [lightbox, setLightbox] = useState<MaterialItem | null>(null);
  return <>
    <div className="grid gap-3 md:grid-cols-2">{items.map((m)=><div key={m.id} className="rounded-md border p-3 text-sm space-y-2">
      <p className="font-medium">{m.title || m.fileName}</p>
      {m.type==="image" && <button onClick={()=>setLightbox(m)}><Image src={m.url} alt={m.fileName} width={320} height={200} className="rounded-md object-cover"/></button>}
      {m.type==="video" && <video controls className="w-full rounded-md" src={m.url} />}
      {m.type==="audio" && <audio controls className="w-full" src={m.url} />}
      {m.type==="document" && <a className="text-blue-600 hover:underline" href={m.url} target="_blank" rel="noreferrer">Open document</a>}
      {m.type==="external_link" && <a className="text-blue-600 hover:underline" href={m.externalUrl || m.url} target="_blank" rel="noreferrer">Open link ({detectLinkProvider(m.externalUrl || m.url)})</a>}
      {m.mimeType ? <p className="text-xs text-muted-foreground">{m.mimeType}{m.fileSize ? ` · ${Math.ceil(m.fileSize/1024)}KB` : ""}</p> : null}
      {onDelete ? <button className="text-xs text-red-600 hover:underline" onClick={()=>onDelete(m.id)}>Delete</button> : null}
    </div>)}</div>
    {lightbox ? <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"><button className="absolute right-4 top-4 text-white" onClick={()=>setLightbox(null)}>Close</button><Image src={lightbox.url} alt={lightbox.fileName} width={1200} height={900} className="max-h-[90vh] w-auto"/></div> : null}
  </>;
}
