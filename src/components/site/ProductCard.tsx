import { Link } from "@tanstack/react-router";
import { Star } from "lucide-react";
import { rupiah } from "@/lib/format";

export type CardProduct = {
  slug: string;
  title: string;
  cover_image: string | null;
  price: number;
  is_featured: boolean;
  short_description?: string | null;
  sellers?: { name: string; slug: string } | null;
  categories?: { name: string; slug: string } | null;
};

export function ProductCard({ p }: { p: CardProduct }) {
  return (
    <Link
      to="/p/$slug"
      params={{ slug: p.slug }}
      className="group flex flex-col overflow-hidden rounded-2xl border bg-card shadow-card transition hover:-translate-y-1 hover:border-primary/40"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-muted">
        {p.cover_image && (
          <img src={p.cover_image} alt={p.title} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
        )}
        {p.is_featured && (
          <span className="absolute left-3 top-3 rounded-full bg-coral px-2.5 py-1 text-[11px] font-bold tracking-wide text-primary-foreground">HOT</span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        {p.categories && <span className="text-xs font-semibold text-sky">{p.categories.name}</span>}
        <h3 className="line-clamp-2 font-bold leading-snug text-navy group-hover:text-primary-strong">{p.title}</h3>
        {p.sellers && <p className="text-xs text-muted-foreground">oleh {p.sellers.name}</p>}
        <div className="mt-auto flex items-end justify-between pt-2">
          <div>
            <p className="text-[11px] text-muted-foreground">Mulai dari</p>
            <p className="font-extrabold text-primary-strong">{rupiah(p.price)}</p>
          </div>
          <span className="flex items-center gap-1 text-xs font-semibold text-navy">
            <Star className="h-3.5 w-3.5 fill-primary text-primary" /> 4.9
          </span>
        </div>
      </div>
    </Link>
  );
}
