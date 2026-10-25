import { createFileRoute } from "@tanstack/react-router";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowUpRight, RotateCcw, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputFooter,
  PromptInputSubmit,
} from "@/components/ai-elements/prompt-input";
import { Shimmer } from "@/components/ai-elements/shimmer";
import annisa from "@/assets/annisa-ai.png";
import {
  ANNISA_INPUT_LIMIT,
  annisaTextSchema,
  safeAnnisaOutput,
} from "@/lib/annisa";
import { pageMeta } from "@/lib/site";

export const Route = createFileRoute("/assisstant-ai")({
  head: () => ({
    meta: pageMeta({
      title: "AI Assistant — Annisa | Dimaloka",
      description:
        "Tanyakan strategi SEO, optimasi digital, harga layanan, dan cara order Dimaloka kepada Annisa, AI Assistant Dimaloka.",
    }),
  }),
  component: AnnisaPage,
});

const SUGGESTIONS = [
  { q: "Layanan apa saja yang tersedia?", hint: "Jelajahi katalog Dimaloka" },
  { q: "Berapa harga jasa SEO?", hint: "Estimasi biaya & paket" },
  { q: "Cara order bagaimana?", hint: "Alur pemesanan & pembayaran" },
  { q: "Tips SEO untuk website baru", hint: "Strategi optimasi awal" },
];

