import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Copy } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { InvoiceView } from "@/components/site/InvoiceView";
import { useSettings } from "@/components/admin/useSettings";

export const Route = createFileRoute("/_authenticated/admin/invoice/$id")({ component: Page });

function Page() {
  const { id } = Route.useParams();
  const { data: inv, isLoading } = useQuery({
    queryKey: ["adm-invoice", id],
    queryFn: async () => {
      const { data: invoice } = await supabase.from("invoices").select("*").eq("id", id).maybeSingle();
      if (!invoice) return null;
      const parent = invoice.parent_invoice_id ? (await supabase.from("invoices").select("invoice_number").eq("id", invoice.parent_invoice_id).maybeSingle()).data : null;
      return { ...invoice, parent_invoice_number: parent?.invoice_number };
    },
  });
  const { data: settings } = useSettings();
  const copy = async () => {
    if (!inv) return;
    if (inv.status === "draft") await supabase.from("invoices").update({ status: "sent" }).eq("id", inv.id);
    await navigator.clipboard.writeText(`${window.location.origin}/invoice/${inv.public_token}`);
    toast.success("Link invoice disalin");
  };
  return (
    <div>
      <div className="no-print mb-4 flex flex-wrap items-center justify-between gap-2">
        <Button variant="ghost" asChild><Link to="/admin/invoice"><ArrowLeft /> Kembali</Link></Button>
        <div className="flex items-center gap-3">
          <span className="rounded-md bg-primary/15 px-3 py-1 text-xs font-bold text-primary-strong">PRATINJAU</span>
          {inv && <Button onClick={copy}><Copy /> Salin link untuk klien</Button>}
        </div>
      </div>
      {isLoading || !settings ? <p className="p-8 text-center text-sm text-muted-foreground">Memuat…</p>
        : !inv ? <p className="p-8 text-center text-sm text-muted-foreground">Invoice tidak ditemukan.</p>
        : <InvoiceView invoice={inv} settings={settings} preview />}
    </div>
  );
}
