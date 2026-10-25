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
  ANNISA_WELCOME,
  ANNISA_INPUT_LIMIT,
  annisaTextSchema,
  safeAnnisaOutput,
} from "@/lib/annisa";
import { pageMeta } from "@/lib/site";

export const Route = createFileRoute("/assisstant-ai")({
  head: () => ({
    meta: pageMeta({
      title: "Annisa AI — Asisten SEO & Digital | Dimaloka",
      description:
        "Tanyakan strategi SEO, optimasi digital, harga layanan, dan cara order Dimaloka kepada Annisa AI.",
    }),
  }),
  component: AnnisaPage,
});

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
    <section className="mx-auto flex max-w-4xl flex-col px-4 py-7 sm:px-6 sm:py-10">
      <header className="flex items-center justify-between gap-4 border-b pb-5">
        <div className="flex min-w-0 items-center gap-3">
          <img
            src={annisa}
            width={64}
            height={64}
            alt=""
            className="size-14 shrink-0 object-contain"
          />
          <div>
            <h1 className="text-2xl font-extrabold text-navy">Annisa AI</h1>
            <p className="mt-1 text-xs font-medium text-muted-foreground">
              Dimaloka · SEO & Digital Marketing
            </p>
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
      <Conversation className="h-[min(58dvh,620px)] min-h-80">
        <ConversationContent className="gap-7 px-0 py-7">
          <Message from="assistant">
            <MessageContent>
              <MessageResponse skipHtml>{ANNISA_WELCOME}</MessageResponse>
            </MessageContent>
          </Message>
          {messages.length === 0 && (
            <div className="flex flex-col items-start gap-2 sm:flex-row sm:flex-wrap">
              {["Layanan apa saja?", "Berapa harga jasa SEO?", "Cara order bagaimana?"].map((q) => (
                <Button
                  key={q}
                  variant="outline"
                  className="max-w-full gap-3 rounded-lg text-xs"
                  disabled={busy || blocked}
                  onClick={() => send(q)}
                >
                  {q}
                  <ArrowUpRight className="size-3" />
                </Button>
              ))}
            </div>
          )}
          {messages.map((m) => (
            <Message key={m.id} from={m.role}>
              <MessageContent
                className={
                  m.role === "user"
                    ? "group-[.is-user]:bg-navy group-[.is-user]:text-navy-foreground"
                    : "leading-7"
                }
              >
                {m.parts.map((p, i) =>
                  p.type === "text" ? (
                    <MessageResponse key={i} skipHtml isAnimating={busy}>
                      {safeAnnisaOutput(p.text)}
                    </MessageResponse>
                  ) : null,
                )}
              </MessageContent>
            </Message>
          ))}
          {busy && (
            <div role="status" className="text-sm text-muted-foreground">
              <Shimmer>Annisa sedang menyiapkan jawaban…</Shimmer>
            </div>
          )}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>
      {notice && (
        <p role="alert" className="mb-3 text-sm text-destructive">
          {notice}
        </p>
      )}
      <PromptInput onSubmit={({ text }) => send(text)} className="rounded-lg bg-background">
        <PromptInputTextarea
          ref={textarea}
          autoFocus
          aria-label="Pertanyaan untuk Annisa"
          placeholder={blocked ? "Akses chat dinonaktifkan sementara" : "Tanya Annisa…"}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          maxLength={ANNISA_INPUT_LIMIT}
          disabled={blocked}
          className="min-h-20 px-4 text-base"
        />
        <PromptInputFooter>
          <span className="px-1 text-xs text-muted-foreground">
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
            className="size-9 rounded-md"
          />
        </PromptInputFooter>
      </PromptInput>
      <p className="mt-4 flex items-center justify-center gap-2 text-center text-xs text-muted-foreground">
        <ShieldCheck className="size-3.5 shrink-0" />
        Jawaban AI dapat keliru. Pastikan harga di halaman layanan.
      </p>
    </section>
  );
}
