import type { WASocket } from "@whiskeysockets/baileys";
import { randomDelay, typingDelay, canSend, normalizePhone } from "../lib/anti-ban.js";
import { loginStudent, registerStudent, listCommunities, joinCommunity } from "../lib/api.js";

type Session = {
  step: "name" | "phone" | "email" | "subjects" | "university" | "done";
  data: Record<string, any>;
};

const sessions = new Map<string, Session>();

const SUBJECT_LIST = [
  "Literature in English",
  "Government",
  "Economics",
  "English Language",
  "Mathematics",
  "Biology",
  "Chemistry",
  "Physics",
  "Christian Religious Studies",
  "Islamic Religious Studies",
];

async function safeSend(sock: WASocket, jid: string, text: string) {
  if (!canSend(jid)) return;
  await sock.presenceSubscribe(jid);
  await randomDelay(500, 1200);
  await sock.sendPresenceUpdate("composing", jid);
  await typingDelay(text);
  await sock.sendPresenceUpdate("paused", jid);
  await sock.sendMessage(jid, { text });
}

export async function handleMessage(
  sock: WASocket,
  jid: string,
  senderPhone: string,
  text: string
) {
  const lower = text.trim().toLowerCase();
  const session = sessions.get(jid);

  // ── Registration flow ──────────────────────────────────────────────────────
  if (session) {
    await handleRegistrationStep(sock, jid, senderPhone, text, session);
    return;
  }

  // ── Commands ───────────────────────────────────────────────────────────────
  if (lower === "!help" || lower === "hi" || lower === "hello") {
    await safeSend(sock, jid,
      `👋 *Welcome to JUPEB Prep Bot!*\n\n` +
      `Here's what I can do:\n\n` +
      `📋 *!register* — Create your JUPEB Prep account\n` +
      `🔐 *!login* — Check your account details\n` +
      `📚 *!community* — Browse & join study communities\n` +
      `❓ *!help* — Show this menu\n\n` +
      `_WhatsApp: ${process.env.BOT_NUMBER ?? "this number"}_`
    );
    return;
  }

  if (lower === "!register") {
    sessions.set(jid, { step: "name", data: {} });
    await safeSend(sock, jid,
      `🎓 *JUPEB Prep Registration*\n\n` +
      `Let's set up your account in a few quick steps.\n\n` +
      `Step 1️⃣: What is your *full name*?`
    );
    return;
  }

  if (lower === "!login") {
    try {
      const result = await loginStudent(senderPhone);
      const p = result.profile;
      await safeSend(sock, jid,
        `✅ *Account Found!*\n\n` +
        `👤 Name: ${p.fullName}\n` +
        `📱 Phone: ${p.phone}\n` +
        `🏫 University: ${p.targetUniversity ?? "Not set"}\n` +
        `📚 Subjects: ${Array.isArray(p.subjects) ? p.subjects.join(", ") : p.subjects}\n` +
        `🎯 Target Grade: ${p.targetGrade.toUpperCase()}\n\n` +
        `Visit the platform: ${process.env.APP_URL ?? ""}`
      );
    } catch {
      await safeSend(sock, jid,
        `❌ No account found for this number.\n\nType *!register* to create one.`
      );
    }
    return;
  }

  if (lower === "!community") {
    try {
      const communities = await listCommunities();
      if (!communities.length) {
        await safeSend(sock, jid, "No communities available yet. Check back soon!");
        return;
      }
      const list = communities
        .slice(0, 8)
        .map((c, i) => `${i + 1}. *${c.name}* — ${c.memberCount} members`)
        .join("\n");
      await safeSend(sock, jid,
        `🏘️ *Study Communities*\n\n${list}\n\n` +
        `Reply with the *number* to join a community.`
      );
      sessions.set(jid, { step: "done", data: { awaitingCommunity: true, communities } });
    } catch {
      await safeSend(sock, jid, "Couldn't load communities right now. Try again later.");
    }
    return;
  }

  // Community selection after listing
  if (session?.data?.awaitingCommunity) {
    const idx = parseInt(text.trim()) - 1;
    const communities = session.data.communities as any[];
    if (idx >= 0 && idx < communities.length) {
      try {
        await joinCommunity(senderPhone, communities[idx].id);
        sessions.delete(jid);
        await safeSend(sock, jid,
          `✅ You've joined *${communities[idx].name}*!\n\n` +
          `You'll receive updates and discussions from this community.\n\n` +
          `Visit the platform to interact: ${process.env.APP_URL ?? ""}`
        );
      } catch {
        await safeSend(sock, jid, "Couldn't join that community. Please try again.");
      }
    } else {
      await safeSend(sock, jid, "Please reply with a valid number from the list.");
    }
    return;
  }

  // Unknown command
  await safeSend(sock, jid, `Type *!help* to see available commands. 😊`);
}

