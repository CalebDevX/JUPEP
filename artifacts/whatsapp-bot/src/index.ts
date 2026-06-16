import { startBot } from "./bot.js";
import pino from "pino";

const logger = pino({
  transport: { target: "pino-pretty", options: { colorize: true } },
  level: process.env.LOG_LEVEL ?? "info",
});

logger.info("Starting JUPEB Prep WhatsApp Bot...");

startBot(logger).catch(err => {
  logger.error(err, "Fatal error");
  process.exit(1);
});
