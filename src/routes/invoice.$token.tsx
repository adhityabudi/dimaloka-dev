import { createFileRoute, notFound } from "@tanstack/react-router";
import { getInvoice } from "@/lib/public.functions";
import { InvoiceView } from "@/components/site/InvoiceView";

export const Route = createFileRoute("/invoice/$token")({
  loader: async ({ params }) => {
    const d = await getInvoice({ data: { token: params.token } });
    if (!d) throw notFound();
    return d;
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: loaderData ? `Invoice ${loaderData.invoice.invoice_number} | Dimaloka` : "Invoice | Dimaloka" },
      { name: "description", content: "Invoice resmi layanan Dimaloka." },
      { property: "og:title", content: "Invoice Dimaloka" },
      { property: "og:description", content: "Invoice resmi layanan Dimaloka." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: InvoicePage,
});

function InvoicePage() {
  const d = Route.useLoaderData();
  return <InvoiceView invoice={d.invoice} settings={d.settings} />;
}
