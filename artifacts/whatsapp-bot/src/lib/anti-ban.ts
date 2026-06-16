/**
 * Anti-ban utilities for WhatsApp bot.
 * Key principles:
 * - Random delays simulate human typing speed
 * - Never flood messages — rate limit per JID
 * - Typing indicators before each message
 * - Exponential backoff on reconnect
 */

export interface RateEntry {
  count: number;
  resetAt: number;
}

const rateMap = new Map<string, RateEntry>();

const MAX_PER_MINUTE = 10;
const TYPING_BASE_MS = 800;
const TYPING_PER_CHAR_MS = 30;

export function canSend(jid: string): boolean {
  const now = Date.now();
  const entry = rateMap.get(jid);
  if (!entry || now > entry.resetAt) {
    rateMap.set(jid, { count: 1, resetAt: now + 60_000 });
    return true;
  }
  if (entry.count >= MAX_PER_MINUTE) return false;
  entry.count++;
  return true;
}

export function randomDelay(minMs = 1500, maxMs = 4000): Promise<void> {
  const ms = Math.floor(Math.random() * (maxMs - minMs)) + minMs;
  return new Promise(r => setTimeout(r, ms));
}

export function typingDelay(text: string): Promise<void> {
  const ms = Math.min(TYPING_BASE_MS + text.length * TYPING_PER_CHAR_MS, 4000);
  return new Promise(r => setTimeout(r, ms));
}

export function backoffMs(attempt: number): number {
  return Math.min(1000 * 2 ** attempt + Math.random() * 1000, 60_000);
}

export function isGroupJid(jid: string): boolean {
  return jid.endsWith("@g.us");
}

export function normalizePhone(raw: string): string {
  let digits = raw.replace(/\D/g, "");
  if (digits.startsWith("0") && digits.length === 11) {
    digits = "234" + digits.slice(1);
  }
  return digits + "@s.whatsapp.net";
}
