import { Router } from "express";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";

const router = Router();

const SETTINGS_FILE = join(process.cwd(), "settings.json");

const DEFAULTS: Record<string, string> = {
  obj_timer_minutes: "60",
  theory_timer_minutes: "120",
  mock_timer_minutes: "120",
};

let cache: Record<string, string> | null = null;

function loadSettings(): Record<string, string> {
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

function saveSettings(settings: Record<string, string>) {
  cache = settings;
  try {
    writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2), "utf8");
  } catch {
    // non-fatal
  }
}

router.get("/settings", (_req, res) => {
  res.json(loadSettings());
});

router.post("/settings", (req, res) => {
  const { key, value, adminPin } = req.body;
  if (adminPin !== "JUPEB2024") return res.status(403).json({ error: "Unauthorized" });
  if (!key || value === undefined) return res.status(400).json({ error: "key and value are required" });
  const current = loadSettings();
  current[key] = String(value);
  saveSettings(current);
  res.json({ key, value: String(value) });
});

export default router;
