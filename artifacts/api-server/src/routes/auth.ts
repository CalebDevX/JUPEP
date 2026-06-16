import { Router } from "express";
import { db, pool } from "@workspace/db";
import { accessCodesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { OAuth2Client } from "google-auth-library";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

const router = Router();

function getSetting(key: string): string | null {
  try {
    const file = join(process.cwd(), "settings.json");
    if (existsSync(file)) {
      const data = JSON.parse(readFileSync(file, "utf8"));
      return data[key] || null;
    }
  } catch {}
  return null;
}

router.post("/auth/register", async (req, res) => {
  const { fullName, phone, email, subjects, targetUniversity, targetGrade, accessCode } = req.body;

  if (!fullName?.trim() || !phone?.trim() || !subjects?.length) {
    return res.status(400).json({ error: "Please fill in all required fields." });
  }

  const isFreeTrialRegistration = !accessCode?.trim();
  const code = isFreeTrialRegistration ? "FREE_TRIAL" : accessCode.trim().toUpperCase();

  try {
    if (!isFreeTrialRegistration) {
      const [codeRecord] = await db.select().from(accessCodesTable).where(eq(accessCodesTable.code, code));
      if (!codeRecord) return res.status(400).json({ error: "Invalid access code. Please check and try again." });
      if (!codeRecord.isActive) return res.status(400).json({ error: "This access code has been deactivated." });
      if (codeRecord.activationCount >= codeRecord.maxActivations) {
        return res.status(400).json({ error: "This access code has reached its maximum number of uses." });
      }
      await db.update(accessCodesTable)
        .set({ activationCount: codeRecord.activationCount + 1 })
        .where(eq(accessCodesTable.code, code));
    }

    await pool.query(
      `INSERT INTO students(full_name, phone, email, subjects, target_university, target_grade, access_code_used)
       VALUES($1,$2,$3,$4,$5,$6,$7)
       ON CONFLICT(phone) DO UPDATE SET
         full_name=$1, subjects=$4, target_university=$5, target_grade=$6`,
      [
        fullName.trim(), phone.trim(), email?.trim() || null,
        JSON.stringify(subjects), targetUniversity?.trim() || null,
        targetGrade || "aaa1", code,
      ]
    );

    const profile = {
      fullName: fullName.trim(),
      firstName: fullName.trim().split(" ")[0],
      phone: phone.trim(),
      email: email?.trim() || null,
      subjects,
      targetUniversity: targetUniversity?.trim() || null,
      targetGrade: targetGrade || "aaa1",
      accessCode: isFreeTrialRegistration ? null : code,
    };

    res.json({ success: true, profile, freeTrial: isFreeTrialRegistration });
  } catch (err: any) {
    console.error("Register error:", err);
    res.status(500).json({ error: "Registration failed. Please try again.", detail: err?.message });
  }
});

router.post("/auth/activate", async (req, res) => {
  const { phone, accessCode } = req.body;
  if (!phone?.trim() || !accessCode?.trim()) {
    return res.status(400).json({ error: "Phone and access code are required." });
  }
  const code = accessCode.trim().toUpperCase();
  try {
    const [codeRecord] = await db.select().from(accessCodesTable).where(eq(accessCodesTable.code, code));
    if (!codeRecord) return res.status(400).json({ error: "Invalid access code. Please check and try again." });
    if (!codeRecord.isActive) return res.status(400).json({ error: "This access code has been deactivated." });
    if (codeRecord.activationCount >= codeRecord.maxActivations) {
      return res.status(400).json({ error: "This access code has reached its maximum number of uses." });
    }

    const result = await pool.query(
      "UPDATE students SET access_code_used=$1 WHERE phone=$2 RETURNING *",
      [code, phone.trim()]
    );
    if (!result.rows.length) return res.status(404).json({ error: "Account not found." });

    await db.update(accessCodesTable)
      .set({ activationCount: codeRecord.activationCount + 1 })
      .where(eq(accessCodesTable.code, code));

    const s = result.rows[0];
    const profile = {
      fullName: s.full_name,
      firstName: s.full_name.split(" ")[0],
      phone: s.phone,
      email: s.email,
      subjects: s.subjects,
      targetUniversity: s.target_university,
      targetGrade: s.target_grade,
      accessCode: code,
    };
    res.json({ success: true, profile });
  } catch (err: any) {
    console.error("Activate error:", err);
    res.status(500).json({ error: "Activation failed. Please try again.", detail: err?.message });
  }
});

router.post("/auth/login", async (req, res) => {
  const { phone } = req.body;
  if (!phone?.trim()) return res.status(400).json({ error: "Phone number is required." });

  try {
    const result = await pool.query("SELECT * FROM students WHERE phone=$1", [phone.trim()]);

    if (!result.rows.length) {
      return res.status(404).json({ error: "No account found with this phone number. Please register first." });
    }

    const s = result.rows[0];
    const rawCode = s.access_code_used;
    const profile = {
      fullName: s.full_name,
      firstName: s.full_name.split(" ")[0],
      phone: s.phone,
      email: s.email,
      subjects: s.subjects,
      targetUniversity: s.target_university,
      targetGrade: s.target_grade,
      accessCode: rawCode === "FREE_TRIAL" ? null : rawCode,
    };

    res.json({ success: true, profile });
  } catch (err: any) {
    res.status(500).json({ error: "Login failed. Please try again.", detail: err?.message });
  }
});

// ── Google OAuth ────────────────────────────────────────────────────────────

router.get("/auth/google/config", (_req, res) => {
  const clientId = process.env.GOOGLE_CLIENT_ID || getSetting("google_client_id");
  res.json({ clientId: clientId || null });
});

router.post("/auth/google", async (req, res) => {
  const { credential } = req.body;
  if (!credential) return res.status(400).json({ error: "Missing Google credential." });

  const clientId = process.env.GOOGLE_CLIENT_ID || getSetting("google_client_id");
  if (!clientId) {
    return res.status(503).json({ error: "Google Sign-In is not configured yet.", code: "NOT_CONFIGURED" });
  }

  try {
    const client = new OAuth2Client(clientId);
    const ticket = await client.verifyIdToken({ idToken: credential, audience: clientId });
    const payload = ticket.getPayload();
    if (!payload) return res.status(400).json({ error: "Invalid Google credential." });

    const { email, name, picture, sub: googleId } = payload;
    if (!email) return res.status(400).json({ error: "Google account has no email address." });

    const result = await pool.query(
      "SELECT * FROM students WHERE email=$1 OR google_id=$2",
      [email, googleId || null]
    ).catch(async () => {
      return pool.query("SELECT * FROM students WHERE email=$1", [email]);
    });

    if (result.rows.length) {
      const s = result.rows[0];
      const profile = {
        fullName: s.full_name,
        firstName: s.full_name.split(" ")[0],
        phone: s.phone,
        email: s.email || email,
        subjects: s.subjects,
        targetUniversity: s.target_university,
        targetGrade: s.target_grade,
        accessCode: null,
        picture: picture || null,
      };
      return res.json({ success: true, profile });
    }

    return res.json({
      success: false,
      needsRegistration: true,
      googleData: { name: name || "", email, picture: picture || null },
    });
  } catch (err: any) {
    console.error("Google auth error:", err);
    res.status(500).json({ error: err.message || "Google authentication failed." });
  }
});

export default router;
