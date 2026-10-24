import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { waLink } from "@/lib/format";

export function WaCta({ phone, title = "Bingung pilih layanan?", text = "Konsultasikan kebutuhan Anda gratis bersama tim Dimaloka via WhatsApp." }: { phone?: string; title?: string; text?: string }) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-navy px-8 py-12 text-navy-foreground md:px-14">
        <div className="absolute inset-0 bg-grid opacity-60" />
        <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-primary/30 blur-3xl" />
        <div className="relative flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div>
            <h2 className="text-2xl font-extrabold md:text-3xl">{title}</h2>
            <p className="mt-2 max-w-xl text-navy-foreground/75">{text}</p>
          </div>
          <Button asChild size="lg" className="h-12 rounded-xl px-6 text-base font-bold shadow-cta">
            <a href={waLink(phone, "Halo Dimaloka, saya ingin konsultasi layanan.")} target="_blank" rel="noreferrer">
              <MessageCircle /> Konsultasi via WhatsApp
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}
