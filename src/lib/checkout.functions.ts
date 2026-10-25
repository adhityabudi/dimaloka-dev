import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { catalogVisible } from "@/lib/catalog-visibility";
import { checkoutQuote } from "@/lib/checkout";

type Input = { slug: string; packageName: string | null; stage: "full" | "dp"; buyer_name: string; buyer_wa: string; brief: string };

export const createCheckout = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: Input) => {
    if (!d || typeof d.slug !== "string") throw new Error("Data tidak valid");
    const name = String(d.buyer_name ?? "").trim().slice(0, 120);
    const wa = String(d.buyer_wa ?? "").replace(/[^\d+]/g, "").slice(0, 20);
    if (!name) throw new Error("Nama wajib diisi");
    if (wa.replace(/\D/g, "").length < 9) throw new Error("Nomor WhatsApp tidak valid");
    return { slug: d.slug, packageName: d.packageName ? String(d.packageName) : null, stage: d.stage === "dp" ? "dp" as const : "full" as const, buyer_name: name, buyer_wa: wa, brief: String(d.brief ?? "").slice(0, 3000) };
  })
  .handler(async ({ data, context }) => {
    const { userId, supabase } = context;
    const { data: product } = await supabase.from("products").select("id,title,price,packages,seller_id,status,is_active,category_id").eq("slug", data.slug).eq("status", "published").maybeSingle();
    const { data: services } = await supabase.from("categories").select("id").eq("is_active", true);
    if (!product || !catalogVisible(product, new Set((services ?? []).map(s => s.id)))) throw new Error("Layanan tidak tersedia");
    const q = checkoutQuote(product, data.packageName, data.stage);
    const { data: prof } = await supabase.from("profiles").select("email").eq("id", userId).maybeSingle();
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: order, error } = await supabaseAdmin.from("orders").insert({
      buyer_id: userId, product_id: product.id, seller_id: product.seller_id, package_name: q.packageName, amount: q.total,
      buyer_name: data.buyer_name, buyer_wa: data.buyer_wa, buyer_email: prof?.email ?? null, brief: data.brief,
      payment_stage: data.stage, status: "awaiting_payment" as any,
    }).select("id,order_number").single();
    if (error || !order) { console.error(error); throw new Error("Pesanan gagal dibuat"); }
    const { error: invErr } = await supabaseAdmin.from("invoices").insert({
      order_id: order.id, buyer_id: userId, buyer_name: data.buyer_name, buyer_wa: data.buyer_wa, buyer_email: prof?.email ?? null,
      items: q.items, amount: q.amount, contract_total: q.total, dp_amount: q.dp, payment_stage: data.stage, status: "sent",
      due_date: new Date(Date.now() + 3 * 864e5).toISOString().slice(0, 10),
    });
    if (invErr) { console.error(invErr); throw new Error("Invoice gagal dibuat"); }
    await supabaseAdmin.from("order_updates").insert({ order_id: order.id, title: "Pesanan dibuat", note: "Menunggu konfirmasi pembayaran.", created_by: userId });
    return { id: order.id, order_number: order.order_number };
  });
