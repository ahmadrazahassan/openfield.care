/**
 * One-off import for the aerial hero photograph.
 *
 * Produces the same export set the image pipeline does (jpg/webp/avif plus a
 * portrait crop and a blur placeholder) so the new asset behaves exactly like
 * the generated ones.
 *
 *   node scripts/add-hero-image.mjs "<path to source png>"
 */
import sharp from "sharp";
import { mkdirSync, writeFileSync } from "node:fs";

const SRC = process.argv[2];
if (!SRC) {
  console.error("Usage: node scripts/add-hero-image.mjs <source image>");
  process.exit(1);
}

const OUT = "public/images/hero";
mkdirSync(OUT, { recursive: true });

// The subject lies just below centre at roughly 51% / 53% of the frame.
const SUBJECT = { x: 0.51, y: 0.53 };

async function main() {
  const meta = await sharp(SRC).metadata();
  console.log(`source: ${meta.width}x${meta.height}`);

  // ── Landscape master ────────────────────────────────────────────────────
  const landscape = { w: 2000, h: 1125 };
  const base = sharp(SRC).resize(landscape.w, landscape.h, { fit: "cover" });

  await base.clone().jpeg({ quality: 82, mozjpeg: true })
    .toFile(`${OUT}/hero-field-aerial.jpg`);
  await base.clone().webp({ quality: 80 })
    .toFile(`${OUT}/hero-field-aerial.webp`);
  await base.clone().avif({ quality: 48 })
    .toFile(`${OUT}/hero-field-aerial.avif`);

  // ── Portrait crop for mobile, centred on the subject ────────────────────
  const portrait = { w: 900, h: 1200 };
  const srcAspect = meta.width / meta.height;
  const cropAspect = portrait.w / portrait.h;

  // Widest crop that fits the portrait aspect inside the source.
  let cw, ch;
  if (srcAspect > cropAspect) {
    ch = meta.height;
    cw = Math.round(ch * cropAspect);
  } else {
    cw = meta.width;
    ch = Math.round(cw / cropAspect);
  }
  const left = Math.max(
    0,
    Math.min(meta.width - cw, Math.round(meta.width * SUBJECT.x - cw / 2)),
  );
  const top = Math.max(
    0,
    Math.min(meta.height - ch, Math.round(meta.height * SUBJECT.y - ch / 2)),
  );

  const cropped = sharp(SRC)
    .extract({ left, top, width: cw, height: ch })
    .resize(portrait.w, portrait.h, { fit: "cover" });

  await cropped.clone().jpeg({ quality: 82, mozjpeg: true })
    .toFile(`${OUT}/hero-field-aerial-mobile.jpg`);
  await cropped.clone().webp({ quality: 80 })
    .toFile(`${OUT}/hero-field-aerial-mobile.webp`);
  await cropped.clone().avif({ quality: 48 })
    .toFile(`${OUT}/hero-field-aerial-mobile.avif`);

  // ── Blur placeholders ───────────────────────────────────────────────────
  const blur = async (input) => {
    const buf = await input.clone().resize(16).jpeg({ quality: 40 }).toBuffer();
    return `data:image/jpeg;base64,${buf.toString("base64")}`;
  };

  const landscapeBlur = await blur(sharp(SRC).resize(landscape.w, landscape.h, { fit: "cover" }));
  const portraitBlur = await blur(cropped);

  const entries = {
    "/images/hero/hero-field-aerial.jpg": {
      path: "/images/hero/hero-field-aerial.jpg",
      width: landscape.w,
      height: landscape.h,
      alt: "An aerial view of a person lying spread out in the middle of a vast green field.",
      placeholder: false,
      blurDataURL: landscapeBlur,
    },
    "/images/hero/hero-field-aerial-mobile.jpg": {
      path: "/images/hero/hero-field-aerial-mobile.jpg",
      width: portrait.w,
      height: portrait.h,
      alt: "An aerial view of a person lying spread out in the middle of a vast green field.",
      placeholder: false,
      blurDataURL: portraitBlur,
    },
  };

  writeFileSync(
    "content/local-image-metadata.ts",
    `// Assets imported outside the output/imagegen pipeline.
// Kept separate so regenerating the pipeline cannot silently drop them.
// Merged into the registry by src/content/assets.ts.

export const localImageMetadata = ${JSON.stringify(entries, null, 2)} as const;
`,
    "utf8",
  );

  console.log("wrote:");
  console.log(`  ${OUT}/hero-field-aerial.{jpg,webp,avif}  ${landscape.w}x${landscape.h}`);
  console.log(`  ${OUT}/hero-field-aerial-mobile.{jpg,webp,avif}  ${portrait.w}x${portrait.h}`);
  console.log(`  crop origin: ${left},${top} (${cw}x${ch})`);
  console.log("  content/local-image-metadata.ts");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
