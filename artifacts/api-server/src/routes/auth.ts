import { Router } from "express";
import { db, pool } from "@workspace/db";
import { accessCodesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { OAuth2Client } from "google-auth-library";
import { readFileSync, existsSync } from "fs";
import { join } from "path";
import crypto from "crypto";

// Ensure required columns exist (non-blocking)
pool.query(`ALTER TABLE students ADD COLUMN IF NOT EXISTS session_token TEXT`).catch(() => {});
pool.query(`ALTER TABLE students ADD COLUMN IF NOT EXISTS profile_picture TEXT`).catch(() => {});
pool.query(`ALTER TABLE students ADD COLUMN IF NOT EXISTS pin_hash TEXT`).catch(() => {});
pool.query(`ALTER TABLE students ADD COLUMN IF NOT EXISTS password_hash TEXT`).catch(() => {});
pool.query(`ALTER TABLE students ADD COLUMN IF NOT EXISTS google_id TEXT`).catch(() => {});
pool.query(`ALTER TABLE students ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP`).catch(() => {});

// OTP table for password reset
pool.query(`CREATE TABLE IF NOT EXISTS otp_codes (
  id SERIAL PRIMARY KEY,
  phone TEXT NOT NULL,
  code TEXT NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  reset_token TEXT,
  created_at TIMESTAMP DEFAULT NOW()
)`).catch(() => {});

// WhatsApp notification queue
pool.query(`CREATE TABLE IF NOT EXISTS wa_notifications (
  id SERIAL PRIMARY KEY,
  phone TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  sent_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
)`).catch(() => {});

function hashPin(phone: string, pin: string): string {
  return crypto.createHash("sha256").update(`${phone.trim()}:${pin}`).digest("hex");
}

function hashPassword(phone: string, password: string): string {
  return crypto.createHash("sha256").update(`pw2:${phone.trim()}:${password}`).digest("hex");
}

function buildProfile(s: any, sessionToken: string) {
  const rawCode = s.access_code_used;
  const expiresAt = s.expires_at ? new Date(s.expires_at) : null;
  const sessionActive = expiresAt ? expiresAt > new Date() : false;
  const isActivated = (rawCode && rawCode !== "FREE_TRIAL" && (!expiresAt || sessionActive)) || (s.payment_status === "paid" && sessionActive);
  return {
    fullName: s.full_name,
    firstName: s.full_name.split(" ")[0],
    phone: s.phone,
    email: s.email,
    subjects: s.subjects,
    targetUniversity: s.target_university,
    targetGrade: s.target_grade,
    accessCode: rawCode === "FREE_TRIAL" ? null : rawCode,
    expiresAt: s.expires_at || null,
    sessionActive,
    paymentStatus: s.payment_status || "unpaid",
    sessionToken,
    hasPin: !!s.pin_hash,
    hasPassword: !!s.password_hash,
    isActivated: !!isActivated,
  };
}

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
  const { fullName, phone, email, subjects, targetUniversity, targetGrade, accessCode, password, pin } = req.body;

  if (!fullName?.trim() || !phone?.trim() || !subjects?.length) {
    return res.status(400).json({ error: "Please fill in all required fields." });
  }
  if (!password?.trim()) {
    return res.status(400).json({ error: "Password is required." });
  }
  if (password.trim().length < 6) {
    return res.status(400).json({ error: "Password must be at least 6 characters." });
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
      if (codeRecord.expiresAt && new Date(codeRecord.expiresAt) < new Date()) {
        return res.status(400).json({ error: "This access code has expired." });
      }
      await db.update(accessCodesTable)
        .set({ activationCount: codeRecord.activationCount + 1 })
        .where(eq(accessCodesTable.code, code));
    }

    const pwHash = hashPassword(phone.trim(), password.trim());
    const pinHash = (pin && /^\d{6}$/.test(pin)) ? hashPin(phone.trim(), pin) : null;

    // Retrieve code's expires_at to propagate to the student record
    let codeExpiresAt: Date | null = null;
    if (!isFreeTrialRegistration) {
      const [cr] = await db.select().from(accessCodesTable).where(eq(accessCodesTable.code, code));
      if (cr?.expiresAt) codeExpiresAt = new Date(cr.expiresAt);
    }

    await pool.query(
      `INSERT INTO students(full_name, phone, email, subjects, target_university, target_grade, access_code_used, password_hash, expires_at)
       VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9)
       ON CONFLICT(phone) DO UPDATE SET
         full_name=$1, subjects=$4, target_university=$5, target_grade=$6, password_hash=$8, expires_at=COALESCE($9, students.expires_at)`,
      [
        fullName.trim(), phone.trim(), email?.trim() || null,
        JSON.stringify(subjects), targetUniversity?.trim() || null,
        targetGrade || "aaa1", code, pwHash, codeExpiresAt,
      ]
    );

    if (pinHash) {
      await pool.query("UPDATE students SET pin_hash=$1 WHERE phone=$2", [pinHash, phone.trim()]).catch(() => {});
    }

    const sessionToken = crypto.randomUUID();
    await pool.query("UPDATE students SET session_token=$1 WHERE phone=$2", [sessionToken, phone.trim()]).catch(() => {});

    const r2 = await pool.query("SELECT * FROM students WHERE phone=$1", [phone.trim()]);
    const profile = buildProfile(r2.rows[0], sessionToken);

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
    if (codeRecord.expiresAt && new Date(codeRecord.expiresAt) < new Date()) {
      return res.status(400).json({ error: "This access code has expired." });
    }

    const codeExpiresAt = codeRecord.expiresAt ? new Date(codeRecord.expiresAt) : null;
    const result = await pool.query(
      "UPDATE students SET access_code_used=$1, expires_at=COALESCE($3, expires_at) WHERE phone=$2 RETURNING *",
      [code, phone.trim(), codeExpiresAt]
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
  const { phone, password, pin } = req.body;
  if (!phone?.trim()) return res.status(400).json({ error: "Phone number is required." });

  try {
    const result = await pool.query("SELECT * FROM students WHERE phone=$1", [phone.trim()]);

    if (!result.rows.length) {
      return res.status(404).json({ error: "No account found with this phone number. Please register first." });
    }

    const s = result.rows[0];

    // Password verification (new accounts)
    if (s.password_hash) {
      if (!password) {
        return res.json({ requiresPassword: true });
      }
      const attempted = hashPassword(phone.trim(), password);
      if (attempted !== s.password_hash) {
        return res.status(401).json({ error: "Incorrect password. Please try again." });
      }
    } else if (s.pin_hash) {
      // Legacy PIN accounts (no password set yet)
      if (!pin) {
        return res.json({ requiresPin: true });
      }
      const attempted = hashPin(phone.trim(), pin);
      if (attempted !== s.pin_hash) {
        return res.status(401).json({ error: "Incorrect PIN. Please try again." });
      }
    }

    // Rotate session token → kicks out any other device
    const sessionToken = crypto.randomUUID();
    await pool.query("UPDATE students SET session_token=$1 WHERE phone=$2", [sessionToken, phone.trim()]).catch(() => {});

    const r2 = await pool.query("SELECT * FROM students WHERE phone=$1", [phone.trim()]);
    const profile = buildProfile(r2.rows[0], sessionToken);

    res.json({ success: true, profile });
  } catch (err: any) {
    res.status(500).json({ error: "Login failed. Please try again.", detail: err?.message });
  }
});

