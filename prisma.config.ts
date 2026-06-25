import "dotenv/config"; // Prisma 7 no longer auto-loads .env — must be explicit
import path from "node:path";
import { defineConfig, env } from "prisma/config";

// Prisma 7: connection URL moves from schema.prisma datasource block to here.
// Use Prisma's env() helper (not process.env) so it resolves correctly when
// the CLI loads this file before Node has populated process.env from .env.
// The runtime client uses the PrismaPg adapter in lib/prisma.ts.
export default defineConfig({
  schema: path.join("prisma", "schema.prisma"),

  datasource: {
    url: env("DATABASE_URL"),
  },

  migrations: {
    // Replaces the deprecated `package.json#prisma.seed` key.
    seed: "tsx prisma/seed.ts",
  },
});
