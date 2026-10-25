import { createFileRoute } from "@tanstack/react-router";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowUpRight, RotateCcw, Send, ShieldCheck } from "lucide-react";
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

const WELCOME = `Halo! 👋 Saya Annisa AI, asisten Dimaloka.

Saya bisa bantu kamu seputar:

🚀 SEO & optimasi digital marketing

📈 Iklan Google Ads & Meta Ads

🛠 Produk & layanan Dimaloka

Mau tanya apa hari ini?`;

const SUGGESTIONS = [
  "Layanan apa saja yang tersedia?",
  "Berapa harga jasa SEO?",
  "Cara order bagaimana?",
  "Tips SEO untuk website baru",
];

const QUESTION_QUOTA = 5;
const QUOTA_KEY = "annisa-quota-used";

function readUsedQuota() {
  if (typeof window === "undefined") return 0;
  const n = Number(window.sessionStorage.getItem(QUOTA_KEY));
  return Number.isFinite(n) && n > 0 ? Math.min(n, QUESTION_QUOTA) : 0;
}

function AnnisaPage() {
  const [input, setInput] = useState("");
  const [notice, setNotice] = useState("");
  const [blocked, setBlocked] = useState(false);
  const [used, setUsed] = useState(readUsedQuota);
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
  const remaining = Math.max(0, QUESTION_QUOTA - used);
  const quotaHabis = remaining <= 0;
  useEffect(() => {
    if (!busy && !blocked && !quotaHabis) textarea.current?.focus();
  }, [busy, blocked, quotaHabis]);
  const send = async (text: string) => {
    if (busy || blocked) return;
    if (quotaHabis) {
      setNotice("Batas 5 pertanyaan per sesi sudah tercapai. Mulai ulang percakapan untuk bertanya lagi.");
      return;
    }
    const parsed = annisaTextSchema.safeParse(text);
    if (!parsed.success) {
      setNotice("Tulis pertanyaan terlebih dahulu, maksimal 2000 karakter.");
      textarea.current?.focus();
      return;
    }
    setNotice("");
    clearError();
    setInput("");
    const next = used + 1;
    setUsed(next);
    try {
      window.sessionStorage.setItem(QUOTA_KEY, String(next));
    } catch {
      /* sesi tanpa storage tetap dibatasi oleh state */
    }
    void sendMessage({ text: parsed.data.trim() });
    textarea.current?.focus();
  };
  const reset = () => {
    setMessages([]);
    clearError();
    setNotice("");
    setInput("");
    setUsed(0);
    try {
      window.sessionStorage.removeItem(QUOTA_KEY);
    } catch {
      /* abaikan */
    }
    textarea.current?.focus();
  };

  return (
    <section className="relative flex h-[calc(100dvh-4rem)] flex-col items-center justify-center gap-4 overflow-hidden px-4 py-5 sm:px-6">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_75%_65%_at_15%_0%,var(--accent),transparent_60%),radial-gradient(ellipse_75%_65%_at_90%_100%,var(--secondary),transparent_65%)]"
      />
      <div className="shrink-0 text-center">
        <img
          src={annisa}
          width={56}
          height={56}
          alt="Annisa AI"
          className="hero-float mx-auto mb-2 size-12 rounded-full object-contain sm:size-14"
        />
        <h1 className="text-2xl font-extrabold tracking-tight text-navy sm:text-3xl">
          Dimaloka AI Assistant
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Tanya apa saja seputar SEO, digital marketing, dan layanan Dimaloka.
        </p>
      </div>

      <div className="flex min-h-0 w-full max-w-3xl flex-1 flex-col overflow-hidden rounded-3xl border bg-card shadow-card">
        <header className="flex shrink-0 items-center justify-between gap-3 border-b bg-muted/40 px-4 py-3 sm:px-5">
          <div className="flex min-w-0 items-center gap-3">
            <div className="relative shrink-0">
              <img src={annisa} width={40} height={40} alt="" className="size-10 rounded-full object-contain" />
              <span className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-card bg-success" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-navy">Annisa AI</p>
              <p className="text-xs text-muted-foreground">
                AI Assistant Dimaloka · Sisa {remaining} dari {QUESTION_QUOTA} pertanyaan
              </p>
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

        <Conversation className="min-h-0 flex-1">
          <ConversationContent className="gap-6 px-4 py-5 sm:px-6">
            <Message from="assistant" className="max-w-full">
              <div className="flex items-start gap-3">
                <img
                  src={annisa}
                  width={32}
                  height={32}
                  alt=""
                  className="mt-0.5 size-8 shrink-0 rounded-full object-contain"
                />
                <MessageContent className="flex-1 rounded-2xl rounded-tl-md bg-muted/60 px-4 py-3 leading-7">
                  <MessageResponse skipHtml>{WELCOME}</MessageResponse>
                </MessageContent>
              </div>
            </Message>
            {messages.length === 0 && !quotaHabis && (
              <div className="flex flex-wrap gap-2 pl-11">
                {SUGGESTIONS.map((q) => (
                  <button
                    key={q}
                    type="button"
                    disabled={busy || blocked}
                    onClick={() => send(q)}
                    className="group flex items-center gap-2 rounded-full border bg-card px-3.5 py-2 text-xs font-medium text-navy shadow-card transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:text-primary-strong disabled:opacity-50"
                  >
                    {q}
                    <ArrowUpRight className="size-3 text-muted-foreground transition-colors group-hover:text-primary" />
                  </button>
                ))}
              </div>
            )}
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

        <div className="shrink-0 border-t bg-card px-3 pb-3 pt-2 sm:px-4">
          {notice && (
            <p role="alert" className="mb-2 px-1 text-sm text-destructive">
              {notice}
            </p>
          )}
          {quotaHabis && !notice && (
            <p className="mb-2 px-1 text-sm text-muted-foreground">
              Batas 5 pertanyaan per sesi tercapai. Tekan tombol mulai ulang di atas untuk sesi baru.
            </p>
          )}
          <PromptInput
            onSubmit={({ text }) => send(text)}
            className="rounded-full border bg-background transition-shadow focus-within:shadow-cta"
          >
            <PromptInputTextarea
              ref={textarea}
              autoFocus
              aria-label="Pertanyaan untuk Annisa"
              placeholder={
                blocked
                  ? "Akses chat dinonaktifkan sementara"
                  : quotaHabis
                    ? "Batas pertanyaan sesi ini sudah habis"
                    : "Tanya Annisa apa saja…"
              }
              value={input}
              onChange={(e) => setInput(e.target.value)}
              maxLength={ANNISA_INPUT_LIMIT}
              disabled={blocked || quotaHabis}
              className="min-h-11 px-5 pt-2.5 text-sm sm:text-base"
            />
            <PromptInputFooter className="px-2.5 pb-2.5">
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
                disabled={blocked || quotaHabis || (!busy && !input.trim())}
                className="size-10 rounded-full shadow-cta"
              >
                <Send className="size-4" />
              </PromptInputSubmit>
            </PromptInputFooter>
          </PromptInput>
        </div>
      </div>

      <p className="flex shrink-0 items-center justify-center gap-2 text-center text-xs text-muted-foreground">
        <ShieldCheck className="size-3.5 shrink-0" />
        Jawaban AI dapat keliru. Pastikan harga di halaman layanan.
      </p>
    </section>
  );
}
