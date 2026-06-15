import { useState, useRef, useEffect, useCallback } from "react";
import { Shell } from "@/components/layout/Shell";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  MessageCircle,
  Send,
  Sparkles,
  User,
  RotateCcw,
  BookOpen,
  Brain,
  Lightbulb,
  GraduationCap,
  ChevronDown,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface Message {
  role: "user" | "assistant";
  content: string;
  id: string;
}

const SUGGESTED_PROMPTS = [
  { icon: BookOpen, label: "Explain a concept", text: "Explain the concept of dramatic irony in Literature-in-English with JUPEB examples." },
  { icon: Brain, label: "Government topic", text: "What are the functions of the Nigerian National Assembly under the 1999 Constitution?" },
  { icon: GraduationCap, label: "CRS question", text: "Explain the significance of the Sermon on the Mount in Christian Religious Studies." },
  { icon: Lightbulb, label: "Exam strategy", text: "Give me the best strategy to score A in JUPEB Literature-in-English Paper 002." },
];

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5 px-4 py-3">
      {[0, 1, 2].map(i => (
        <div
          key={i}
          className="typing-dot w-2 h-2 rounded-full bg-violet-400"
          style={{ animationDelay: `${i * 0.2}s` }}
        />
      ))}
    </div>
  );
}

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={cn("flex gap-3", isUser ? "flex-row-reverse" : "flex-row")}
    >
      <div className={cn(
        "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1",
        isUser
          ? "bg-gradient-to-br from-violet-500 to-indigo-600"
          : "bg-gradient-to-br from-amber-400 to-orange-500"
      )}>
        {isUser
          ? <User className="h-4 w-4 text-white" />
          : <Sparkles className="h-4 w-4 text-white" />
        }
      </div>

      <div className={cn(
        "max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
        isUser
          ? "bg-violet-600 text-white rounded-tr-sm"
          : "bg-white/5 border border-white/8 text-white/90 rounded-tl-sm"
      )}>
        {isUser ? (
          <p className="whitespace-pre-wrap">{message.content}</p>
        ) : (
          <div
            className="prose prose-sm prose-invert max-w-none
              prose-headings:text-violet-300 prose-headings:font-semibold prose-headings:mt-3 prose-headings:mb-1
              prose-p:text-white/85 prose-p:leading-relaxed prose-p:my-1
              prose-strong:text-white prose-strong:font-semibold
              prose-ul:my-1 prose-li:text-white/85 prose-li:my-0.5
              prose-ol:my-1 prose-code:text-amber-300 prose-code:bg-white/10 prose-code:px-1 prose-code:rounded
              prose-blockquote:border-violet-500 prose-blockquote:text-white/70"
            dangerouslySetInnerHTML={{
              __html: formatMarkdown(message.content)
            }}
          />
        )}
      </div>
    </motion.div>
  );
}

