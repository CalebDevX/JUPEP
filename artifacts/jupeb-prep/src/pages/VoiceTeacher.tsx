import { useState, useRef } from "react";
import { Shell } from "@/components/layout/Shell";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mic, Play, Pause, Volume2, Loader2, Sparkles, RefreshCw,
  BookOpen, AlertCircle, Wand2, ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

const QUICK_TOPICS = [
  { label: "Supply & Demand", subject: "Economics" },
  { label: "The Nigerian Civil War", subject: "History" },
  { label: "Separation of Powers", subject: "Government" },
  { label: "Shakespeare's Macbeth", subject: "Literature" },
  { label: "Photosynthesis", subject: "Biology" },
  { label: "Newton's Laws", subject: "Physics" },
  { label: "Equilibrium in Chemistry", subject: "Chemistry" },
  { label: "Trigonometry Basics", subject: "Mathematics" },
  { label: "Climate & Weather", subject: "Geography" },
  { label: "Trial Balance", subject: "Accounting" },
];

const SUBJECT_COLORS: Record<string, string> = {
  Economics: "bg-amber-500/15 text-amber-300 border-amber-500/25",
  History: "bg-orange-500/15 text-orange-300 border-orange-500/25",
  Government: "bg-blue-500/15 text-blue-300 border-blue-500/25",
  Literature: "bg-violet-500/15 text-violet-300 border-violet-500/25",
  Biology: "bg-emerald-500/15 text-emerald-300 border-emerald-500/25",
  Physics: "bg-rose-500/15 text-rose-300 border-rose-500/25",
  Chemistry: "bg-red-500/15 text-red-300 border-red-500/25",
  Mathematics: "bg-sky-500/15 text-sky-300 border-sky-500/25",
  Geography: "bg-cyan-500/15 text-cyan-300 border-cyan-500/25",
  Accounting: "bg-lime-500/15 text-lime-300 border-lime-500/25",
};

const SPEAKERS = [
  { id: "idera", label: "Idera", gender: "♀" },
  { id: "jide", label: "Jide", gender: "♂" },
  { id: "tolu", label: "Tolu", gender: "♀" },
  { id: "emma", label: "Emma", gender: "♂" },
  { id: "zainab", label: "Zainab", gender: "♀" },
  { id: "joke", label: "Joke", gender: "♀" },
  { id: "adaeze", label: "Adaeze", gender: "♀" },
  { id: "umar", label: "Umar", gender: "♂" },
  { id: "chisom", label: "Chisom", gender: "♀" },
  { id: "remi", label: "Remi", gender: "♂" },
  { id: "amaka", label: "Amaka", gender: "♀" },
  { id: "kemi", label: "Kemi", gender: "♀" },
  { id: "ngozi", label: "Ngozi", gender: "♀" },
  { id: "kehinde", label: "Kehinde", gender: "♂" },
  { id: "taiwo", label: "Taiwo", gender: "♀" },
];

const LANGUAGES = [
  { id: "english", label: "English" },
  { id: "yoruba", label: "Yoruba" },
  { id: "igbo", label: "Igbo" },
  { id: "hausa", label: "Hausa" },
  { id: "pidgin", label: "Pidgin" },
];

type Phase = "idle" | "generating-text" | "generating-audio" | "ready" | "playing" | "error";