// ── Set / change PIN ─────────────────────────────────────────────────────────
router.post("/auth/set-pin", async (req, res) => {
  const { phone, token, pin, currentPin } = req.body;
  if (!phone?.trim() || !token?.trim()) return res.status(400).json({ error: "Phone and session token required." });
  if (!pin || !/^\d{6}$/.test(pin)) return res.status(400).json({ error: "PIN must be exactly 6 digits." });

  try {
    const r = await pool.query("SELECT session_token, pin_hash FROM students WHERE phone=$1", [phone.trim()]);
    if (!r.rows.length) return res.status(404).json({ error: "Account not found." });
    if (r.rows[0].session_token !== token) return res.status(401).json({ error: "Invalid session." });

    // If account already has a PIN, require current PIN to change it
    if (r.rows[0].pin_hash) {
      if (!currentPin) return res.status(400).json({ error: "Current PIN is required to change your PIN.", requiresCurrentPin: true });
      if (hashPin(phone.trim(), currentPin) !== r.rows[0].pin_hash) {
        return res.status(401).json({ error: "Current PIN is incorrect." });
      }
    }

    const newHash = hashPin(phone.trim(), pin);
    await pool.query("UPDATE students SET pin_hash=$1 WHERE phone=$2", [newHash, phone.trim()]);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to set PIN.", detail: err?.message });
  }
});

