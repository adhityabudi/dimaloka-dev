import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Bold, Heading2, Heading3, ImagePlus, Italic, Link2, List, ListOrdered, Loader2, Quote, Upload, X } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { DESC_MAX, DESC_MIN, TITLE_MAX } from "@/lib/seo";

export async function uploadMedia(file: File) {
  const path = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, "_")}`;
  const { error } = await supabase.storage.from("media").upload(path, file, { upsert: false });
  if (error) throw error;
  const { data, error: e2 } = await supabase.storage.from("media").createSignedUrl(path, 60 * 60 * 24 * 365 * 10);
  if (e2) throw e2;
  return data.signedUrl;
}

export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-semibold text-navy">{label}</Label>
      {children}
      {hint && <div className="text-xs text-muted-foreground">{hint}</div>}
    </div>
  );
}

export function ImageInput({ value, onChange }: { value?: string | null; onChange: (v: string) => void }) {
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  return (
    <div className="flex items-center gap-3">
      {value ? <img src={value} alt="" className="h-16 w-24 rounded-lg border object-cover" /> : <div className="h-16 w-24 rounded-lg border border-dashed bg-muted" />}
      <div className="flex-1 space-y-2">
        <Input placeholder="https://… atau unggah" value={value ?? ""} onChange={(e) => onChange(e.target.value)} />
        <Button type="button" size="sm" variant="outline" disabled={busy} onClick={() => ref.current?.click()}>
          {busy ? <Loader2 className="animate-spin" /> : <Upload />} Unggah
        </Button>
        <input ref={ref} type="file" accept="image/*" hidden onChange={async (e) => {
          const f = e.target.files?.[0];
          if (!f) return;
          setBusy(true);
          try { onChange(await uploadMedia(f)); } catch (err: any) { toast.error(err.message); } finally { setBusy(false); e.target.value = ""; }
        }} />
      </div>
    </div>
  );
}

export function GalleryInput({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  return (
    <div className="flex flex-wrap gap-3">
      {value.map((g, i) => (
        <div key={i} className="relative">
          <img src={g} alt="" className="h-20 w-28 rounded-lg border object-cover" />
          <button type="button" onClick={() => onChange(value.filter((_, j) => j !== i))} className="absolute -right-2 -top-2 rounded-full bg-destructive p-1 text-destructive-foreground" aria-label="Hapus"><X className="h-3 w-3" /></button>
        </div>
      ))}
      <button type="button" onClick={() => ref.current?.click()} className="flex h-20 w-28 items-center justify-center rounded-lg border-2 border-dashed text-muted-foreground hover:border-primary">
        {busy ? <Loader2 className="animate-spin" /> : <ImagePlus />}
      </button>
      <input ref={ref} type="file" accept="image/*" multiple hidden onChange={async (e) => {
        const files = Array.from(e.target.files ?? []);
        setBusy(true);
        try { const urls = await Promise.all(files.map(uploadMedia)); onChange([...value, ...urls]); } catch (err: any) { toast.error(err.message); } finally { setBusy(false); e.target.value = ""; }
      }} />
    </div>
  );
}

export function TagInput({ value, onChange, placeholder = "Ketik lalu Enter" }: { value: string[]; onChange: (v: string[]) => void; placeholder?: string }) {
  const [t, setT] = useState("");
  const add = () => {
    const v = t.trim().replace(/,$/, "");
    if (v && !value.includes(v)) onChange([...value, v]);
    setT("");
  };
  return (
    <div className="flex min-h-10 flex-wrap items-center gap-1.5 rounded-md border bg-background px-2 py-1.5">
      {value.map((k) => (
        <span key={k} className="flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-xs font-semibold text-secondary-foreground">
          {k}<button type="button" onClick={() => onChange(value.filter((x) => x !== k))} aria-label={`Hapus ${k}`}><X className="h-3 w-3" /></button>
        </span>
      ))}
      <input value={t} onChange={(e) => setT(e.target.value)} onBlur={add} onKeyDown={(e) => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); add(); } }} placeholder={placeholder} className="min-w-[120px] flex-1 bg-transparent text-sm outline-none" />
    </div>
  );
}

export function ListInput({ value, onChange, placeholder }: { value: string[]; onChange: (v: string[]) => void; placeholder?: string }) {
  return (
    <Textarea rows={4} placeholder={placeholder ?? "Satu item per baris"} value={value.join("\n")} onChange={(e) => onChange(e.target.value.split("\n"))} onBlur={() => onChange(value.map((s) => s.trim()).filter(Boolean))} />
  );
}

function Counter({ n, min, max }: { n: number; min?: number; max: number }) {
  const ok = n > 0 && n <= max && (min ? n >= min : true);
  return <span className={ok ? "font-semibold text-success" : "font-semibold text-destructive"}>{n}{min ? ` / ${min}–${max}` : ` / ${max}`} karakter</span>;
}

export function SeoFields({ v, set, slugPath, keywordMode = "keywords" }: {
  v: { seo_title?: string | null; seo_description?: string | null; keywords?: string[]; focus_keyword?: string | null };
  set: (patch: any) => void;
  slugPath: string;
  keywordMode?: "keywords" | "both";
}) {
  const title = v.seo_title ?? "";
  const desc = v.seo_description ?? "";
  return (
    <div className="space-y-4 rounded-2xl border border-primary/30 bg-accent/40 p-5">
      <h3 className="font-extrabold text-navy">SEO (wajib sebelum publish)</h3>
      <Field label="Meta title" hint={<Counter n={title.length} max={TITLE_MAX} />}><Input value={title} onChange={(e) => set({ seo_title: e.target.value })} /></Field>
      <Field label="Meta description" hint={<Counter n={desc.length} min={DESC_MIN} max={DESC_MAX} />}><Textarea rows={3} value={desc} onChange={(e) => set({ seo_description: e.target.value })} /></Field>
      {keywordMode === "both" && <Field label="Focus keyword"><Input value={v.focus_keyword ?? ""} onChange={(e) => set({ focus_keyword: e.target.value })} /></Field>}
      <Field label="Keywords"><TagInput value={v.keywords ?? []} onChange={(k) => set({ keywords: k })} /></Field>
      <div>
        <p className="mb-1 text-xs font-bold uppercase text-muted-foreground">Preview Google</p>
        <div className="rounded-xl bg-background p-4 shadow-card">
          <p className="truncate text-xs text-success">dimaloka.com{slugPath}</p>
          <p className="truncate text-lg text-sky">{title || "Judul halaman"}</p>
          <p className="line-clamp-2 text-sm text-muted-foreground">{desc || "Deskripsi halaman akan tampil di sini."}</p>
        </div>
      </div>
    </div>
  );
}

export function RichEditor({ value, onChange }: { value: string; onChange: (html: string) => void }) {
  const editor = useEditor({
    extensions: [StarterKit.configure({ heading: { levels: [2, 3] } })],
    content: value,
    immediatelyRender: false,
    editorProps: { attributes: { class: "prose-content min-h-[240px] px-4 py-3 outline-none" } },
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });
  useEffect(() => {
    if (editor && value !== editor.getHTML() && !editor.isFocused) editor.commands.setContent(value || "");
  }, [value, editor]);
  if (!editor) return <div className="min-h-[280px] rounded-md border" />;
  const B = ({ on, active, children, label }: { on: () => void; active?: boolean; children: ReactNode; label: string }) => (
    <button type="button" aria-label={label} onClick={on} className={`rounded p-1.5 hover:bg-muted ${active ? "bg-secondary text-navy-2" : ""}`}>{children}</button>
  );
  return (
    <div className="rounded-md border bg-background">
      <div className="flex flex-wrap gap-1 border-b p-1.5">
        <B label="H2" on={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive("heading", { level: 2 })}><Heading2 className="h-4 w-4" /></B>
        <B label="H3" on={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive("heading", { level: 3 })}><Heading3 className="h-4 w-4" /></B>
        <B label="Bold" on={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")}><Bold className="h-4 w-4" /></B>
        <B label="Italic" on={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")}><Italic className="h-4 w-4" /></B>
        <B label="Bullet" on={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")}><List className="h-4 w-4" /></B>
        <B label="Numbered" on={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")}><ListOrdered className="h-4 w-4" /></B>
        <B label="Quote" on={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")}><Quote className="h-4 w-4" /></B>
        <B label="Link" on={() => { const url = prompt("URL link (mis. /kategori/website)"); if (url) editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run(); }} active={editor.isActive("link")}><Link2 className="h-4 w-4" /></B>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}

export function PageHeader({ title, desc, action }: { title: string; desc?: string; action?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div><h1 className="text-2xl font-extrabold text-navy">{title}</h1>{desc && <p className="text-sm text-muted-foreground">{desc}</p>}</div>
      {action}
    </div>
  );
}
