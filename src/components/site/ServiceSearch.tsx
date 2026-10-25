import { useNavigate } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ServiceSearch({ onSearch }: { onSearch?: () => void }) {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  return <form role="search" className="flex min-w-0 items-center gap-1 rounded-lg border bg-muted/50 p-1" onSubmit={event => {
    event.preventDefault();
    void navigate({ to: "/layanan", search: { q: query.trim() } });
    onSearch?.();
  }}>
    <Input type="search" aria-label="Cari layanan" placeholder="Cari layanan…" value={query} onChange={event => setQuery(event.target.value)} className="h-8 min-w-0 border-0 bg-transparent shadow-none focus-visible:ring-0" />
    <Button type="submit" variant="ghost" size="icon" className="size-8 shrink-0" aria-label="Cari"><Search className="size-4" /></Button>
  </form>;
}