import { Router } from "express";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";
import { pool } from "@workspace/db";

const router = Router();

const SETTINGS_FILE = join(process.cwd(), "settings.json");

const DEFAULTS: Record<string, string> = {
  obj_timer_minutes: "60",
  theory_timer_minutes: "120",
  mock_timer_minutes: "120",
};

// Keys that are stored in the app_settings DB table instead of the JSON file
const DB_KEYS = new Set(["session_price", "session_end_date"]);

let cache: Record<string, string> | null = null;

function loadFileSettings(): Record<string, string> {
  if (cache) return cache;
  try {
    if (existsSync(SETTINGS_FILE)) {
      cache = { ...DEFAULTS, ...JSON.parse(readFileSync(SETTINGS_FILE, "utf8")) };
    } else {
      cache = { ...DEFAULTS };
    }
  } catch {
    cache = { ...DEFAULTS };
  }
  return cache;
}

function saveFileSettings(settings: Record<string, string>) {
  cache = settings;
  try {
    writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2), "utf8");
  } catch {}
}

async function loadDbSettings(): Promise<Record<string, string>> {
  try {
    const r = await pool.query("SELECT key, value FROM app_settings");
    const obj: Record<string, string> = {};
    for (const row of r.rows) obj[row.key] = row.value;
    return obj;
  } catch {
    return {};
  }
}

async function saveDbSetting(key: string, value: string) {
  await pool.query(
    "INSERT INTO app_settings(key,value) VALUES($1,$2) ON CONFLICT(key) DO UPDATE SET value=$2",
    [key, value]
  );
}

router.get("/settings", async (_req, res) => {
  const file = loadFileSettings();
  const db = await loadDbSettings();
  res.json({ ...file, ...db });
});

router.post("/settings", async (req, res) => {
  const { key, value, adminPin } = req.body;
  if (adminPin !== (process.env.ADMIN_PIN || "JUPEB2024")) return res.status(403).json({ error: "Unauthorized" });
  if (!key || value === undefined) return res.status(400).json({ error: "key and value are required" });

  if (DB_KEYS.has(key)) {
    await saveDbSetting(key, String(value));
  } else {
    const current = loadFileSettings();
    current[key] = String(value);
    saveFileSettings(current);
  }
  res.json({ key, value: String(value) });
});

export default router;
