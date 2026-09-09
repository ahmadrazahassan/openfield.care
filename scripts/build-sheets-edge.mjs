import { build } from "esbuild";

await build({
  entryPoints: ["src/lib/sheets/edge-entry.ts"],
  outfile: "supabase/functions/appointments-to-sheets/index.js",
  bundle: true, platform: "neutral", format: "esm", packages: "external",
  banner: { js: "// Generated from src/lib/sheets/edge-entry.ts. Do not edit directly." },
});
