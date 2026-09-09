# Openfield image assets

Created from `01-IMAGE-ASSET-PROMPTS.md` with the built-in image generation tool. The complete normalized prompt set is in `prompts.json`; original generated PNGs are preserved in `originals/`. No API-key or CLI generation was used.

Open `../../public/asset-preview.html` for the gallery. Final files follow the brief's exact `public/images/`, `public/icons/`, and `public/brand/` paths. Photographs have JPG, WebP, and AVIF exports. Illustrations have editable SVG paths and matching PNG exports. Icons and brand artwork were authored as vectors; the wordmark is outlined Montserrat Alternates SemiBold. Font licenses are included in `fonts/`.

Portraits and avatars are **PLACEHOLDER — replace before launch**. They depict fictional AI-generated people, not actual practitioners or patients. This status is recorded in the manifest, image descriptions, embedded metadata, and the review gallery. Do not attach real credentials or testimonials to these images.

The illustration palette was flattened to the brief's colors, with `#BBC8D2` supplying the pale grey-blue requested in individual prompts. Transparent illustration backgrounds are preserved. Some large photographic exports are resized from the generator's native resolution; exported dimensions are not a claim of native capture resolution. Natural photographic shading and foliage remain intact; the no-gradient rule is applied to graphic fills and artificial filters.

The C2 companion uses C1 as a reference and preserves the crossed arms and framing, following the brief's requirement that only the wire changes. The mobile hero is cropped from A1, and avatars are cropped from the first five portraits. The torn edge is mirrored for a seamless horizontal join. The halftone is a deterministic seamless pattern.

`asset-manifest.json` records paths, descriptions, dimensions, placeholder status, and photographic blur data. The website-ready exports are `../../content/alt-text.ts` and `../../content/image-metadata.ts`. `validation.json` records automated export checks. Review sheets show the final exports together.
