import { defineConfig } from "drizzle-kit";
import path from "path";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL, ensure the database is provisioned");
}

// Strip sslmode so our explicit ssl config takes effect (Aiven self-signed cert)
let dbUrl = process.env.DATABASE_URL;
try {
  const u = new URL(dbUrl);
  u.searchParams.delete("sslmode");
  dbUrl = u.toString();
} catch {
  // keep original
}

export default defineConfig({
  schema: path.join(__dirname, "./src/schema/index.ts"),
  dialect: "postgresql",
  dbCredentials: {
    url: dbUrl,
    ssl: { rejectUnauthorized: false },
  },
});