export default function VoiceTeacher() {
  const [topic, setTopic] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [lessonText, setLessonText] = useState("");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [speaker, setSpeaker] = useState("idera");
  const [language, setLanguage] = useState("english");
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const reset = () => {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current.src = ""; }
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
    setLessonText("");
    setPhase("idle");
    setError("");
    setIsPlaying(false);
    setProgress(0);
    setDuration(0);
  };

  const playAudio = (blob: Blob) => {
    const url = URL.createObjectURL(blob);
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(url);
    const audio = new Audio(url);
    audioRef.current = audio;
    audio.onloadedmetadata = () => setDuration(audio.duration);
    audio.ontimeupdate = () => setProgress(audio.currentTime);
    audio.onended = () => { setIsPlaying(false); setProgress(0); };
    audio.onpause = () => setIsPlaying(false);
    audio.onplay = () => setIsPlaying(true);
    audio.play();
    setPhase("ready");
  };

  const fetchAudio = async (text: string) => {
    setPhase("generating-audio");
    const ttsRes = await fetch(`${BASE}/api/tts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: text.slice(0, 1400), speaker, language }),
    });

    if (!ttsRes.ok) {
      const errData = await ttsRes.json().catch(() => ({})) as any;
      if (errData.code === "MODEL_LOADING") {
        setPhase("ready");
        setError("Voice model is warming up on HuggingFace — wait a moment then tap 'Speak Lesson' to retry.");
        return;
      }
      throw new Error(errData.error || "Audio generation failed.");
    }

    const blob = await ttsRes.blob();
    playAudio(blob);
  };

  const generate = async () => {
    if (!topic.trim()) return;
    reset();
    setPhase("generating-text");
    setError("");

    try {
      const aiRes = await fetch(`${BASE}/api/ai/explain`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: topic.trim(),
          context: "JUPEB exam preparation. Give a clear, concise 2-3 paragraph explanation suitable for a Nigerian student. Speak in a warm, encouraging teacher voice. Focus on key concepts and how they apply.",
        }),
      });

      if (!aiRes.ok) throw new Error("AI service failed. Please try again.");
      const aiData = await aiRes.json();
      const text: string = aiData.explanation || aiData.content || aiData.text || "";
      if (!text) throw new Error("No explanation generated.");
      setLessonText(text);
      await fetchAudio(text);
    } catch (err: any) {
      setPhase("error");
      setError(err.message || "Something went wrong. Please try again.");
    }
  };

  const speakLesson = async () => {
    if (!lessonText) return;
    setError("");
    try {
      await fetchAudio(lessonText);
    } catch (err: any) {
      setPhase("ready");
      setError(err.message || "Audio generation failed.");
    }
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) audioRef.current.pause();
    else audioRef.current.play();
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const isLoading = phase === "generating-text" || phase === "generating-audio";

  return (
    <Shell>
      <div className="p-3 md:p-6 max-w-2xl mx-auto w-full space-y-5 pb-10">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/20 flex items-center justify-center flex-shrink-0">
              <Mic className="h-5 w-5 text-green-400" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold font-serif text-white flex items-center gap-2">
                Voice AI Teacher
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-green-500/15 text-green-400 border border-green-500/25">
                  🇳🇬 Nigerian Accent
                </span>
              </h1>
              <p className="text-white/35 text-xs mt-0.5">Powered by YarnGPT — Nigerian English TTS</p>
            </div>
          </div>
        </motion.div>

        {/* Voice selector */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.03 }}
          className="glass-card p-4 space-y-3"
        >
          <p className="text-[11px] font-bold text-white/40 tracking-widest uppercase">Choose a voice</p>
          <div className="flex gap-3">
            {/* Speaker */}
            <div className="flex-1">
              <label className="text-[10px] text-white/30 mb-1.5 block">Speaker</label>
              <div className="relative">
                <select
                  value={speaker}
                  onChange={e => setSpeaker(e.target.value)}
                  disabled={isLoading}
                  className="w-full appearance-none bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-green-500/40 transition-all disabled:opacity-50 pr-8"
                >
                  {SPEAKERS.map(s => (
                    <option key={s.id} value={s.id} className="bg-zinc-900">
                      {s.gender} {s.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/30 pointer-events-none" />
              </div>
            </div>

            {/* Language */}
            <div className="flex-1">
              <label className="text-[10px] text-white/30 mb-1.5 block">Language</label>
              <div className="relative">
                <select
                  value={language}
                  onChange={e => setLanguage(e.target.value)}
                  disabled={isLoading}
                  className="w-full appearance-none bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-green-500/40 transition-all disabled:opacity-50 pr-8"
                >
                  {LANGUAGES.map(l => (
                    <option key={l.id} value={l.id} className="bg-zinc-900">
                      {l.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/30 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Speaker chips */}
          <div className="flex flex-wrap gap-1.5 pt-0.5">
            {SPEAKERS.slice(0, 8).map(s => (
              <button
                key={s.id}
                onClick={() => setSpeaker(s.id)}
                disabled={isLoading}
                className={cn(
                  "text-[11px] px-2.5 py-1 rounded-lg border font-medium transition-all disabled:opacity-30",
                  speaker === s.id
                    ? "bg-green-500/20 text-green-300 border-green-500/30"
                    : "bg-white/4 text-white/40 border-white/8 hover:border-white/20 hover:text-white/60"
                )}
              >
                {s.gender} {s.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Topic input */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.07 }}
          className="glass-card p-4 space-y-3"
        >
          <label className="text-[11px] font-bold text-white/40 tracking-widest uppercase">
            What topic should the AI teacher explain?
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. The causes of the French Revolution…"
              value={topic}
              onChange={e => setTopic(e.target.value)}
              onKeyDown={e => e.key === "Enter" && !isLoading && generate()}
              disabled={isLoading}
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-green-500/40 transition-all disabled:opacity-50"
            />
            <button
              onClick={lessonText ? speakLesson : generate}
              disabled={!topic.trim() || isLoading}
              className={cn(
                "flex items-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-95",
                lessonText
                  ? "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white shadow-lg shadow-green-500/20"
                  : "bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-lg shadow-violet-500/20"
              )}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : lessonText ? (
                <><Volume2 className="h-4 w-4" /><span className="hidden sm:inline">Speak</span></>
              ) : (
                <><Sparkles className="h-4 w-4" /><span className="hidden sm:inline">Generate</span></>
              )}
            </button>
          </div>

          <div>
            <p className="text-[10px] text-white/25 mb-2">Quick topics:</p>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_TOPICS.map(t => (
                <button
                  key={t.label}
                  onClick={() => setTopic(t.label)}
                  disabled={isLoading}
                  className={cn(
                    "text-[11px] px-2.5 py-1 rounded-lg border font-medium transition-all hover:opacity-80 active:scale-95 disabled:opacity-30",
                    SUBJECT_COLORS[t.subject] || "bg-white/5 text-white/40 border-white/8"
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Status banners */}
        <AnimatePresence>
          {phase === "generating-text" && (
            <motion.div
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="flex items-center gap-3 px-4 py-3.5 bg-violet-500/10 border border-violet-500/20 rounded-2xl"
            >
              <Wand2 className="h-4 w-4 text-violet-400 animate-pulse flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-violet-300">AI is preparing your lesson…</p>
                <p className="text-[11px] text-white/35 mt-0.5">Gemini is writing a clear explanation for you</p>
              </div>
            </motion.div>
          )}

          {phase === "generating-audio" && (
            <motion.div
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="flex items-center gap-3 px-4 py-3.5 bg-green-500/10 border border-green-500/20 rounded-2xl"
            >
              <div className="flex gap-0.5 flex-shrink-0">
                {[0, 1, 2, 3].map(i => (
                  <motion.div
                    key={i} className="w-1 bg-green-400 rounded-full"
                    animate={{ height: ["8px", "18px", "8px"] }}
                    transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
                  />
                ))}
              </div>
              <div>
                <p className="text-sm font-semibold text-green-300">
                  Generating voice — {SPEAKERS.find(s => s.id === speaker)?.label ?? speaker} ({language})…
                </p>
                <p className="text-[11px] text-white/35 mt-0.5">YarnGPT is synthesising Nigerian speech — may take ~15s</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="flex items-start gap-3 px-4 py-3.5 bg-amber-500/10 border border-amber-500/20 rounded-2xl"
            >
              <AlertCircle className="h-4 w-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-300">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Lesson + player */}
        <AnimatePresence>
          {lessonText && (
            <motion.div
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              className="glass-card overflow-hidden"
            >
              {audioUrl && (
                <div className="px-4 py-3 bg-gradient-to-r from-green-500/10 to-emerald-500/5 border-b border-green-500/15">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={togglePlay}
                      className="w-9 h-9 rounded-xl bg-green-500/20 border border-green-500/30 flex items-center justify-center hover:bg-green-500/30 transition-all active:scale-95 flex-shrink-0"
                    >
                      {isPlaying
                        ? <Pause className="h-4 w-4 text-green-400" />
                        : <Play className="h-4 w-4 text-green-400 ml-0.5" />}
                    </button>

                    <div className="flex-1 space-y-1">
                      <div
                        className="w-full h-1.5 bg-white/8 rounded-full cursor-pointer overflow-hidden"
                        onClick={e => {
                          if (!audioRef.current || !duration) return;
                          const rect = e.currentTarget.getBoundingClientRect();
                          audioRef.current.currentTime = ((e.clientX - rect.left) / rect.width) * duration;
                        }}
                      >
                        <div
                          className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full transition-all"
                          style={{ width: duration ? `${(progress / duration) * 100}%` : "0%" }}
                        />
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[10px] text-white/30">{formatTime(progress)}</span>
                        <span className="text-[10px] text-white/30">{formatTime(duration)}</span>
                      </div>
                    </div>

                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-500/15 text-green-400 border border-green-500/20 flex-shrink-0">
                      🇳🇬 {SPEAKERS.find(s => s.id === speaker)?.label ?? speaker}
                    </span>
                  </div>
                </div>
              )}

              <div className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <BookOpen className="h-4 w-4 text-white/30" />
                  <span className="text-[11px] font-bold text-white/40 uppercase tracking-widest">
                    Lesson: {topic}
                  </span>
                  <button
                    onClick={reset}
                    className="ml-auto flex items-center gap-1.5 text-[11px] text-white/25 hover:text-white/50 transition-colors"
                  >
                    <RefreshCw className="h-3 w-3" />New topic
                  </button>
                </div>
                <p className="text-sm text-white/70 leading-relaxed whitespace-pre-wrap">{lessonText}</p>

                {!audioUrl && !isLoading && (
                  <button
                    onClick={speakLesson}
                    className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-green-600/20 border border-green-500/30 text-green-400 text-sm font-semibold hover:bg-green-600/30 transition-all"
                  >
                    <Volume2 className="h-4 w-4" />
                    Speak this lesson — {SPEAKERS.find(s => s.id === speaker)?.label ?? speaker} ({language})
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Idle state */}
        {phase === "idle" && !lessonText && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            className="rounded-2xl border border-white/5 bg-white/2 p-5 text-center space-y-3"
          >
            <div className="w-12 h-12 rounded-2xl bg-green-500/10 border border-green-500/15 flex items-center justify-center mx-auto">
              <Volume2 className="h-6 w-6 text-green-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white/60">Your AI teacher is ready</p>
              <p className="text-xs text-white/30 mt-1">
                Pick a voice above, type any JUPEB topic, and get a lesson spoken in Nigerian English
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-2 pt-1">
              {["15 Nigerian voices", "5 languages incl. Yoruba & Igbo", "All JUPEB subjects"].map(f => (
                <span key={f} className="text-[10px] px-2.5 py-1 rounded-lg bg-white/4 border border-white/8 text-white/35">{f}</span>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </Shell>
  );
}
