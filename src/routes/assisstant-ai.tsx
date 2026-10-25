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

  return (
    <section className="relative flex min-h-[calc(100dvh-4rem)] flex-col items-center justify-center overflow-hidden px-4 py-8 sm:px-6">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_70%_60%_at_20%_0%,var(--accent),transparent_60%),radial-gradient(ellipse_70%_60%_at_85%_100%,var(--secondary),transparent_60%)]"
      />
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-extrabold tracking-tight text-navy sm:text-3xl">
          Dimaloka AI Assistant
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Tanya apa saja seputar SEO, digital marketing, dan layanan Dimaloka.
        </p>
      </div>

      <div className="flex h-[min(68dvh,680px)] min-h-[430px] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border bg-card shadow-card">
        <header className="flex items-center justify-between gap-3 border-b bg-muted/40 px-4 py-3 sm:px-5">
          <div className="flex min-w-0 items-center gap-3">
            <div className="relative shrink-0">
              <img src={annisa} width={40} height={40} alt="" className="size-10 rounded-full object-contain" />
              <span className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-card bg-success" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-navy">Annisa AI</p>
              <p className="text-xs text-muted-foreground">AI Assistant Dimaloka · Online</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            title="Mulai ulang percakapan"
            aria-label="Mulai ulang percakapan"
            disabled={busy || blocked}
            onClick={() => {
              setMessages([]);
              clearError();
              setNotice("");
              setInput("");
              textarea.current?.focus();
            }}
          >
            <RotateCcw />
          </Button>
        </header>

        <Conversation className="flex-1">
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
            {messages.length === 0 && (
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

        <div className="border-t bg-card px-3 pb-3 pt-2 sm:px-4">
          {notice && (
            <p role="alert" className="mb-2 px-1 text-sm text-destructive">
              {notice}
            </p>
          )}
          <PromptInput
            onSubmit={({ text }) => send(text)}
            className="rounded-2xl border bg-background transition-shadow focus-within:shadow-cta"
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
              className="min-h-12 px-4 pt-3 text-sm sm:text-base"
            />
            <PromptInputFooter className="px-2 pb-2">
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
                className="size-9 rounded-full shadow-cta"
              />
            </PromptInputFooter>
          </PromptInput>
        </div>
      </div>

      <p className="mt-4 flex items-center justify-center gap-2 text-center text-xs text-muted-foreground">
        <ShieldCheck className="size-3.5 shrink-0" />
        Jawaban AI dapat keliru. Pastikan harga di halaman layanan.
      </p>
    </section>
  );
}
