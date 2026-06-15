import { useState, useRef, useEffect, useCallback } from "react";
import { Shell } from "@/components/layout/Shell";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Send,
  Sparkles,
  RotateCcw,
  BookOpen,
  Brain,
  Lightbulb,
  GraduationCap,
  ChevronDown,
  Copy,
  Check,
  Zap,
  Target,
  FlaskConical,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface Message {
  role: "user" | "assistant";
  content: string;
  id: string;
  timestamp: Date;
}

const SUGGESTED_PROMPTS = [
  {
    icon: BookOpen,
    label: "Literature",
    color: "from-violet-500/20 to-purple-500/10 border-violet-500/20 hover:border-violet-400/40",
    iconColor: "text-violet-400",
    text: "Explain the concept of dramatic irony in Literature-in-English with JUPEB examples.",
  },
  {
    icon: Brain,
    label: "Government",
    color: "from-blue-500/20 to-cyan-500/10 border-blue-500/20 hover:border-blue-400/40",
    iconColor: "text-blue-400",
    text: "What are the functions of the Nigerian National Assembly under the 1999 Constitution?",
  },
  {
    icon: GraduationCap,
    label: "CRS",
    color: "from-emerald-500/20 to-teal-500/10 border-emerald-500/20 hover:border-emerald-400/40",
    iconColor: "text-emerald-400",
    text: "Explain the significance of the Sermon on the Mount in Christian Religious Studies.",
  },
  {
    icon: Lightbulb,
    label: "Exam Strategy",
    color: "from-amber-500/20 to-orange-500/10 border-amber-500/20 hover:border-amber-400/40",
    iconColor: "text-amber-400",
    text: "Give me the best strategy to score A in JUPEB Literature-in-English Paper 002.",
  },
  {
    icon: Target,
    label: "Score 16 Points",
    color: "from-rose-500/20 to-pink-500/10 border-rose-500/20 hover:border-rose-400/40",
    iconColor: "text-rose-400",
    text: "What subjects and grades do I need to score exactly 16 JUPEB points for UNILAG direct entry?",
  },
  {
    icon: FlaskConical,
    label: "Past Questions",
    color: "from-indigo-500/20 to-blue-500/10 border-indigo-500/20 hover:border-indigo-400/40",
    iconColor: "text-indigo-400",
    text: "Give me 3 likely JUPEB Government essay questions and how to answer them.",
  },
];

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5 px-5 py-4">
      {[0, 1, 2].map(i => (
        <motion.div
          key={i}
          animate={{ y: [0, -5, 0], opacity: [0.4, 1, 0.4] }}
          transition={{ repeat: Infinity, duration: 0.9, delay: i * 0.18, ease: "easeInOut" }}
          className="w-2 h-2 rounded-full bg-amber-400"
        />
      ))}
    </div>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
      }}
      className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-white/10 text-white/30 hover:text-white/60"
    >
      {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
    </button>
  );
}

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";
  const timeStr = message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      className={cn("flex gap-3 group", isUser ? "flex-row-reverse" : "flex-row")}
    >
      {/* Avatar */}
      <div className={cn(
        "w-8 h-8 rounded-2xl flex items-center justify-center flex-shrink-0 mt-1 shadow-lg",
        isUser
          ? "bg-gradient-to-br from-violet-500 to-indigo-600"
          : "bg-gradient-to-br from-amber-400 to-orange-500"
      )}>
        {isUser
          ? <span className="text-[11px] font-bold text-white">You</span>
          : <Sparkles className="h-4 w-4 text-white" />
        }
      </div>

      <div className={cn("flex flex-col gap-1 max-w-[78%]", isUser && "items-end")}>
        {/* Bubble */}
        <div className={cn(
          "rounded-2xl px-4 py-3 text-sm leading-relaxed relative",
          isUser
            ? "bg-gradient-to-br from-violet-600 to-indigo-600 text-white rounded-tr-sm shadow-lg shadow-violet-500/20"
            : "bg-white/5 border border-white/8 text-white/90 rounded-tl-sm"
        )}>
          {isUser ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
          ) : (
            <div
              className="prose prose-sm prose-invert max-w-none
                prose-headings:text-amber-300 prose-headings:font-bold prose-headings:mt-4 prose-headings:mb-1
                prose-p:text-white/85 prose-p:leading-relaxed prose-p:my-1.5
                prose-strong:text-white prose-strong:font-semibold
                prose-ul:my-2 prose-li:text-white/85 prose-li:my-0.5
                prose-ol:my-2 prose-code:text-amber-300 prose-code:bg-white/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:text-xs
                prose-blockquote:border-amber-400/50 prose-blockquote:text-white/70 prose-blockquote:bg-white/3 prose-blockquote:rounded-r-lg"
              dangerouslySetInnerHTML={{ __html: formatMarkdown(message.content) }}
            />
          )}
        </div>

        {/* Footer: time + copy */}
        <div className={cn("flex items-center gap-1.5", isUser ? "flex-row-reverse" : "flex-row")}>
          <span className="text-[10px] text-white/25 px-1">{timeStr}</span>
          {!isUser && message.content && <CopyButton text={message.content} />}
        </div>
      </div>
    </motion.div>
  );
}

