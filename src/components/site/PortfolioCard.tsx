import { useState } from "react";
import { ArrowUpRight, ChevronLeft, ChevronRight, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { validProjectUrl, type PortfolioProject } from "@/lib/portfolio";

export function PortfolioCard({ project: p }: { project: PortfolioProject }) {
  const [open, setOpen] = useState(false);
  const [slide, setSlide] = useState(0);
  const images = [p.image, ...p.gallery].filter(Boolean);
  return <>
    <article className="group overflow-hidden rounded-lg border bg-card transition-shadow hover:shadow-card">
      <div className="relative border-b bg-background">
        <img src={p.image} alt={p.image_alt || p.title} loading="lazy" width={1024} height={1024} className="aspect-square w-full object-contain p-3" />
        {p.is_demo && <span className="absolute left-3 top-3 rounded bg-background/95 px-2 py-1 text-[10px] font-semibold text-muted-foreground">Konsep desain</span>}
      </div>
      <div className="p-4">
        <h3 className="truncate text-base font-bold text-navy" title={p.title}>{p.title}</h3>
        <p className="mt-1 text-xs text-muted-foreground">{p.category}</p>
        <Button className="mt-4 h-10 w-full rounded-md font-semibold" onClick={() => { setSlide(0); setOpen(true); }}><Eye className="size-4" />Lihat portfolio</Button>
      </div>
    </article>
    <Dialog open={open} onOpenChange={setOpen}><DialogContent className="max-h-[90dvh] max-w-3xl overflow-y-auto">
      <DialogTitle className="pr-6 text-xl text-navy">{p.title}</DialogTitle>
      <DialogDescription>{p.category}{p.is_demo ? " · Konsep desain, bukan proyek klien" : ""}</DialogDescription>
      <img src={images[slide]} alt={p.image_alt || p.title} width={1024} height={1024} className="mx-auto max-h-[55dvh] w-full object-contain" />
      {images.length > 1 && <div className="flex items-center justify-center gap-4"><Button variant="outline" size="icon" aria-label="Gambar sebelumnya" onClick={() => setSlide((slide + images.length - 1) % images.length)}><ChevronLeft /></Button><span className="text-sm text-muted-foreground">{slide + 1} / {images.length}</span><Button variant="outline" size="icon" aria-label="Gambar berikutnya" onClick={() => setSlide((slide + 1) % images.length)}><ChevronRight /></Button></div>}
      <p className="text-sm leading-7 text-muted-foreground">{p.description}</p>
      {validProjectUrl(p.url) && <Button asChild variant="outline"><a href={p.url} target="_blank" rel="noopener noreferrer">Kunjungi website <ArrowUpRight className="size-4" /></a></Button>}
    </DialogContent></Dialog>
  </>;
}