// ── Remove PIN ───────────────────────────────────────────────────────────────
router.post("/auth/remove-pin", async (req, res) => {
  const { phone, token, currentPin } = req.body;
  if (!phone?.trim() || !token?.trim() || !currentPin) return res.status(400).json({ error: "Phone, token, and current PIN required." });
  try {
    const r = await pool.query("SELECT session_token, pin_hash FROM students WHERE phone=$1", [phone.trim()]);
    if (!r.rows.length) return res.status(404).json({ error: "Account not found." });
    if (r.rows[0].session_token !== token) return res.status(401).json({ error: "Invalid session." });
    if (hashPin(phone.trim(), currentPin) !== r.rows[0].pin_hash) return res.status(401).json({ error: "Incorrect PIN." });
    await pool.query("UPDATE students SET pin_hash=NULL WHERE phone=$1", [phone.trim()]);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to remove PIN.", detail: err?.message });
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

// ── Google OAuth — Mobile (access_token from expo-auth-session) ──────────────

router.post("/auth/google/mobile", async (req, res) => {
  const { accessToken } = req.body;
  if (!accessToken) return res.status(400).json({ error: "Missing accessToken." });

  try {
    // Verify token + get user info from Google
    const infoRes = await fetch(
      `https://www.googleapis.com/oauth2/v3/userinfo`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    if (!infoRes.ok) return res.status(401).json({ error: "Invalid Google access token." });

    const info: any = await infoRes.json();
    const { email, name, picture, sub: googleId } = info;
    if (!email) return res.status(400).json({ error: "Google account has no email." });

    // Ensure google_id column exists
    await pool.query(`ALTER TABLE students ADD COLUMN IF NOT EXISTS google_id TEXT`).catch(() => {});

    // Look up by google_id or email
    let result = await pool.query(
      "SELECT * FROM students WHERE google_id=$1 OR email=$2 LIMIT 1",
      [googleId, email]
    );

    let student: any;
    const sessionToken = crypto.randomUUID();

    if (result.rows.length) {
      // Existing user — update google_id and session
      student = result.rows[0];
      await pool.query(
        "UPDATE students SET google_id=$1, session_token=$2, profile_picture=COALESCE(profile_picture,$3) WHERE phone=$4",
        [googleId, sessionToken, picture || null, student.phone]
      );
    } else {
      // New user — create account with synthetic phone
      const syntheticPhone = `g_${googleId}`;
      const displayName = name || email.split("@")[0];
      await pool.query(
        `INSERT INTO students(full_name, phone, email, google_id, subjects, access_code_used, profile_picture, session_token)
         VALUES($1,$2,$3,$4,$5,'FREE_TRIAL',$6,$7)
         ON CONFLICT(phone) DO UPDATE SET google_id=$4, session_token=$7`,
        [displayName, syntheticPhone, email, googleId, JSON.stringify([]), picture || null, sessionToken]
      );
      const r2 = await pool.query("SELECT * FROM students WHERE phone=$1", [syntheticPhone]);
      student = r2.rows[0];
    }

    const profile = buildProfile({ ...student, session_token: sessionToken }, sessionToken);
    res.json({ success: true, profile });
  } catch (err: any) {
    console.error("Google mobile auth error:", err);
    res.status(500).json({ error: err.message || "Google authentication failed." });
  }
});

// ── Profile picture ──────────────────────────────────────────────────────────

router.post("/student/profile-picture", async (req, res) => {
  const { phone, token } = req.body;
  const image: string | null = req.body.image ?? null;
  if (!phone?.trim() || !token?.trim()) {
    return res.status(400).json({ error: "Phone and token are required." });
  }
  if (image !== null && image.length > 700000) {
    return res.status(400).json({ error: "Image too large. Please use a smaller photo." });
  }
  try {
    const r = await pool.query("SELECT session_token FROM students WHERE phone=$1", [phone.trim()]);
    if (!r.rows.length) return res.status(404).json({ error: "Student not found." });
    if (r.rows[0].session_token !== token) return res.status(401).json({ error: "Invalid session. Please log in again." });
    await pool.query("UPDATE students SET profile_picture=$1 WHERE phone=$2", [image, phone.trim()]);
    res.json({ success: true });
  } catch (err: any) {
    console.error("Profile picture save error:", err);
    res.status(500).json({ error: "Failed to save profile picture." });
  }
});

router.get("/student/profile-picture", async (req, res) => {
  const phone = (req.query.phone as string)?.trim();
  const token = req.headers["x-session-token"] as string;
  if (!phone || !token) return res.status(400).json({ error: "Phone and token are required." });
  try {
    const r = await pool.query("SELECT session_token, profile_picture FROM students WHERE phone=$1", [phone]);
    if (!r.rows.length) return res.status(404).json({ error: "Student not found." });
    if (r.rows[0].session_token !== token) return res.status(401).json({ error: "Invalid session." });
    res.json({ image: r.rows[0].profile_picture || null });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to fetch profile picture." });
  }
});

// ── Session verification ─────────────────────────────────────────────────────
// Returns {valid: true} only if the token matches what's stored in the DB.
// Calling this endpoint from a new login will have already replaced the token,
// so the previous device's token becomes invalid automatically.
router.get("/auth/verify-session", async (req, res) => {
  const phone = (req.query.phone as string)?.trim();
  const token = req.headers["x-session-token"] as string;
  if (!phone || !token) return res.json({ valid: false });
  try {
    const r = await pool.query("SELECT session_token FROM students WHERE phone=$1", [phone]);
    if (!r.rows.length) return res.json({ valid: false });
    res.json({ valid: r.rows[0].session_token === token });
  } catch {
    res.json({ valid: true }); // fail-open so DB issues don't lock users out
  }
});

// ── OTP Password Reset ────────────────────────────────────────────────────────

router.post("/auth/request-otp", async (req, res) => {
  const { phone } = req.body;
  if (!phone?.trim()) return res.status(400).json({ error: "Phone number is required." });
  const cleanPhone = phone.trim().replace(/\s/g, "");
  try {
    const r = await pool.query("SELECT id FROM students WHERE phone=$1", [cleanPhone]);
    if (!r.rows.length) return res.status(404).json({ error: "No account found with this phone number." });

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await pool.query("UPDATE otp_codes SET used=TRUE WHERE phone=$1 AND used=FALSE", [cleanPhone]);
    await pool.query(
      "INSERT INTO otp_codes(phone, code, expires_at) VALUES($1,$2,$3)",
      [cleanPhone, code, expiresAt]
    );
    await pool.query(
      "INSERT INTO wa_notifications(phone, message, status) VALUES($1,$2,'pending')",
      [cleanPhone, `🔐 *JUPEB Prep – Password Reset*\n\nYour OTP is: *${code}*\n\nValid for 10 minutes. Do NOT share this code.`]
    );
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to send OTP." });
  }
});

router.post("/auth/verify-otp", async (req, res) => {
  const { phone, code } = req.body;
  if (!phone?.trim() || !code?.trim()) return res.status(400).json({ error: "Phone and code are required." });
  const cleanPhone = phone.trim().replace(/\s/g, "");
  try {
    const r = await pool.query(
      "SELECT id FROM otp_codes WHERE phone=$1 AND code=$2 AND used=FALSE AND expires_at > NOW()",
      [cleanPhone, code.trim()]
    );
    if (!r.rows.length) return res.status(400).json({ error: "Invalid or expired code. Please request a new one." });
    const resetToken = crypto.randomBytes(32).toString("hex");
    await pool.query("UPDATE otp_codes SET used=TRUE, reset_token=$1 WHERE id=$2", [resetToken, r.rows[0].id]);
    res.json({ success: true, resetToken });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Verification failed." });
  }
});

router.post("/auth/reset-password", async (req, res) => {
  const { phone, resetToken, newPassword } = req.body;
  if (!phone?.trim() || !resetToken?.trim() || !newPassword?.trim())
    return res.status(400).json({ error: "All fields are required." });
  if (newPassword.trim().length < 6)
    return res.status(400).json({ error: "Password must be at least 6 characters." });
  const cleanPhone = phone.trim().replace(/\s/g, "");
  try {
    const r = await pool.query(
      "SELECT id FROM otp_codes WHERE phone=$1 AND reset_token=$2 AND created_at > NOW() - INTERVAL '15 minutes'",
      [cleanPhone, resetToken.trim()]
    );
    if (!r.rows.length) return res.status(400).json({ error: "Reset link expired. Please start over." });
    const pwHash = hashPassword(cleanPhone, newPassword.trim());
    const newToken = crypto.randomBytes(32).toString("hex");
    await pool.query(
      "UPDATE students SET password_hash=$1, session_token=$2, pin_hash=NULL WHERE phone=$3",
      [pwHash, newToken, cleanPhone]
    );
    await pool.query("UPDATE otp_codes SET reset_token=NULL WHERE id=$1", [r.rows[0].id]);
    const s = await pool.query("SELECT * FROM students WHERE phone=$1", [cleanPhone]);
    if (s.rows.length) return res.json({ success: true, profile: buildProfile(s.rows[0], newToken) });
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Password reset failed." });
  }
});

export default router;