function formatMarkdown(text: string): string {
  return text
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/```[\s\S]*?```/g, m => `<code class="block my-3 p-4 bg-white/8 rounded-xl text-xs overflow-x-auto leading-relaxed">${m.slice(3, -3)}</code>`)
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>")
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    .replace(/^# (.+)$/gm, "<h1>$1</h1>")
    .replace(/^[-*] (.+)$/gm, "<li>$1</li>")
    .replace(/(<li>.*<\/li>(\n|$))+/g, m => `<ul class="list-disc pl-4 space-y-1">${m}</ul>`)
    .replace(/^\d+\. (.+)$/gm, "<li>$1</li>")
    .replace(/^> (.+)$/gm, "<blockquote class='pl-3 py-1'>$1</blockquote>")
    .replace(/\n\n/g, "</p><p>")
    .replace(/\n/g, "<br/>")
    .replace(/^(?!<[hup]|<li|<bl|<co|<ul)(.+)$/gm, "<p>$1</p>")
    .replace(/<p><\/p>/g, "");
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [showScroll, setShowScroll] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

  const scrollToBottom = useCallback((smooth = true) => {
    bottomRef.current?.scrollIntoView({ behavior: smooth ? "smooth" : "auto" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isStreaming]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const handler = () => setShowScroll(el.scrollHeight - el.scrollTop - el.clientHeight > 120);
    el.addEventListener("scroll", handler);
    return () => el.removeEventListener("scroll", handler);
  }, []);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isStreaming) return;

    const userMsg: Message = { role: "user", content: text.trim(), id: Date.now().toString(), timestamp: new Date() };
    const history = messages.map(m => ({ role: m.role, content: m.content }));

    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsStreaming(true);

    const assistantId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, { role: "assistant", content: "", id: assistantId, timestamp: new Date() }]);

    try {
      const response = await fetch(`${BASE}/api/ai/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text.trim(), history }),
      });

      if (!response.ok) throw new Error("Request failed");

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const data = JSON.parse(line.slice(6));
            if (data.done) break;
            if (data.error) throw new Error(data.error);
            if (data.content) {
              setMessages(prev => prev.map(m =>
                m.id === assistantId ? { ...m, content: m.content + data.content } : m
              ));
            }
          } catch {}
        }
      }
    } catch {
      setMessages(prev => prev.map(m =>
        m.id === assistantId
          ? { ...m, content: "Sorry, I ran into an issue. Please try again! 🙏" }
          : m
      ));
    } finally {
      setIsStreaming(false);
      inputRef.current?.focus();
    }
  }, [messages, isStreaming, BASE]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(input); }
  };

  const isEmpty = messages.length === 0;

  return (
    <Shell>
      <div className="flex flex-col h-screen md:h-[calc(100vh)] max-h-screen">

        {/* Header */}
        <div className="flex items-center justify-between px-5 md:px-6 py-3.5 border-b border-white/5 bg-[#0f0f13]/80 backdrop-blur-md flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/25">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-[#0f0f13] animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-white text-base leading-tight">LexBot</h1>
                <span className="px-1.5 py-0.5 rounded-md bg-amber-400/15 border border-amber-400/25 text-[9px] font-bold text-amber-400 uppercase tracking-wider">AI</span>
              </div>
              <p className="text-[11px] text-white/40 leading-tight">JUPEB Study Assistant · Always ready</p>
            </div>
          </div>
          {messages.length > 0 && (
            <button
              onClick={() => setMessages([])}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs text-white/40 hover:text-white/70 hover:bg-white/5 transition-all"
            >
              <RotateCcw className="h-3.5 w-3.5" /> New chat
            </button>
          )}
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 md:px-6 py-6 space-y-5 relative scroll-smooth">
          <AnimatePresence mode="wait">
            {isEmpty ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center justify-center min-h-[65vh] text-center px-4"
              >
                {/* Animated LexBot avatar */}
                <motion.div
                  animate={{ y: [0, -6, 0] }}
                  transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut" }}
                  className="relative mb-6"
                >
                  <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-2xl shadow-amber-500/30">
                    <Sparkles className="h-11 w-11 text-white" />
                  </div>
                  <motion.div
                    animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.15, 0.4] }}
                    transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
                    className="absolute inset-0 rounded-3xl bg-amber-400/30 -z-10"
                  />
                  <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-emerald-400 border-2 border-[#0f0f13] flex items-center justify-center">
                    <Zap className="h-2.5 w-2.5 text-white" />
                  </div>
                </motion.div>

                <h2 className="text-2xl md:text-3xl font-bold text-white mb-2 font-serif">Hey, I'm LexBot! 👋</h2>
                <p className="text-white/45 max-w-md text-sm leading-relaxed mb-10">
                  Your personal JUPEB study assistant. I know Literature, Government, CRS inside out — ask me anything, from topic explanations to exam strategy. Let's get you to <span className="text-amber-400 font-semibold">16 points</span>.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 w-full max-w-2xl">
                  {SUGGESTED_PROMPTS.map((prompt, i) => (
                    <motion.button
                      key={i}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 + i * 0.07 }}
                      onClick={() => sendMessage(prompt.text)}
                      className={cn(
                        "flex items-center gap-3 p-3.5 rounded-2xl bg-gradient-to-br border text-left transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] group",
                        prompt.color
                      )}
                    >
                      <div className="w-8 h-8 rounded-xl bg-white/8 flex items-center justify-center flex-shrink-0 group-hover:bg-white/12 transition-colors">
                        <prompt.icon className={cn("h-4 w-4", prompt.iconColor)} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-white/80 mb-0.5">{prompt.label}</p>
                        <p className="text-[10px] text-white/40 leading-snug line-clamp-2">{prompt.text}</p>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="messages"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-5"
              >
                {messages.map(msg =>
                  msg.content || msg.role === "assistant"
                    ? <MessageBubble key={msg.id} message={msg} />
                    : null
                )}
                {isStreaming && messages[messages.length - 1]?.content === "" && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-amber-500/20">
                      <Sparkles className="h-4 w-4 text-white" />
                    </div>
                    <div className="bg-white/5 border border-white/8 rounded-2xl rounded-tl-sm">
                      <TypingIndicator />
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={bottomRef} />
        </div>

        {/* Scroll to bottom */}
        <AnimatePresence>
          {showScroll && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={() => scrollToBottom()}
              className="absolute bottom-28 right-6 w-9 h-9 rounded-full bg-violet-600 text-white flex items-center justify-center shadow-lg shadow-violet-500/30 hover:bg-violet-500 transition-colors z-10"
            >
              <ChevronDown className="h-4 w-4" />
            </motion.button>
          )}
        </AnimatePresence>

        {/* Input area */}
        <div className="px-4 md:px-6 py-4 border-t border-white/5 bg-[#0f0f13]/80 backdrop-blur-md flex-shrink-0">
          <div className="max-w-3xl mx-auto">
            <div className={cn(
              "flex items-end gap-3 bg-white/4 border rounded-2xl px-4 py-3 transition-all duration-200",
              isStreaming ? "border-amber-500/20 bg-amber-500/3" : "border-white/10 focus-within:border-violet-500/50 focus-within:bg-white/6"
            )}>
              <Textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={isStreaming ? "LexBot is thinking…" : "Ask me anything about JUPEB… (Enter to send)"}
                className="flex-1 resize-none border-0 bg-transparent text-white/90 placeholder:text-white/25 text-sm focus-visible:ring-0 focus-visible:ring-offset-0 min-h-[40px] max-h-36 py-0 px-0"
                rows={1}
                disabled={isStreaming}
              />
              <motion.div whileTap={{ scale: 0.92 }}>
                <Button
                  onClick={() => sendMessage(input)}
                  disabled={!input.trim() || isStreaming}
                  size="sm"
                  className="bg-gradient-to-br from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-xl h-9 w-9 p-0 flex-shrink-0 disabled:opacity-30 transition-all shadow-lg shadow-violet-500/20"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </motion.div>
            </div>
            <p className="text-center text-[10px] text-white/20 mt-2 select-none">
              LexBot may occasionally make mistakes — always double-check key facts before your exam.
            </p>
          </div>
        </div>

      </div>
    </Shell>
  );
}
