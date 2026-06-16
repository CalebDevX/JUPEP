import { useState, useRef, useEffect, useCallback } from "react";
import { Shell } from "@/components/layout/Shell";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Send, Sparkles, RotateCcw, BookOpen, Brain, Lightbulb,
  GraduationCap, ChevronDown, Copy, Check, Zap, Target,
  FlaskConical, StopCircle, Volume2, Square, Pause, Play,
  Mic, Save,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useReadAloud } from "@/hooks/useReadAloud";
import { useQueryClient } from "@tanstack/react-query";

interface Message {
  role: "user" | "assistant";
  content: string;
  id: string;
  timestamp: Date;
}

const SUGGESTED_PROMPTS = [
  {
    icon: BookOpen,
    label: "Study Strategy",
    color: "from-violet-500/20 to-purple-500/10 border-violet-500/20 hover:border-violet-400/40",
    iconColor: "text-violet-400",
    bgColor: "bg-violet-500/10",
    text: "What's the best study strategy to score A in all my JUPEB papers this semester?",
  },
  {
    icon: Brain,
    label: "Explain a Topic",
    color: "from-blue-500/20 to-cyan-500/10 border-blue-500/20 hover:border-blue-400/40",
    iconColor: "text-blue-400",
    bgColor: "bg-blue-500/10",
    text: "Pick one of my subjects and explain its most important concept using a Nigerian real-world example.",
  },
  {
    icon: GraduationCap,
    label: "Past Questions",
    color: "from-emerald-500/20 to-teal-500/10 border-emerald-500/20 hover:border-emerald-400/40",
    iconColor: "text-emerald-400",
    bgColor: "bg-emerald-500/10",
    text: "Give me 5 likely JUPEB essay questions for Paper 002 with model answers.",
  },
  {
    icon: Lightbulb,
    label: "Mnemonics",
    color: "from-amber-500/20 to-orange-500/10 border-amber-500/20 hover:border-amber-400/40",
    iconColor: "text-amber-400",
    bgColor: "bg-amber-500/10",
    text: "Create mnemonics and memory tricks to help me remember key facts across my subjects.",
  },
  {
    icon: Target,
    label: "Exam Structure",
    color: "from-rose-500/20 to-pink-500/10 border-rose-500/20 hover:border-rose-400/40",
    iconColor: "text-rose-400",
    bgColor: "bg-rose-500/10",
    text: "Explain the JUPEB exam structure — Papers 001, 002, 003, 004 and the Final — and what to focus on in each.",
  },
  {
    icon: FlaskConical,
    label: "Quick Quiz",
    color: "from-indigo-500/20 to-blue-500/10 border-indigo-500/20 hover:border-indigo-400/40",
    iconColor: "text-indigo-400",
    bgColor: "bg-indigo-500/10",
    text: "Quiz me on 5 important topics across my JUPEB subjects right now. Give options and explain the answers.",
  },
];

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5 px-4 py-3.5">
      {[0, 1, 2].map(i => (
        <motion.div
          key={i}
          animate={{ y: [0, -4, 0], opacity: [0.35, 1, 0.35] }}
          transition={{ repeat: Infinity, duration: 0.85, delay: i * 0.16, ease: "easeInOut" }}
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
      title="Copy"
      className="opacity-0 group-hover:opacity-100 transition-all duration-150 p-1.5 rounded-lg hover:bg-white/10 text-white/30 hover:text-white/70"
    >
      {copied
        ? <Check className="h-3.5 w-3.5 text-emerald-400" />
        : <Copy className="h-3.5 w-3.5" />
      }
    </button>
  );
}

function VoiceButton({ text, msgId, activeId, onSet }: {
  text: string;
  msgId: string;
  activeId: string | null;
  onSet: (id: string | null) => void;
}) {
  const { state, speak, pause, resume, stop } = useReadAloud();
  const isThis = activeId === msgId;
  const isPlaying = isThis && state === "playing";
  const isPaused = isThis && state === "paused";
  const isLoading = isThis && state === "loading";

  const handleClick = () => {
    if (!isThis) {
      stop();
      onSet(msgId);
      speak(text, true);
    } else if (isPlaying) {
      pause();
    } else if (isPaused) {
      resume();
    } else {
      onSet(msgId);
      speak(text, true);
    }
  };

  useEffect(() => {
    if (isThis && state === "idle") onSet(null);
  }, [state, isThis]);

  return (
    <button
      onClick={handleClick}
      title="Read aloud"
      className={cn(
        "opacity-0 group-hover:opacity-100 transition-all duration-150 p-1.5 rounded-lg",
        isLoading ? "text-amber-400/60 cursor-wait" :
        isPlaying ? "text-amber-400 bg-amber-500/15" :
        isPaused ? "text-blue-400 bg-blue-500/15" :
        "hover:bg-white/10 text-white/30 hover:text-amber-400/80"
      )}
    >
      {isLoading ? (
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
          <Volume2 className="h-3.5 w-3.5" />
        </motion.div>
      ) : isPlaying ? (
        <Pause className="h-3.5 w-3.5" />
      ) : isPaused ? (
        <Play className="h-3.5 w-3.5" />
      ) : (
        <Volume2 className="h-3.5 w-3.5" />
      )}
    </button>
  );
}

function formatMarkdown(text: string): string {
  return text
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/```[\s\S]*?```/g, m =>
      `<pre class="my-3 p-4 bg-white/8 rounded-xl text-xs overflow-x-auto leading-relaxed font-mono">${m.slice(3, -3)}</pre>`
    )
    .replace(/`([^`]+)`/g, `<code class="bg-white/10 text-amber-300 px-1.5 py-0.5 rounded-md text-xs">$1</code>`)
    .replace(/\*\*([^*]+)\*\*/g, "<strong class='text-white font-semibold'>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em class='text-white/80'>$1</em>")
    .replace(/^### (.+)$/gm, "<h3 class='text-amber-300 font-bold text-sm mt-4 mb-1.5'>$1</h3>")
    .replace(/^## (.+)$/gm, "<h2 class='text-amber-300 font-bold text-base mt-5 mb-2'>$1</h2>")
    .replace(/^# (.+)$/gm, "<h1 class='text-white font-bold text-lg mt-5 mb-2'>$1</h1>")
    .replace(/^[-*] (.+)$/gm, "<li class='text-white/85 my-0.5 ml-3'>$1</li>")
    .replace(/(<li[^>]*>.*<\/li>(\n|$))+/g, m => `<ul class="list-disc pl-4 space-y-0.5 my-2">${m}</ul>`)
    .replace(/^\d+\. (.+)$/gm, "<li class='text-white/85 my-0.5 ml-3'>$1</li>")
    .replace(/^> (.+)$/gm, "<blockquote class='border-l-2 border-amber-400/50 pl-3 py-1 text-white/65 italic bg-white/3 rounded-r-lg my-2'>$1</blockquote>")
    .replace(/\n\n/g, "</p><p class='text-white/85 leading-relaxed my-1.5'>")
    .replace(/\n/g, "<br/>")
    .replace(/^(?!<[hupbl]|<li|<pre|<co|<ul)(.+)$/gm, "<p class='text-white/85 leading-relaxed my-1.5'>$1</p>")
    .replace(/<p[^>]*><\/p>/g, "");
}

function MessageBubble({
  message, isLast, activeVoiceId, onVoiceSet,
}: {
  message: Message;
  isLast: boolean;
  activeVoiceId: string | null;
  onVoiceSet: (id: string | null) => void;
}) {
  const isUser = message.role === "user";
  const timeStr = message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <motion.div
      initial={{ opacity: 0, y: 14, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={cn("flex gap-3 group", isUser ? "flex-row-reverse" : "flex-row")}
    >
      <div className="mt-0.5">
        {isUser ? <UserBubbleAvatar /> : <BotAvatar size="md" />}
      </div>

      <div className={cn("flex flex-col gap-1.5 max-w-[80%]", isUser && "items-end")}>
        <div className={cn(
          "rounded-2xl px-4 py-3 text-sm relative shadow-sm",
          isUser
            ? "bg-gradient-to-br from-violet-600 to-indigo-600 text-white rounded-tr-sm shadow-violet-500/15"
            : "bg-white/[0.06] border border-white/[0.08] text-white/90 rounded-tl-sm"
        )}>
          {isUser ? (
            <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
          ) : (
            <div
              className="text-sm"
              dangerouslySetInnerHTML={{ __html: formatMarkdown(message.content) }}
            />
          )}
          {!isUser && isLast && message.content && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="inline-block w-0.5 h-3.5 bg-amber-400 ml-0.5 align-middle animate-pulse"
            />
          )}
        </div>

        <div className={cn(
          "flex items-center gap-1 px-1",
          isUser ? "flex-row-reverse" : "flex-row"
        )}>
          <span className="text-[10px] text-white/20">{timeStr}</span>
          {!isUser && message.content && (
            <>
              <CopyButton text={message.content} />
              <VoiceButton
                text={message.content}
                msgId={message.id}
                activeId={activeVoiceId}
                onSet={onVoiceSet}
              />
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function BotAvatar({ size = "md", className }: { size?: "sm" | "md" | "lg"; className?: string }) {
  const botImage = localStorage.getItem("jupeb_bot_image");
  const sz = size === "sm" ? "w-7 h-7" : size === "lg" ? "w-[88px] h-[88px]" : "w-8 h-8";
  const iconSz = size === "lg" ? "h-10 w-10" : size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5";
  const rounded = size === "lg" ? "rounded-3xl" : "rounded-2xl";
  if (botImage) {
    return <img src={botImage} alt="LexBot" className={cn(sz, rounded, "object-cover flex-shrink-0", className)} />;
  }
  return (
    <div className={cn(
      sz, rounded, "bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-amber-500/20",
      className
    )}>
      <Sparkles className={cn(iconSz, "text-white")} />
    </div>
  );
}

function UserBubbleAvatar() {
  const pic = localStorage.getItem("jupeb_profile_picture");
  const name = localStorage.getItem("jupeb_display_name") || localStorage.getItem("user_display_name") || "You";
  const initial = name.trim().charAt(0).toUpperCase() || "Y";
  if (pic) {
    return <img src={pic} alt="You" className="w-8 h-8 rounded-2xl object-cover flex-shrink-0" />;
  }
  return (
    <div className="w-8 h-8 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
      <span className="text-[10px] font-bold text-white">{initial}</span>
    </div>
  );
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [showScroll, setShowScroll] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const [activeVoiceId, setActiveVoiceId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

  const scrollToBottom = useCallback((smooth = true) => {
    bottomRef.current?.scrollIntoView({ behavior: smooth ? "smooth" : "auto" });
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, isStreaming]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const handler = () => setShowScroll(el.scrollHeight - el.scrollTop - el.clientHeight > 120);
    el.addEventListener("scroll", handler);
    return () => el.removeEventListener("scroll", handler);
  }, []);

  const stopStreaming = useCallback(() => {
    abortRef.current?.abort();
    setIsStreaming(false);
  }, []);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isStreaming) return;

    const userMsg: Message = {
      role: "user",
      content: text.trim(),
      id: Date.now().toString(),
      timestamp: new Date(),
    };
    const history = messages.map(m => ({ role: m.role, content: m.content }));

    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setCharCount(0);
    setIsStreaming(true);

    const assistantId = (Date.now() + 1).toString();
    setMessages(prev => [
      ...prev,
      { role: "assistant", content: "", id: assistantId, timestamp: new Date() },
    ]);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const response = await fetch(`${BASE}/api/ai/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text.trim(),
          history,
          studentName: (() => { try { const p = JSON.parse(localStorage.getItem("jupeb_profile") || "null"); return p?.firstName || p?.fullName; } catch { return undefined; } })(),
          studentSubjects: (() => { try { const p = JSON.parse(localStorage.getItem("jupeb_profile") || "null"); return p?.subjects; } catch { return undefined; } })(),
        }),
        signal: controller.signal,
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
              setMessages(prev =>
                prev.map(m =>
                  m.id === assistantId
                    ? { ...m, content: m.content + data.content }
                    : m
                )
              );
            }
          } catch {}
        }
      }
    } catch (err: any) {
      if (err?.name === "AbortError") return;
      setMessages(prev =>
        prev.map(m =>
          m.id === assistantId
            ? { ...m, content: "Sorry, I ran into an issue. Please try again! 🙏" }
            : m
        )
      );
    } finally {
      setIsStreaming(false);
      abortRef.current = null;
      inputRef.current?.focus();
    }
  }, [messages, isStreaming, BASE]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    setCharCount(e.target.value.length);
  };

  const isEmpty = messages.length === 0;

  return (
    <Shell>
      <div className="flex flex-col h-screen max-h-screen bg-[#0c0c10]">

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-5 md:px-6 py-3 border-b border-white/[0.06] bg-[#0f0f14]/90 backdrop-blur-xl flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative">
              <BotAvatar size="md" className="w-10 h-10" />
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#0f0f14]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-white text-[15px] leading-tight">LexBot</h1>
                <span className="px-1.5 py-0.5 rounded-md bg-amber-400/15 border border-amber-400/20 text-[9px] font-bold text-amber-400 uppercase tracking-widest">
                  AI
                </span>
              </div>
              <p className="text-[10px] text-white/35 leading-tight mt-0.5">
                {isStreaming
                  ? <span className="text-amber-400/80 animate-pulse">Thinking…</span>
                  : "JUPEB Study Assistant · Online"
                }
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white/[0.04] border border-white/[0.06]">
              <Volume2 className="h-3 w-3 text-amber-400/60" />
              <span className="text-[10px] text-white/30">Hover AI replies to hear them</span>
            </div>
            {messages.length > 0 && (
              <button
                onClick={() => { setMessages([]); setInput(""); setActiveVoiceId(null); }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs text-white/35 hover:text-white/65 hover:bg-white/5 transition-all"
              >
                <RotateCcw className="h-3 w-3" />
                <span>New chat</span>
              </button>
            )}
          </div>
        </div>

        {/* ── Messages ── */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto px-4 md:px-6 py-6 space-y-5 relative scroll-smooth"
          style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.08) transparent" }}
        >
          <AnimatePresence mode="wait">
            {isEmpty ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="flex flex-col items-center justify-center min-h-[62vh] text-center px-4"
              >
                <motion.div
                  animate={{ y: [0, -7, 0] }}
                  transition={{ repeat: Infinity, duration: 3.8, ease: "easeInOut" }}
                  className="relative mb-7"
                >
                  <BotAvatar size="lg" />
                  <motion.div
                    animate={{ scale: [1, 1.18, 1], opacity: [0.35, 0.1, 0.35] }}
                    transition={{ repeat: Infinity, duration: 2.8, ease: "easeInOut" }}
                    className="absolute inset-0 rounded-3xl bg-amber-400/25 -z-10 blur-sm"
                  />
                  <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-emerald-400 border-2 border-[#0c0c10] flex items-center justify-center shadow-lg">
                    <Zap className="h-2.5 w-2.5 text-white" />
                  </div>
                </motion.div>

                <motion.h2
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-2xl md:text-[28px] font-bold text-white mb-2.5"
                >
                  Hey, I'm LexBot! 👋
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="text-white/40 max-w-[400px] text-sm leading-relaxed mb-9"
                >
                  Your personal JUPEB study assistant — Literature, Government & CRS all in one place. Ask me anything and let's get you to{" "}
                  <span className="text-amber-400 font-semibold">16 points</span>.
                </motion.p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 w-full max-w-[680px]">
                  {SUGGESTED_PROMPTS.map((prompt, i) => (
                    <motion.button
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.18 + i * 0.06 }}
                      whileHover={{ scale: 1.025, y: -1 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => sendMessage(prompt.text)}
                      className={cn(
                        "flex items-start gap-3 p-3.5 rounded-2xl bg-gradient-to-br border text-left transition-colors duration-200 group cursor-pointer",
                        prompt.color
                      )}
                    >
                      <div className={cn(
                        "w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors",
                        prompt.bgColor
                      )}>
                        <prompt.icon className={cn("h-4 w-4", prompt.iconColor)} />
                      </div>
                      <div className="min-w-0 text-left">
                        <p className="text-xs font-semibold text-white/75 mb-0.5 leading-tight">{prompt.label}</p>
                        <p className="text-[10px] text-white/35 leading-snug line-clamp-2">{prompt.text}</p>
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
                className="space-y-5 max-w-3xl mx-auto w-full"
              >
                {messages.map((msg, i) =>
                  msg.content || msg.role === "assistant" ? (
                    <MessageBubble
                      key={msg.id}
                      message={msg}
                      isLast={i === messages.length - 1 && isStreaming}
                      activeVoiceId={activeVoiceId}
                      onVoiceSet={setActiveVoiceId}
                    />
                  ) : null
                )}
                {isStreaming && messages[messages.length - 1]?.content === "" && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-3"
                  >
                    <BotAvatar size="md" />
                    <div className="bg-white/[0.06] border border-white/[0.08] rounded-2xl rounded-tl-sm">
                      <TypingIndicator />
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={bottomRef} />
        </div>

        {/* ── Scroll to bottom ── */}
        <AnimatePresence>
          {showScroll && (
            <motion.button
              initial={{ opacity: 0, scale: 0.75, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.75, y: 8 }}
              onClick={() => scrollToBottom()}
              className="absolute bottom-[88px] right-5 w-8 h-8 rounded-full bg-violet-600/90 backdrop-blur-sm text-white flex items-center justify-center shadow-lg hover:bg-violet-500 transition-colors z-10"
            >
              <ChevronDown className="h-4 w-4" />
            </motion.button>
          )}
        </AnimatePresence>

        {/* ── Input area ── */}
        <div className="px-4 md:px-5 py-3.5 border-t border-white/[0.06] bg-[#0f0f14]/90 backdrop-blur-xl flex-shrink-0">
          <div className="max-w-3xl mx-auto space-y-2">
            <motion.div
              animate={isStreaming ? { borderColor: "rgba(251,191,36,0.25)" } : {}}
              className={cn(
                "flex items-end gap-2.5 bg-white/[0.045] border rounded-2xl px-4 py-3 transition-all duration-200",
                isStreaming
                  ? "border-amber-500/25 bg-amber-500/[0.03]"
                  : "border-white/[0.09] focus-within:border-violet-500/45 focus-within:bg-white/[0.055]"
              )}
            >
              <Textarea
                ref={inputRef}
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder={isStreaming ? "LexBot is responding…" : "Ask me anything about JUPEB…"}
                className="flex-1 resize-none border-0 bg-transparent text-white/90 placeholder:text-white/22 text-sm focus-visible:ring-0 focus-visible:ring-offset-0 min-h-[38px] max-h-40 py-0 px-0 leading-relaxed"
                rows={1}
                disabled={isStreaming}
                maxLength={4000}
              />

              <div className="flex items-center gap-1.5 flex-shrink-0">
                {isStreaming ? (
                  <motion.div whileTap={{ scale: 0.9 }}>
                    <Button
                      onClick={stopStreaming}
                      size="sm"
                      className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/30 rounded-xl h-9 w-9 p-0 transition-all"
                    >
                      <StopCircle className="h-4 w-4" />
                    </Button>
                  </motion.div>
                ) : (
                  <motion.div whileTap={{ scale: 0.9 }}>
                    <Button
                      onClick={() => sendMessage(input)}
                      disabled={!input.trim()}
                      size="sm"
                      className="bg-gradient-to-br from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-xl h-9 w-9 p-0 flex-shrink-0 disabled:opacity-25 transition-all shadow-md shadow-violet-500/20"
                    >
                      <Send className="h-3.5 w-3.5" />
                    </Button>
                  </motion.div>
                )}
              </div>
            </motion.div>

            <div className="flex items-center justify-between px-1">
              <p className="text-[10px] text-white/18 select-none">
                Press <kbd className="px-1 py-0.5 rounded bg-white/8 text-white/30 font-mono text-[9px]">Enter</kbd> to send ·{" "}
                <kbd className="px-1 py-0.5 rounded bg-white/8 text-white/30 font-mono text-[9px]">Shift+Enter</kbd> new line ·{" "}
                <Volume2 className="h-2.5 w-2.5 inline text-amber-400/40 mx-0.5" />hover replies to listen
              </p>
              {charCount > 0 && (
                <span className={cn(
                  "text-[10px] tabular-nums transition-colors",
                  charCount > 3500 ? "text-rose-400" : charCount > 2500 ? "text-amber-400/60" : "text-white/20"
                )}>
                  {charCount}/4000
                </span>
              )}
            </div>
          </div>
        </div>

      </div>
    </Shell>
  );
}
