import { useState, useEffect, useRef, useCallback } from "react";

export type ReadAloudState = "idle" | "playing" | "paused";

export function useReadAloud() {
  const [state, setState] = useState<ReadAloudState>("idle");
  const [voicesReady, setVoicesReady] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    const load = () => setVoicesReady(true);
    if (speechSynthesis.getVoices().length > 0) {
      setVoicesReady(true);
    } else {
      speechSynthesis.addEventListener("voiceschanged", load);
      return () => speechSynthesis.removeEventListener("voiceschanged", load);
    }
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
      .replace(/\n{3,}/g, "\n\n")
      .trim();

  const speak = useCallback((text: string) => {
    if (!window.speechSynthesis) return;
    speechSynthesis.cancel();

    const clean = stripMarkdown(text);
    const utterance = new SpeechSynthesisUtterance(clean);
    utteranceRef.current = utterance;

    const voice = getBestVoice();
    if (voice) utterance.voice = voice;
    utterance.rate = 0.92;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    utterance.lang = voice?.lang || "en-NG";

    utterance.onstart = () => setState("playing");
    utterance.onend = () => setState("idle");
    utterance.onerror = () => setState("idle");
    utterance.onpause = () => setState("paused");
    utterance.onresume = () => setState("playing");

    speechSynthesis.speak(utterance);
    setState("playing");
  }, []);

  const pause = useCallback(() => {
    if (window.speechSynthesis?.speaking) {
      speechSynthesis.pause();
      setState("paused");
    }
  }, []);

  const resume = useCallback(() => {
    if (window.speechSynthesis?.paused) {
      speechSynthesis.resume();
      setState("playing");
    }
  }, []);

  const stop = useCallback(() => {
    speechSynthesis?.cancel();
    setState("idle");
  }, []);

  const isSupported = typeof window !== "undefined" && "speechSynthesis" in window;

  return { state, speak, pause, resume, stop, isSupported, voicesReady };
}