function AnnisaPage() {
  const [input, setInput] = useState("");
  const [notice, setNotice] = useState("");
  const [blocked, setBlocked] = useState(false);
  const textarea = useRef<HTMLTextAreaElement>(null);
  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/annisa",
        fetch: async (url, init) => {
          const response = await fetch(url, init);
          if (!response.ok) {
            const data = await response.json().catch(() => ({}));
            if (response.status === 403 && String(data.error).includes("tidak aman"))
              setBlocked(true);
            throw new Error(data.error || "Annisa belum dapat dihubungi. Silakan coba kembali.");
          }
          return response;
        },
        prepareSendMessagesRequest: ({ messages, ...rest }) => ({
          body: {
            ...rest.body,
            messages: messages.map((m) => ({
              id: m.id,
              role: m.role,
              parts: [
                {
                  type: "text",
                  text: m.parts
                    .filter((p) => p.type === "text")
                    .map((p) => p.text)
                    .join("\n"),
                },
              ],
            })),
          },
        }),
      }),
    [],
  );
  const { messages, sendMessage, status, stop, setMessages, clearError } = useChat({
    transport,
    onError: (e) => setNotice(e.message),
  });
  const busy = status === "submitted" || status === "streaming";
  const empty = messages.length === 0;
  useEffect(() => {
    if (!busy && !blocked) textarea.current?.focus();
  }, [busy, blocked]);
  const send = async (text: string) => {
    if (busy || blocked) return;
    const parsed = annisaTextSchema.safeParse(text);
    if (!parsed.success) {
      setNotice("Tulis pertanyaan terlebih dahulu, maksimal 2000 karakter.");
      textarea.current?.focus();
      return;
    }
    setNotice("");
    clearError();
    setInput("");
    void sendMessage({ text: parsed.data.trim() });
    textarea.current?.focus();
  };
  const reset = () => {
    setMessages([]);
    clearError();
    setNotice("");
    setInput("");
    textarea.current?.focus();
  };

  const composer = (
    <div className="pb-4">
      {notice && (
        <p role="alert" className="mb-3 text-sm text-destructive">
          {notice}
        </p>
      )}
      <PromptInput
        onSubmit={({ text }) => send(text)}
        className="rounded-[28px] border bg-card shadow-card transition-shadow focus-within:shadow-cta"
      >
        <PromptInputTextarea
          ref={textarea}
          autoFocus
          aria-label="Pertanyaan untuk Annisa"
          placeholder={blocked ? "Akses chat dinonaktifkan sementara" : "Tanya Annisa apa saja…"}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          maxLength={ANNISA_INPUT_LIMIT}
          disabled={blocked}
          className="min-h-14 px-5 pt-4 text-base"
        />
        <PromptInputFooter className="px-3 pb-3">
          <span className="px-2 text-xs text-muted-foreground">
            {input.length} / {ANNISA_INPUT_LIMIT}
          </span>
          <PromptInputSubmit
            status={status}
            aria-label={busy ? "Hentikan jawaban" : "Kirim pesan"}
            onStop={() => {
              stop();
              setNotice("Jawaban dihentikan.");
            }}
            disabled={blocked || (!busy && !input.trim())}
            className="size-10 rounded-full shadow-cta"
          />
        </PromptInputFooter>
      </PromptInput>
      <p className="mt-3 flex items-center justify-center gap-2 text-center text-xs text-muted-foreground">
        <ShieldCheck className="size-3.5 shrink-0" />
        Jawaban AI dapat keliru. Pastikan harga di halaman layanan.
      </p>
    </div>
  );

  return (
    <section className="relative mx-auto flex min-h-[calc(100dvh-4rem)] w-full max-w-3xl flex-col px-4 sm:px-6">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-96 bg-[radial-gradient(ellipse_60%_80%_at_50%_0%,var(--accent),transparent_70%)]"
      />
      {empty ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-8 py-12 text-center">
          <div className="relative">
            <div
              aria-hidden
              className="absolute inset-0 -m-6 rounded-full bg-[radial-gradient(circle,var(--accent),transparent_70%)] blur-2xl"
            />
            <img
              src={annisa}
              width={112}
              height={112}
              alt="Annisa AI"
              className="hero-float relative size-24 rounded-full object-contain sm:size-28"
            />
          </div>
          <div className="space-y-3">
            <h1 className="text-3xl font-extrabold tracking-tight text-navy sm:text-4xl">
              Halo, saya Annisa
            </h1>
            <p className="mx-auto max-w-md text-sm leading-6 text-muted-foreground sm:text-base">
              AI Assistant Dimaloka untuk strategi SEO, digital marketing, harga
              layanan, dan panduan order. Silakan tanya apa saja.
            </p>
          </div>
          <div className="grid w-full max-w-xl grid-cols-1 gap-2.5 sm:grid-cols-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s.q}
                type="button"
                disabled={busy || blocked}
                onClick={() => send(s.q)}
                className="group flex items-center justify-between gap-3 rounded-2xl border bg-card px-4 py-3.5 text-left shadow-card transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-cta disabled:opacity-50"
              >
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-navy">{s.q}</span>
                  <span className="block text-xs text-muted-foreground">{s.hint}</span>
                </span>
                <ArrowUpRight className="size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
              </button>
            ))}
          </div>
        </div>
      ) : (
        <>
          <header className="sticky top-16 z-10 flex items-center justify-between gap-3 border-b bg-background/80 py-3 backdrop-blur">
            <div className="flex min-w-0 items-center gap-3">
              <div className="relative shrink-0">
                <img src={annisa} width={40} height={40} alt="" className="size-10 rounded-full object-contain" />
                <span className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-background bg-success" />
              </div>
              <div className="min-w-0">
                <h1 className="truncate text-sm font-bold text-navy">Annisa AI</h1>
                <p className="text-xs text-muted-foreground">AI Assistant Dimaloka · Online</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              title="Mulai ulang percakapan"
              aria-label="Mulai ulang percakapan"
              disabled={busy || blocked}
              onClick={reset}
            >
              <RotateCcw />
            </Button>
          </header>
          <Conversation className="flex-1">
            <ConversationContent className="gap-7 px-0 py-6">
              {messages.map((m) => (
                <Message key={m.id} from={m.role} className="max-w-full">
                  {m.role === "assistant" ? (
                    <div className="flex items-start gap-3">
                      <img
                        src={annisa}
                        width={32}
                        height={32}
                        alt=""
                        className="mt-0.5 size-8 shrink-0 rounded-full object-contain"
                      />
                      <MessageContent className="flex-1 leading-7">
                        {m.parts.map((p, i) =>
                          p.type === "text" ? (
                            <MessageResponse key={i} skipHtml isAnimating={busy}>
                              {safeAnnisaOutput(p.text)}
                            </MessageResponse>
                          ) : null,
                        )}
                      </MessageContent>
                    </div>
                  ) : (
                    <MessageContent className="group-[.is-user]:max-w-[85%] group-[.is-user]:rounded-3xl group-[.is-user]:rounded-br-md group-[.is-user]:bg-navy group-[.is-user]:px-5 group-[.is-user]:py-3.5 group-[.is-user]:text-navy-foreground group-[.is-user]:shadow-card">
                      {m.parts.map((p, i) =>
                        p.type === "text" ? (
                          <MessageResponse key={i} skipHtml isAnimating={busy}>
                            {safeAnnisaOutput(p.text)}
                          </MessageResponse>
                        ) : null,
                      )}
                    </MessageContent>
                  )}
                </Message>
              ))}
              {busy && (
                <div role="status" className="flex items-center gap-3 text-sm text-muted-foreground">
                  <img src={annisa} width={32} height={32} alt="" className="size-8 rounded-full object-contain" />
                  <Shimmer>Annisa sedang menyiapkan jawaban…</Shimmer>
                </div>
              )}
            </ConversationContent>
            <ConversationScrollButton />
          </Conversation>
        </>
      )}
      {composer}
    </section>
  );
}
