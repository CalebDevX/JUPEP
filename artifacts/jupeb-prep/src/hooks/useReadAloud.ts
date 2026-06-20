import { useState, useEffect, useRef, useCallback } from "react";

export type ReadAloudState = "idle" | "loading" | "playing" | "paused";
export type TtsEngine = "ai" | "browser";

export function useReadAloud() {
  const [state, setState] = useState<ReadAloudState>("idle");
  const [engine, setEngine] = useState<TtsEngine>("browser");
  const [voicesReady, setVoicesReady] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const BASE = import.meta.env.VITE_API_URL || "";

  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return () => {};
    const load = () => setVoicesReady(true);
    if (speechSynthesis.getVoices().length > 0) {
      setVoicesReady(true);
      return () => {};
    } else {
      speechSynthesis.addEventListener("voiceschanged", load);
      return () => {
        speechSynthesis.removeEventListener("voiceschanged", load);
      };
    }
  }, []);

  useEffect(() => {
    return () => {
      audioRef.current?.pause();
      speechSynthesis?.cancel();
    };
  }, []);

  const getBestVoice = (): SpeechSynthesisVoice | null => {
    if (!window.speechSynthesis) return null;
    const voices = speechSynthesis.getVoices();
    return (
      voices.find(v => v.lang === "en-NG") ||
      voices.find(v => v.lang === "en-GH") ||
      voices.find(v => v.lang === "en-ZA") ||
      voices.find(v => v.name.toLowerCase().includes("nigeria")) ||
      voices.find(v => v.name.toLowerCase().includes("african")) ||
      voices.find(v => v.lang === "en-GB" && v.name.toLowerCase().includes("female")) ||
      voices.find(v => v.lang === "en-GB") ||
      voices.find(v => v.lang.startsWith("en")) ||
      null
    );
  };

  const stripMarkdown = (text: string) =>
    text
      .replace(/#{1,6}\s*/g, "")
      .replace(/\*\*(.*?)\*\*/g, "$1")
      .replace(/\*(.*?)\*/g, "$1")
      .replace(/`{1,3}(.*?)`{1,3}/gs, "$1")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .replace(/^[-*+]\s+/gm, "")
      .replace(/^\d+\.\s+/gm, "")
      .replace(/^>\s+/gm, "")
      .replace(/🎯|✅|❌|⭐|💡|🔑|📝|🏆|🎓|✨/g, "")
      .replace(/\n{3,}/g, "\n\n")
      .trim();

  const speakWithAI = useCallback(async (text: string, voice = "Kore") => {
    setState("loading");
    audioRef.current?.pause();
    speechSynthesis?.cancel();
    try {
      const res = await fetch(`${BASE}/api/ai/tts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: stripMarkdown(text), voice }),
      });
      if (!res.ok) throw new Error("TTS request failed");
      const data = await res.json();
      if (!data.audio) throw new Error("No audio data");

      const byteStr = atob(data.audio);
      const bytes = new Uint8Array(byteStr.length);
      for (let i = 0; i < byteStr.length; i++) bytes[i] = byteStr.charCodeAt(i);
      const blob = new Blob([bytes], { type: data.mimeType || "audio/wav" });
      const url = URL.createObjectURL(blob);

      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onplay = () => { setState("playing"); setEngine("ai"); };
      audio.onpause = () => setState("paused");
      audio.onended = () => { setState("idle"); URL.revokeObjectURL(url); };
      audio.onerror = () => { setState("idle"); URL.revokeObjectURL(url); };
      await audio.play();
    } catch {
      speakWithBrowser(text);
    }
  }, [BASE]);

  const speakWithBrowser = useCallback((text: string) => {
    if (!window.speechSynthesis) return;
    speechSynthesis.cancel();
    const clean = stripMarkdown(text);
    const utterance = new SpeechSynthesisUtterance(clean);
    utteranceRef.current = utterance;
    const voice = getBestVoice();
    if (voice) utterance.voice = voice;
    utterance.rate = 0.88;
    utterance.pitch = 1.05;
    utterance.volume = 1.0;
    utterance.lang = voice?.lang || "en-NG";
    utterance.onstart = () => { setState("playing"); setEngine("browser"); };
    utterance.onend = () => setState("idle");
    utterance.onerror = () => setState("idle");
    utterance.onpause = () => setState("paused");
    utterance.onresume = () => setState("playing");
    speechSynthesis.speak(utterance);
    setState("playing");
  }, []);

  const speak = useCallback((text: string, useAI = true) => {
    if (useAI) speakWithAI(text);
    else speakWithBrowser(text);
  }, [speakWithAI, speakWithBrowser]);

  const pause = useCallback(() => {
    if (audioRef.current && !audioRef.current.paused) {
      audioRef.current.pause();
      setState("paused");
    } else if (window.speechSynthesis?.speaking) {
      speechSynthesis.pause();
      setState("paused");
    }
  }, []);

  const resume = useCallback(() => {
    if (audioRef.current?.paused) {
      audioRef.current.play();
      setState("playing");
    } else if (window.speechSynthesis?.paused) {
      speechSynthesis.resume();
      setState("playing");
    }
  }, []);

  const stop = useCallback(() => {
    audioRef.current?.pause();
    if (audioRef.current) audioRef.current.currentTime = 0;
    speechSynthesis?.cancel();
    setState("idle");
  }, []);

  const isSupported = typeof window !== "undefined" && ("speechSynthesis" in window || "Audio" in window);

  return { state, engine, speak, pause, resume, stop, isSupported, voicesReady };
}
