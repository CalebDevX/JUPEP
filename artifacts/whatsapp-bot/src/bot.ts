import {
  makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  type WASocket,
} from "@whiskeysockets/baileys";
import { Boom } from "@hapi/boom";
import qrcode from "qrcode-terminal";
import { mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { Logger } from "pino";
import { handleMessage } from "./handlers/commands.js";
import { backoffMs, isGroupJid } from "./lib/anti-ban.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const AUTH_DIR = path.resolve(__dirname, "../../.baileys-auth");

let reconnectAttempt = 0;
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

export async function startBot(logger: Logger) {
  // Ensure auth directory exists
  if (!existsSync(AUTH_DIR)) await mkdir(AUTH_DIR, { recursive: true });

  const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);
  const { version } = await fetchLatestBaileysVersion();

  logger.info({ version }, "Baileys version");

  const sock = makeWASocket({
    version,
    logger: logger.child({ module: "baileys" }) as any,
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, logger as any),
    },
    // Mimic real WhatsApp Web to reduce ban risk
    browser: ["JUPEB Prep", "Chrome", "121.0.0"],
    markOnlineOnConnect: false,
    generateHighQualityLinkPreview: false,
    retryRequestDelayMs: 2000,
    maxMsgRetryCount: 3,
  });

  // ── Credentials persistence ──────────────────────────────────────────────
  sock.ev.on("creds.update", saveCreds);

  // ── Connection updates ────────────────────────────────────────────────────
  sock.ev.on("connection.update", async update => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      logger.info("Scan this QR code with WhatsApp (Linked Devices):");
      qrcode.generate(qr, { small: true });
    }

    if (connection === "close") {
      const statusCode = (lastDisconnect?.error as Boom)?.output?.statusCode;
      const shouldReconnect = statusCode !== DisconnectReason.loggedOut;

      logger.warn({ statusCode, shouldReconnect }, "Connection closed");

      if (shouldReconnect) {
        const delay = backoffMs(reconnectAttempt++);
        logger.info(`Reconnecting in ${Math.round(delay / 1000)}s (attempt ${reconnectAttempt})`);
        if (reconnectTimer) clearTimeout(reconnectTimer);
        reconnectTimer = setTimeout(() => startBot(logger), delay);
      } else {
        logger.error("Logged out — delete .baileys-auth folder and restart to re-scan QR.");
        process.exit(1);
      }
    }

    if (connection === "open") {
      reconnectAttempt = 0;
      logger.info("✅ WhatsApp bot connected!");
      const botNumber = sock.user?.id?.split(":")[0];
      if (botNumber) {
        logger.info({ number: botNumber }, "Bot number");
        process.env.BOT_NUMBER = botNumber;
      }
    }
  });

  // ── Incoming messages ─────────────────────────────────────────────────────
  sock.ev.on("messages.upsert", async ({ messages, type }) => {
    if (type !== "notify") return;

    for (const msg of messages) {
      try {
        await processMessage(sock, msg, logger);
      } catch (err) {
        logger.error(err, "Error processing message");
      }
    }
  });

  return sock;
}

async function processMessage(sock: WASocket, msg: any, logger: Logger) {
  // Skip non-messages, status updates, own messages, and broadcast
  if (!msg.message) return;
  if (msg.key.fromMe) return;
  if (msg.key.remoteJid === "status@broadcast") return;

  const jid = msg.key.remoteJid as string;

  // Skip group messages unless explicitly mentioned (to avoid ban from group spam)
  if (isGroupJid(jid)) {
    const mentionedJids = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid ?? [];
    const botJid = sock.user?.id;
    const botMentioned = botJid && mentionedJids.includes(botJid);
    if (!botMentioned) return;
  }

  // Extract text content
  const text =
    msg.message?.conversation ??
    msg.message?.extendedTextMessage?.text ??
    msg.message?.imageMessage?.caption ??
    "";

  if (!text.trim()) return;

  // Extract sender's phone number
  const senderJid = msg.key.participant ?? jid;
  const senderPhone = senderJid.replace("@s.whatsapp.net", "").replace("@g.us", "");

  logger.info({ jid, senderPhone, text: text.slice(0, 80) }, "Message received");

  await handleMessage(sock, jid, senderPhone, text);
}
