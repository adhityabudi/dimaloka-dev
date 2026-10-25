import { tanggal } from "@/lib/format";

export function OrderTimeline({ updates }: { updates: { id: string; title: string; note: string | null; progress: number | null; created_at: string }[] }) {
  if (!updates.length) return <p className="text-sm text-muted-foreground">Belum ada update progres.</p>;
  return (
    <ol className="relative space-y-5 border-l-2 border-border pl-5">
      {updates.map((u) => (
        <li key={u.id} className="relative">
          <span className="absolute -left-[27px] top-1 h-3 w-3 rounded-full border-2 border-card bg-primary" />
          <p className="font-bold text-navy">{u.title}{u.progress != null && <span className="ml-2 text-xs font-semibold text-primary-strong">{u.progress}%</span>}</p>
          <p className="text-xs text-muted-foreground">{tanggal(u.created_at)}</p>
          {u.note && <p className="mt-1 whitespace-pre-line text-sm text-foreground/80">{u.note}</p>}
        </li>
      ))}
    </ol>
  );
}
