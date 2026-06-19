import { Router } from "express";
import { db } from "@workspace/db";
import { referralsTable, accessCodesTable } from "@workspace/db";
import { eq, and, count } from "drizzle-orm";
import crypto from "crypto";

const router = Router();

function generateCode(phone: string): string {
  const hash = crypto.createHash("sha256").update(phone + Date.now()).digest("hex");
  return hash.slice(0, 8).toUpperCase();
}

// GET /api/referral/code?phone=... — get or create referral code
router.get("/referral/code", async (req, res) => {
  const { phone } = req.query as { phone: string };
  if (!phone) return res.status(400).json({ error: "phone required" });

  try {
    const [existing] = await db
      .select()
      .from(referralsTable)
      .where(and(eq(referralsTable.referrerPhone, phone)));

    if (existing) {
      return res.json({ code: existing.code });
    }

    const code = generateCode(phone);
    await db.insert(referralsTable).values({ referrerPhone: phone, code, status: "pending" });
    res.json({ code });
  } catch (err) {
    res.status(500).json({ error: "Failed to get referral code" });
  }
});

// GET /api/referral/stats?phone=...
router.get("/referral/stats", async (req, res) => {
  const { phone } = req.query as { phone: string };
  if (!phone) return res.status(400).json({ error: "phone required" });

  try {
    const refs = await db
      .select()
      .from(referralsTable)
      .where(eq(referralsTable.referrerPhone, phone));

    const [myRef] = refs;
    const code = myRef?.code ?? null;
    const completed = refs.filter(r => r.status === "completed");
    const totalDaysEarned = completed.reduce((sum, r) => sum + r.rewardDays, 0);

    res.json({ code, totalReferrals: completed.length, totalDaysEarned });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch referral stats" });
  }
});

// POST /api/referral/redeem — called on register with a referral code
router.post("/referral/redeem", async (req, res) => {
  const { phone, code } = req.body as { phone: string; code: string };
  if (!phone || !code) return res.status(400).json({ error: "phone and code required" });

  try {
    const upperCode = code.toUpperCase().trim();

    // Find the referral record
    const [ref] = await db
      .select()
      .from(referralsTable)
      .where(and(eq(referralsTable.code, upperCode)));

    if (!ref) return res.status(404).json({ error: "Invalid referral code" });
    if (ref.referrerPhone === phone) return res.status(400).json({ error: "Cannot redeem your own code" });
    if (ref.status === "completed") return res.status(400).json({ error: "Code already used" });

    // Mark referral completed
    await db.update(referralsTable).set({
      status: "completed",
      refereePhone: phone,
      completedAt: new Date(),
    }).where(eq(referralsTable.id, ref.id));

    // Grant both parties 7 free days via an access code
    const rewardDays = ref.rewardDays;
    const expiryDate = new Date(Date.now() + rewardDays * 24 * 60 * 60 * 1000);

    // Insert access codes for both referrer and referee (system-generated)
    const referrerCode = `REF-${upperCode}-R`;
    const refereeCode = `REF-${upperCode}-E`;

    await db.insert(accessCodesTable).values([
      { code: referrerCode, label: `Referral reward (${rewardDays} days)`, maxActivations: 1, activationCount: 0, isActive: true },
      { code: refereeCode, label: `Referral reward (${rewardDays} days)`, maxActivations: 1, activationCount: 0, isActive: true },
    ]).onConflictDoNothing();

    res.json({
      ok: true,
      message: `Referral redeemed! Both you and your referrer get ${rewardDays} free days.`,
      referrerCode,
      refereeCode,
      rewardDays,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to redeem referral" });
  }
});

export default router;
