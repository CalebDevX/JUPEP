import { readFileSync, existsSync } from "fs";
import { join } from "path";
import { GoogleGenAI } from "@google/genai";

let rotationIndex = 0;

export function loadGeminiKeys(): string[] {
  const keys: string[] = [];
  try {
    const file = join(process.cwd(), "settings.json");
    if (existsSync(file)) {
      const data = JSON.parse(readFileSync(file, "utf8"));
      if (data.gemini_api_keys) {
        const parsed = JSON.parse(data.gemini_api_keys);
        if (Array.isArray(parsed)) keys.push(...parsed.filter(Boolean));
      }
    }
  } catch {}
  const envKey = process.env.AI_INTEGRATIONS_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
  if (envKey && !keys.includes(envKey)) keys.unshift(envKey);
  return keys;
}

export function getNextKey(): string {
  const keys = loadGeminiKeys();
  if (keys.length === 0) {
    throw new Error(
      "No Gemini API keys configured. Add keys in Admin → Settings → Gemini Keys."
    );
  }
  const key = keys[rotationIndex % keys.length];
  rotationIndex = (rotationIndex + 1) % keys.length;
  return key;
}

export function countKeys(): number {
  return loadGeminiKeys().length;
}

export function getAI(): GoogleGenAI {
  const apiKey = getNextKey();
  const baseUrl = process.env.AI_INTEGRATIONS_GEMINI_BASE_URL;
  return new GoogleGenAI(
    baseUrl ? { apiKey, httpOptions: { apiVersion: "", baseUrl } } : { apiKey }
  );
}