async function handleRegistrationStep(
  sock: WASocket,
  jid: string,
  senderPhone: string,
  text: string,
  session: Session
) {
  const { step, data } = session;

  if (step === "name") {
    if (text.trim().split(" ").length < 2) {
      await safeSend(sock, jid, "Please enter your *full name* (first and last name).");
      return;
    }
    data.fullName = text.trim();
    session.step = "email";
    await safeSend(sock, jid,
      `✅ Got it, *${data.fullName.split(" ")[0]}*!\n\n` +
      `Step 2️⃣: What's your *email address*? (Type *skip* if you don't have one)`
    );
    return;
  }

  if (step === "email") {
    data.email = lower === "skip" ? null : text.trim();
    session.step = "university";
    await safeSend(sock, jid,
      `Step 3️⃣: What *university* are you targeting?\n\n` +
      `e.g. _University of Lagos (UNILAG)_`
    );
    return;
  }

  if (step === "university") {
    data.targetUniversity = text.trim();
    session.step = "subjects";
    const list = SUBJECT_LIST.map((s, i) => `${i + 1}. ${s}`).join("\n");
    await safeSend(sock, jid,
      `Step 4️⃣: Pick your *JUPEB subjects* (choose up to 3).\n\n` +
      `${list}\n\n` +
      `Reply with the *numbers* separated by commas.\n` +
      `e.g. _1, 3, 9_`
    );
    return;
  }

  if (step === "subjects") {
    const picks = text.split(",").map(s => parseInt(s.trim()) - 1).filter(i => i >= 0 && i < SUBJECT_LIST.length);
    if (!picks.length || picks.length > 3) {
      await safeSend(sock, jid, "Please pick *1 to 3 subjects* using their numbers separated by commas.");
      return;
    }
    data.subjects = picks.map(i => SUBJECT_LIST[i]);
    session.step = "done";

    // Register the student
    try {
      const result = await registerStudent({
        fullName: data.fullName,
        phone: senderPhone,
        email: data.email ?? undefined,
        subjects: data.subjects,
        targetUniversity: data.targetUniversity,
        targetGrade: "aaa1",
      });
      sessions.delete(jid);

      await safeSend(sock, jid,
        `🎉 *Registration Complete!*\n\n` +
        `Welcome to JUPEB Prep, *${result.profile.firstName}*!\n\n` +
        `📚 Subjects: ${data.subjects.join(", ")}\n` +
        `🏫 University: ${data.targetUniversity}\n` +
        `${result.freeTrial ? "🆓 Free trial: 5 practice questions\n" : ""}\n` +
        `👉 Login to the platform:\n` +
        `${process.env.APP_URL ?? ""}\n\n` +
        `Type *!community* to join a study community!`
      );
    } catch (err: any) {
      sessions.delete(jid);
      await safeSend(sock, jid,
        `⚠️ Registration issue: ${err.message}\n\nType *!register* to try again.`
      );
    }
    return;
  }
}
