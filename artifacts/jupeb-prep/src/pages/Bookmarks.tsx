import { useState, useEffect } from "react";
import { Shell } from "@/components/layout/Shell";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Bookmark, BookOpen, FileText, Loader2, XCircle, CheckCircle2, ChevronDown, ChevronUp } from "lucide-react";
import { Link } from "wouter";

const BASE = import.meta.env.VITE_API_URL || "";

function getProfile() {
  try { return JSON.parse(localStorage.getItem("jupeb_profile") || "null"); } catch { return null; }
}

const PAPER_LABELS: Record<string, string> = {
  "001": "1st In-Course", "002": "1st Semester",
  "003": "2nd In-Course", "004": "Mock Exam", "mock": "Mock",
};

interface BookmarkItem {
  id: number; itemType: "question" | "note"; itemId: string; createdAt: string;
  item: any;
}

export default function Bookmarks() {
  const [tab, setTab] = useState<"question" | "note">("question");
  const [items, setItems] = useState<BookmarkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [removing, setRemoving] = useState<number | null>(null);

  const profile = getProfile();

  async function loadBookmarks() {
    if (!profile?.phone) return;
    setLoading(true);
    const r = await fetch(`${BASE}/api/bookmarks?phone=${encodeURIComponent(profile.phone)}&type=${tab}`);
    if (r.ok) setItems(await r.json());
    setLoading(false);
  }

  useEffect(() => { loadBookmarks(); }, [tab]);

  async function removeBookmark(item: BookmarkItem) {
    if (!profile?.phone) return;
    setRemoving(item.id);
    await fetch(`${BASE}/api/bookmarks/toggle`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: profile.phone, itemType: item.itemType, itemId: item.itemId }),
    });
    setItems(prev => prev.filter(i => i.id !== item.id));
    setRemoving(null);
  }

  return (
    <Shell>
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 flex items-center justify-center">
              <Bookmark className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Bookmarks</h1>
              <p className="text-sm text-white/50">Saved questions and notes for quick review</p>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 bg-white/[0.04] p-1 rounded-xl border border-white/[0.07] w-fit">
          {(["question", "note"] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all",
                tab === t ? "bg-white/10 text-white" : "text-white/40 hover:text-white/60"
              )}
            >
              {t === "question" ? <BookOpen className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
              {t === "question" ? "Questions" : "Notes"}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-white/40" />
          </div>
        ) : items.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="text-center py-20 bg-white/[0.03] rounded-2xl border border-white/[0.06]">
            <Bookmark className="w-12 h-12 text-amber-400/30 mx-auto mb-3" />
            <p className="text-white font-semibold text-lg">No {tab}s bookmarked yet</p>
            <p className="text-white/40 text-sm mt-1">
              Hit the bookmark icon on any {tab} to save it here.
            </p>
            <Link href={tab === "question" ? "/questions" : "/notes"}>
              <button className="mt-4 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/20 text-amber-300 text-sm font-semibold rounded-xl px-5 py-2.5 transition-colors">
                Browse {tab === "question" ? "Questions" : "Notes"}
              </button>
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {items.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="bg-white/[0.04] border border-white/[0.08] rounded-2xl overflow-hidden"
              >
                {tab === "question" ? (
                  <>
                    <button
                      className="w-full text-left px-4 py-3.5 flex items-start gap-3"
                      onClick={() => setExpanded(expanded === item.id ? null : item.id)}
                    >
                      <div className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Bookmark className="w-3.5 h-3.5 text-amber-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white/90 text-sm leading-snug line-clamp-2">
                          {item.item?.questionText ?? "Question not found"}
                        </p>
                        <div className="flex items-center gap-2 mt-1.5">
                          {item.item?.subjectName && (
                            <span className="text-xs bg-violet-500/15 text-violet-300 border border-violet-500/20 rounded-md px-1.5 py-0.5">
                              {item.item.subjectName}
                            </span>
                          )}
                          {item.item?.paper && (
                            <span className="text-xs bg-white/[0.08] text-white/50 rounded-md px-1.5 py-0.5">
                              {PAPER_LABELS[item.item.paper] ?? item.item.paper}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={e => { e.stopPropagation(); removeBookmark(item); }}
                          disabled={removing === item.id}
                          className="p-1.5 rounded-lg hover:bg-red-500/20 text-white/30 hover:text-red-400 transition-colors"
                        >
                          {removing === item.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <XCircle className="w-3.5 h-3.5" />
                          )}
                        </button>
                        {expanded === item.id ? (
                          <ChevronUp className="w-4 h-4 text-white/30" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-white/30" />
                        )}
                      </div>
                    </button>
                    {expanded === item.id && item.item && (
                      <div className="px-4 pb-4 border-t border-white/[0.06] pt-3 space-y-2">
                        {Array.isArray(item.item.options) && item.item.options.map((opt: string, idx: number) => {
                          const letter = String.fromCharCode(65 + idx);
                          const isCorrect = letter === item.item.correctOption;
                          return (
                            <div key={idx} className={cn(
                              "flex items-start gap-2.5 rounded-xl px-3 py-2.5 text-sm border",
                              isCorrect
                                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                                : "bg-white/[0.03] border-white/[0.06] text-white/60"
                            )}>
                              <span className="font-bold">{letter}.</span>
                              <span>{opt}</span>
                              {isCorrect && <CheckCircle2 className="w-4 h-4 ml-auto flex-shrink-0 mt-0.5" />}
                            </div>
                          );
                        })}
                        {item.item.explanation && (
                          <div className="bg-amber-500/8 border border-amber-500/15 rounded-xl p-3 mt-2">
                            <p className="text-xs font-semibold text-amber-300 mb-1">Explanation</p>
                            <p className="text-sm text-white/70">{item.item.explanation}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="px-4 py-3.5 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-sky-500/15 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-4 h-4 text-sky-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white/90 text-sm font-medium truncate">
                        {item.item?.title ?? "Note not found"}
                      </p>
                      {item.item?.paper && (
                        <span className="text-xs text-white/40">{PAPER_LABELS[item.item.paper] ?? item.item.paper}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Link href="/notes">
                        <button className="text-xs bg-sky-500/15 hover:bg-sky-500/25 text-sky-300 border border-sky-500/20 rounded-lg px-2.5 py-1.5 transition-colors">
                          View
                        </button>
                      </Link>
                      <button
                        onClick={() => removeBookmark(item)}
                        disabled={removing === item.id}
                        className="p-1.5 rounded-lg hover:bg-red-500/20 text-white/30 hover:text-red-400 transition-colors"
                      >
                        {removing === item.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <XCircle className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </Shell>
  );
}
