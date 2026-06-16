import { Router } from "express";
import { db, pool } from "@workspace/db";
import { accessCodesTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

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

export default router;
