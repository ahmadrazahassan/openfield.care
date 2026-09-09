import { build } from "esbuild";

await build({
  entryPoints: ["src/lib/email/edge-entry.ts"],
  outfile: "supabase/functions/send-appointment-email/index.js",
  bundle: true,
  platform: "neutral",
  format: "esm",
  packages: "external",
  banner: { js: "// Generated from src/lib/email/edge-entry.ts. Do not edit directly." },
});