function formatMarkdown(text: string): string {
  return text
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/```[\s\S]*?```/g, m => `<code class="block my-2 p-3 bg-white/10 rounded-lg text-xs overflow-x-auto">${m.slice(3, -3)}</code>`)
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>")
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    .replace(/^# (.+)$/gm, "<h1>$1</h1>")
    .replace(/^[-*] (.+)$/gm, "<li>$1</li>")
    .replace(/(<li>.*<\/li>(\n|$))+/g, m => `<ul>${m}</ul>`)
    .replace(/^\d+\. (.+)$/gm, "<li>$1</li>")
    .replace(/^> (.+)$/gm, "<blockquote>$1</blockquote>")
    .replace(/\n\n/g, "</p><p>")
    .replace(/\n/g, "<br/>")
    .replace(/^(?!<[hup]|<li|<bl|<co)(.+)$/gm, "<p>$1</p>")
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

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isStreaming]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const handler = () => {
      setShowScroll(el.scrollHeight - el.scrollTop - el.clientHeight > 100);
    };
    el.addEventListener("scroll", handler);
    return () => el.removeEventListener("scroll", handler);
  }, []);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isStreaming) return;

    const userMsg: Message = { role: "user", content: text.trim(), id: Date.now().toString() };
    const history = messages.map(m => ({ role: m.role, content: m.content }));

    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsStreaming(true);

    const assistantId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, { role: "assistant", content: "", id: assistantId }]);

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
                m.id === assistantId
                  ? { ...m, content: m.content + data.content }
                  : m
              ));
            }
          } catch {}
        }
      }
    } catch (err) {
      setMessages(prev => prev.map(m =>
        m.id === assistantId
          ? { ...m, content: "Sorry, I ran into an error. Please try again! 🙏" }
          : m
      ));
    } finally {
      setIsStreaming(false);
      inputRef.current?.focus();
    }
  }, [messages, isStreaming, BASE]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const clearChat = () => {
    setMessages([]);
    setInput("");
  };

  const isEmpty = messages.length === 0;

  return (
    <Shell>
      <div className="flex flex-col h-screen md:h-[calc(100vh)] max-h-screen">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[#0f0f13]/60 backdrop-blur-sm flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg glow-amber">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-white text-base">LexBot</h1>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[11px] text-white/50">AI Study Assistant · JUPEB Specialist</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-[10px] bg-violet-500/10 text-violet-300 border-violet-500/20">
              Powered by Gemini
            </Badge>
            {messages.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearChat}
                className="text-white/40 hover:text-white/70 h-8"
              >
                <RotateCcw className="h-3.5 w-3.5 mr-1" /> New chat
              </Button>
            )}
          </div>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 md:px-6 py-6 space-y-6 relative">
          {isEmpty ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center min-h-[60vh] text-center"
            >
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-400/20 to-orange-500/10 border border-amber-400/20 flex items-center justify-center mb-6 glow-amber">
                <Sparkles className="h-9 w-9 text-amber-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2 font-serif">Meet LexBot</h2>
              <p className="text-white/50 max-w-sm text-sm leading-relaxed mb-8">
                Your AI-powered JUPEB study assistant. Ask me anything about Literature, Government, CRS — or exam strategy. I'm here to get you to 16 points.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
                {SUGGESTED_PROMPTS.map((prompt, i) => (
                  <motion.button
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                    onClick={() => sendMessage(prompt.text)}
                    className="flex items-start gap-3 p-3.5 rounded-xl bg-white/4 border border-white/8 text-left hover:bg-white/8 hover:border-white/15 transition-all group"
                  >
                    <div className="w-7 h-7 rounded-lg bg-violet-500/15 flex items-center justify-center flex-shrink-0 group-hover:bg-violet-500/25 transition-colors">
                      <prompt.icon className="h-3.5 w-3.5 text-violet-400" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-white/70 mb-0.5">{prompt.label}</p>
                      <p className="text-[11px] text-white/40 leading-relaxed line-clamp-2">{prompt.text}</p>
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          ) : (
            <>
              {messages.map(msg => (
                msg.content || msg.role === "assistant"
                  ? <MessageBubble key={msg.id} message={msg} />
                  : null
              ))}
              {isStreaming && messages[messages.length - 1]?.content === "" && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="h-4 w-4 text-white" />
                  </div>
                  <div className="bg-white/5 border border-white/8 rounded-2xl rounded-tl-sm">
                    <TypingIndicator />
                  </div>
                </div>
              )}
            </>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Scroll to bottom button */}
        <AnimatePresence>
          {showScroll && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={scrollToBottom}
              className="absolute bottom-24 right-6 w-8 h-8 rounded-full bg-violet-600 text-white flex items-center justify-center shadow-lg hover:bg-violet-500 transition-colors z-10"
            >
              <ChevronDown className="h-4 w-4" />
            </motion.button>
          )}
        </AnimatePresence>

        {/* Input area */}
        <div className="px-4 md:px-6 py-4 border-t border-white/5 bg-[#0f0f13]/60 backdrop-blur-sm flex-shrink-0">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-end gap-3 bg-white/4 border border-white/10 rounded-2xl px-4 py-3 focus-within:border-violet-500/40 focus-within:bg-white/6 transition-all">
              <Textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask LexBot anything about JUPEB… (Enter to send, Shift+Enter for new line)"
                className="flex-1 resize-none border-0 bg-transparent text-white/90 placeholder:text-white/30 text-sm focus-visible:ring-0 focus-visible:ring-offset-0 min-h-[40px] max-h-32 py-0 px-0"
                rows={1}
                disabled={isStreaming}
              />
              <Button
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || isStreaming}
                size="sm"
                className="bg-violet-600 hover:bg-violet-500 text-white rounded-xl h-9 w-9 p-0 flex-shrink-0 disabled:opacity-40 transition-all"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-center text-[10px] text-white/25 mt-2">
              LexBot can make mistakes — always verify key facts for your exams.
            </p>
          </div>
        </div>
      </div>
    </Shell>
  );
}
