# Openfield — Image, Illustration & Icon Generation Brief

**Purpose of this file.** Every visual asset the Openfield website needs, as a ready-to-paste generation prompt. Filenames here are a **contract** with `02-WEBSITE-BUILD-PROMPT.md` — the build file imports these exact paths. Generate, export at the stated size, drop into `/public/...` at the stated path, done.

**Reference DNA this brief encodes:** flat editorial vector illustration (thin dark outline, flat fill, halftone, solid black shadow), monoline 24px icons, one high-concept B&W conceptual photograph, calm wide-open landscape photography, torn-paper footer edge, deep-green diagonal split.

---

## 0. How to use this file

### Tool routing

| Asset type | Recommended tool | Why |
|---|---|---|
| Landscape / editorial photography | Midjourney v7, Flux 1.1 Pro, Google Imagen | Best photographic realism + light control |
| B&W conceptual (tangled head) | Midjourney v7 (`--style raw`), Flux 1.1 Pro | Handles surreal composites cleanly |
| Flat vector illustration | Recraft V3 (Vector mode), Ideogram 3.0, Midjourney + vectorize | Recraft outputs true SVG |
| Monoline icons | **Hand-author the SVG** (spec in §D). Recraft V3 Icon mode as fallback | Generated icons are never pixel-consistent at 24px |
| Logo / wordmark | **Hand-author the SVG** (spec in §E). Never AI-generate a final logo | Type rendering + kerning must be exact |
| Textures (torn edge, grain) | Real scan or Flux, then key out to transparent PNG | Needs a genuinely irregular alpha edge |

### Global rules for every prompt in this file

1. **No gradients.** Flat fills only. If the generator adds a gradient, regenerate or flatten in post.
2. **No AI clichés.** No sparkles, no glow, no lens flare, no neural-network / circuit-board / glowing-brain imagery, no floating holographic UI, no "digital particles."
3. **No text inside generated images** unless the prompt explicitly asks for it. Typography is added in code, not baked into a JPG.
4. **No emoji, no watermarks, no signatures, no logos.**
5. **Faces:** illustrated figures are minimal-featured or faceless. Photographic figures are shot from behind, in profile, or far enough away that identity is soft — except therapist portraits (§F), which must be replaced by real people before launch.
6. **Palette discipline.** Green `#00D54B` is the only saturated colour allowed at scale, and it should occupy ≤ 8% of any illustration. Photography stays naturally desaturated; the green comes from real foliage, not a filter.

### Brand palette (paste into any prompt that accepts colour direction)

```
Ink / near-black      #131316
Page off-white        #F1F1F1
Paper white           #FFFFFF
Signal green          #00D54B   (accents only, ≤8% of frame)
Deep forest green     #0B3B22   (diagonal-split blocks, dark bands)
Warm sand             #E8E2D6   (illustration secondary surface)
Clay                  #C8563C   (single focal accent, ≤5% of frame, optional)
Mid grey              #9A9AA0   (illustration tertiary only)
```

### Universal negative prompt (append to every generation)

```
gradient, gradients, glow, neon, lens flare, bokeh sparkle, sparkles, glitter,
holographic, futuristic UI overlay, HUD, circuit board, neural network, glowing brain,
robot, AI aesthetic, cyberpunk, 3d render, plastic skin, oversaturated, HDR,
heavy vignette, motion blur, text, lettering, typography, watermark, signature,
logo, stock photo watermark, emoji, clipart, drop shadow, bevel, emboss,
busy background, cluttered composition, extra fingers, deformed hands, distorted face
```

### Aspect ratio / export cheat sheet

| Slot | Export px | Format | Notes |
|---|---|---|---|
| Full-bleed hero | 2880 × 1800 | AVIF + WebP + JPG q82 | Plus a 1200 × 1600 portrait crop for mobile |
| Editorial band | 2400 × 1400 | AVIF + WebP | |
| Square editorial | 1600 × 1600 | AVIF + WebP | |
| Footer photo | 2880 × 1100 | AVIF + WebP | Torn edge composited on top in CSS, not baked in |
| Illustration | SVG (preferred) or 1600 px PNG-24 transparent | | |
| Icon | 24 × 24 SVG | | `currentColor` only |
| Portrait | 1200 × 1500 | AVIF + WebP | |
| Avatar | 256 × 256 | WebP | |
| OG image | 1200 × 630 | JPG q85 | |

---

## 1. Asset manifest (the contract)

Generate all of these. Paths are exact.

```
public/
├─ brand/
│  ├─ openfield-wordmark.svg          E1
│  ├─ openfield-wordmark-light.svg    E1 (off-white version for dark bands)
│  ├─ openfield-mark.svg              E2  (knot → horizon line)
│  ├─ openfield-mark-light.svg        E2
│  ├─ favicon.svg / favicon-32.png / apple-touch-icon-180.png / icon-512.png   E3
│  └─ og-default.jpg                  E4
├─ images/
│  ├─ hero/
│  │  ├─ hero-open-field.jpg          A1   (home hero, ref 8 architecture)
│  │  ├─ hero-open-field-mobile.jpg   A1-m
│  │  └─ hero-consult-room.jpg        A2   (/services + /therapists hero)
│  ├─ editorial/
│  │  ├─ editorial-tangled-thoughts.jpg   C1  (ref 2 — the signature image)
│  │  ├─ editorial-loose-thread.jpg       C2  (companion: knot resolved)
│  │  ├─ editorial-bigtype-field.jpg      A3  (ref 5 — big-word band)
│  │  ├─ editorial-footer-field.jpg       A4  (ref 6 — footer)
│  │  ├─ editorial-window-light.jpg       A5  (/about)
│  │  └─ editorial-two-chairs.jpg         A6  (pricing / CTA band)
│  ├─ illustration/
│  │  ├─ illo-overwhelm.svg           B1  (ref 1 — hands-on-head + doodles)
│  │  ├─ illo-starting-line.svg       B2  (ref 4 — runners)
│  │  ├─ illo-diagonal-rider.svg      B3  (ref 7 — figure on the green diagonal)
│  │  ├─ illo-step-01-listen.svg      B4
│  │  ├─ illo-step-02-match.svg       B5
│  │  ├─ illo-step-03-continue.svg    B6
│  │  ├─ illo-empty-appointments.svg  B7  (dashboard empty state)
│  │  └─ illo-404.svg                 B8
│  ├─ texture/
│  │  ├─ texture-torn-edge.png        G1  (transparent, tiles horizontally)
│  │  └─ texture-halftone-dots.png    G2  (optional, 6% opacity max)
│  ├─ team/
│  │  ├─ therapist-01.jpg … therapist-06.jpg   F1
│  │  └─ avatar-01.jpg … avatar-05.jpg          F2 (hero stat stack)
│  └─ journal/
│     └─ journal-01.jpg … journal-06.jpg        A7
└─ icons/                              D  (24 monoline SVGs — see §D list)
```

---

## A. Photography — calm, wide, unhurried

House photographic style, applied to every prompt in this section:

```
Editorial documentary photography. Natural available light only, overcast or soft
golden late-afternoon. Muted, slightly desaturated colour with true neutral whites
and deep but open shadows. Shot on a full-frame camera with a 35mm or 50mm prime at
f/2.8–f/5.6. Fine natural film grain. Generous negative space, subject small in frame,
horizon low. Calm, quiet, unhurried mood. Absolutely no gradient filters, no HDR,
no colour grading toward teal-orange.
```

---

### A1 — Home hero: the open field
**File:** `public/images/hero/hero-open-field.jpg` · **2880 × 1800** · Sits inside a 32px-radius inset card with white overlaid headline on the left third — **the left 40% of the frame must be visually quiet enough to hold text.**

```
Editorial documentary photograph, wide open grass meadow stretching to a low horizon,
soft rolling hills far in the distance under a large calm sky with high scattered
white clouds. One person, small in frame and far away, positioned in the right third,
seen from behind, walking slowly through the grass, wearing plain neutral clothing —
soft grey or oatmeal, no logos, no bright colours. Late afternoon overcast light,
soft and even, no harsh shadows. The left 40 percent of the frame is open uncluttered
sky and empty grass with nothing to look at. Muted natural green grass, cool pale grey
blue sky, true neutral white in the clouds. Shot on full frame 35mm lens at f/4,
horizon line placed low at roughly one third from the bottom. Fine natural film grain,
gentle micro-contrast, slightly desaturated. Quiet, spacious, unhurried, room to breathe.
No people facing camera, no buildings, no roads, no fences.
--ar 8:5 --style raw
```
**Negative:** universal list **+** `crowd, buildings, road, fence, power lines, bright clothing, sunset orange sky, dramatic clouds, storm`
**Post:** export a **1200 × 1600 portrait crop** as `hero-open-field-mobile.jpg` keeping the walking figure at the lower right and the top half open for text.

---

### A2 — Consultation room (services / therapists hero)
**File:** `public/images/hero/hero-consult-room.jpg` · **2880 × 1600**

```
Editorial interior photograph of a quiet therapy consultation room, empty of people.
Two simple mid-century armchairs in oatmeal linen angled slightly toward each other,
a low light-oak side table between them holding a plain ceramic mug and a small green
potted plant. Plain off-white plaster wall. Large window on the left filling the room
with soft diffuse overcast daylight, sheer white curtain. Pale wide-plank oak floor.
One small abstract line drawing framed in thin black on the wall, far right, tiny in
frame. Minimal, uncluttered, warm but restrained. Shot on full frame 35mm at f/4,
camera at seated eye height, straight-on symmetrical composition with generous empty
wall above the chairs. Muted natural colour, fine film grain.
--ar 16:9 --style raw
```
**Negative:** universal **+** `clinical, hospital, medical equipment, couch cliché, clutter, bookshelf overload, warm orange tungsten light, people`

---

### A3 — Big-type band background (ref 5)
**File:** `public/images/editorial/editorial-bigtype-field.jpg` · **2880 × 1600** · A giant lowercase word is set over this in code. **The centre band of the frame must be low-contrast and uniform** or the type will not read.

```
Editorial documentary photograph, vast flat field of short green grass filling the
lower two thirds of the frame, wide pale sky with soft high cloud filling the upper
third, distant low mountains barely visible on the horizon in soft atmospheric haze.
A single person lying flat on their back in the grass, very small in frame, positioned
low and slightly right of centre, arms relaxed, wearing a plain mid-blue shirt and dark
trousers. Bright but overcast diffuse daylight, no harsh shadow. The middle horizontal
band of the image is even, uniform and low contrast. Shot on full frame 35mm at f/5.6,
horizon placed at the upper third. Natural muted green, soft grey-blue sky, gentle
film grain. Peaceful, expansive, still.
--ar 16:9 --style raw
```
**Negative:** universal **+** `busy foreground, flowers, trees in centre frame, high contrast, dark clouds, dramatic light`

---

### A4 — Footer photograph (ref 6)
**File:** `public/images/editorial/editorial-footer-field.jpg` · **2880 × 1100** · The torn white edge (G1) is composited on top in CSS. Footer nav columns sit over the **upper right**; keep that area calm.

```
Editorial documentary photograph, gently sloping field of mown green grass filling the
entire frame, seen from slightly above, no sky or only a sliver of pale sky at the very
top edge. One person, small in frame and seen from behind, sitting on a plain wooden
chair at a simple wooden desk placed in the middle of the field, centred horizontally
and low in the frame. Soft even overcast daylight. Uniform grass texture with subtle
mowing lines. Nothing else in the frame — no trees, no buildings, no path. Shot on full
frame 50mm at f/5.6, slightly elevated camera angle. Muted natural green, low contrast,
fine film grain. Surreal in its emptiness but completely calm and ordinary in its light.
--ar 21:8 --style raw
```
**Negative:** universal **+** `sky dominance, trees, buildings, path, road, animals, dramatic light, tilt shift`

---

### A5 — Window light (about page)
**File:** `public/images/editorial/editorial-window-light.jpg` · **1600 × 2000** (portrait)

```
Editorial photograph, soft daylight falling through a tall plain window onto an empty
off-white plaster wall and a pale oak floor. A simple linen curtain moves very slightly.
On the windowsill, one small green plant in an unglazed terracotta pot. No people.
Overcast diffuse light, gentle soft-edged shadow shapes on the wall. Extremely minimal,
two thirds of the frame is empty wall. Shot on full frame 50mm at f/2.8. Muted neutral
colour, fine natural grain, quiet and still.
--ar 4:5 --style raw
```

---

### A6 — Two chairs, close (pricing / CTA band)
**File:** `public/images/editorial/editorial-two-chairs.jpg` · **2400 × 1400**

```
Editorial photograph, tight detail crop of two simple oatmeal linen armchair arms
angled toward each other with a narrow gap of pale oak floor between them, shot from
low seated height. Shallow depth of field, background falls into soft plain off-white.
Soft overcast window light from the left. No people. Extremely minimal, calm, warm
neutral palette of oatmeal, pale oak, off-white. Shot on full frame 50mm at f/2.
Fine natural grain.
--ar 12:7 --style raw
```

---

### A7 — Journal / blog covers (×6)
**Files:** `public/images/journal/journal-01.jpg` … `journal-06.jpg` · **1600 × 1000** each

Use the shared house style above with these six subjects. Keep them all in the same muted palette so the blog index reads as one grid.

```
01  A single empty park bench seen from behind, facing a wide flat lawn, overcast morning light.
02  A close crop of two hands loosely holding a plain white ceramic mug on a pale oak table, no face visible.
03  An unmade bed with rumpled white linen beside a window, soft grey early daylight, no person.
04  A narrow gravel path through short grass disappearing over a low rise, no destination visible.
05  A plain notebook and one pencil on an off-white desk, shot straight down, large empty margin.
06  Rain on a plain window pane with a soft out-of-focus green field beyond, no reflections of people.
```
Append to each: `Editorial documentary photograph, natural overcast light, muted desaturated colour, generous negative space, full frame 50mm at f/2.8, fine film grain, calm and quiet. --ar 8:5 --style raw`

---

## B. Flat editorial illustration

House illustration style — **paste this block into every B prompt**:

```
Flat vector editorial illustration in a contemporary Scandinavian editorial style.
Flat solid fills only, absolutely no gradients and no shading blends. Thin consistent
dark outline in near-black #131316 at a uniform weight, drawn with a slightly loose
hand-drawn quality. Figures are stylised with minimal or no facial features. Solid
flat black cast shadows as simple abstract shapes. Optional fine halftone dot texture
on one or two shapes only. Strictly limited palette: near-black #131316, off-white
#F1F1F1, warm sand #E8E2D6, signal green #00D54B used sparingly on a single small
element, and clay #C8563C on at most one accent. Flat off-white background with large
areas of empty space. Clean, calm, confident, editorial — like a European magazine
illustration or a public-health campaign poster. No 3D, no texture brushes, no
watercolour, no cartoon exaggeration, no text.
```

---

### B1 — Overwhelm (ref 1)
**File:** `public/images/illustration/illo-overwhelm.svg` · Used in "What we help with" / anxiety service page. Square, 1:1.

```
[HOUSE ILLUSTRATION STYLE]
Subject: a single stylised person from the chest up, facing forward, both hands raised
and pressed flat against the sides of their head, elbows out. Simple minimal face —
two small dot eyes and one small worried open mouth, nothing more. Plain long-sleeved
top in pale grey-blue, hair as one solid flat dark shape. Around the head, floating in
the empty space and drawn as loose hand-drawn line doodles in near-black: one tight
scribbled ball of tangled line at the upper left, one small oval speech bubble at the
left containing a simple down-pointing thumb, one small oval speech bubble at the right
containing a small cracked heart, two angular lightning bolt marks at the upper right,
one small exclamation mark and one spiral scribble above the head. The doodles are
outline only, no fill, evenly spaced, never touching the figure. Centred composition,
generous margin, flat off-white #F1F1F1 background.
--ar 1:1
```
**Negative:** universal **+** `detailed face, realistic hair, gradient, shading, 3d, crying, tears, dramatic`
**Post:** deliver as SVG. Ensure every doodle is a separate path so a green accent can be swapped in code.

---

### B2 — The starting line (ref 4) — hero of the "personalised care" section
**File:** `public/images/illustration/illo-starting-line.svg` · **1:1**, this is the most detailed illustration in the set.

```
[HOUSE ILLUSTRATION STYLE]
Subject: three stylised runners crouched in identical sprint-start position on a running
track, seen from a high three-quarter isometric angle looking down at the ground plane.
The track is drawn as a flat off-white surface with thin near-black outlines marking
three lanes, and the numerals 1, 2 and 3 drawn as thin outlined shapes on the lane
surface, receding in perspective toward the upper left. The three runners are staggered
diagonally, one per lane, all facing the same direction, fingertips down on the line.
Each runner is faceless or has only a single small eye mark. Each wears a different
flat outfit from the limited palette — one in a fine halftone dot patterned top with
clay trousers, one in a warm sand top with green trousers, one in a plain off-white top
with pale blue shorts. Each runner casts one solid flat black abstract shadow shape
directly beneath them. Flat off-white background, large empty margin on all sides,
no sky, no crowd, no stadium.
--ar 1:1
```
**Negative:** universal **+** `stadium, crowd, sky, realistic anatomy, muscle detail, motion lines, speed blur, gradient track`

---

### B3 — Diagonal rider (ref 7) — sits on the deep-green diagonal split
**File:** `public/images/illustration/illo-diagonal-rider.svg` · **Wide, ~3:2, transparent background** — the diagonal itself is drawn in CSS, this is the figure only.

```
[HOUSE ILLUSTRATION STYLE]
Subject: a single stylised person riding a skateboard, drawn in profile facing right,
body leaning forward with one arm extended back and one forward, knees bent, in a
relaxed confident glide. Loose oversized clothing — a plain off-white top and wide
signal-green trousers, flat fills, thin near-black outline. Simple round head with a
small flat cap, no facial features except one small dot eye. Legs drawn as long smooth
curved shapes rather than anatomically correct. The skateboard is a simple thin shape
with two small wheels. The figure is angled as if travelling downhill at roughly 15
degrees. Beside the figure, two very small loose line doodles: a tiny four-line sun
mark and one small curled leaf on a stem. Transparent background, no ground line,
no shadow.
--ar 3:2
```
**Post:** export with a transparent background so it can be positioned across the CSS diagonal seam.

---

### B4–B6 — "How it works" triptych
Three illustrations that must read as a set: same figure proportions, same margin, same palette weighting. **Square, 1:1, transparent background.**

**B4 — `illo-step-01-listen.svg`**
```
[HOUSE ILLUSTRATION STYLE]
Subject: two stylised figures seated facing each other in profile on simple flat chairs,
one leaning slightly forward listening, the other with hands open in front of them
talking. Between them, one simple oval speech bubble drawn in outline only containing
a single loose scribble line. No facial features beyond one small dot eye each. One
figure in warm sand, one in pale grey-blue, one small signal-green accent on a single
chair. Solid flat black shadow shapes under both chairs. Transparent background,
generous even margin.
--ar 1:1
```

**B5 — `illo-step-02-match.svg`**
```
[HOUSE ILLUSTRATION STYLE]
Subject: two simple flat puzzle-piece shapes drawn with thin near-black outline, one in
warm sand and one in signal green, positioned side by side almost interlocking but not
yet joined, with a small gap between them. Beside them, one very small stylised standing
figure in off-white seen from behind, looking toward the two shapes. Composition is
mostly empty space. Transparent background.
--ar 1:1
```

**B6 — `illo-step-03-continue.svg`**
```
[HOUSE ILLUSTRATION STYLE]
Subject: one continuous loose hand-drawn line in near-black that begins at the lower
left as a tight tangled scribbled knot and gradually unwinds as it travels right,
becoming a single calm gentle wave and finally a perfectly straight horizontal line
that exits the right edge of the frame. One small stylised figure in off-white walking
along the straight section of the line, seen from the side, tiny in scale. A single
small signal-green dot marks the point where the tangle resolves into the smooth line.
Transparent background, wide empty space above and below the line.
--ar 1:1
```
> B6 is the visual thesis of the brand. Get this one right — it is reused as the loading indicator and the section divider motif.

---

### B7 — Empty state (client dashboard, no appointments)
**File:** `public/images/illustration/illo-empty-appointments.svg` · **1:1**, transparent
```
[HOUSE ILLUSTRATION STYLE]
Subject: one simple flat calendar rectangle drawn in thin near-black outline with a
plain grid of empty squares, tilted very slightly. One small signal-green dot sits on
a single square. Beside the calendar, one tiny stylised plant in a warm sand pot.
Mostly empty space. Transparent background.
--ar 1:1
```

### B8 — 404
**File:** `public/images/illustration/illo-404.svg` · **1:1**, transparent
```
[HOUSE ILLUSTRATION STYLE]
Subject: one small stylised figure seen from behind standing at the end of a thin
hand-drawn path line that simply stops in empty space. The figure is in off-white with
a near-black outline, standing still with hands at their sides. A single small
signal-green dot floats slightly ahead of where the path ends. Vast empty background.
Transparent background.
--ar 1:1
```

---

## C. Conceptual black & white photography

This is the brand's signature editorial moment. **Exactly one** of these appears on the homepage. It is monochrome on purpose — it is the only image on the site with no colour, which is what makes it land.

### C1 — Tangled thoughts (ref 2)
**File:** `public/images/editorial/editorial-tangled-thoughts.jpg` · **1600 × 1600**

```
Fine art black and white conceptual portrait photograph. A person from the chest up
standing in a plain crisp white button-down shirt with a plain black tie, arms folded
loosely across the chest. In place of the head there is a huge dense sculptural tangle
of thin black cable and wire, coiled and looped chaotically into a rough sphere roughly
three times the size of a human head, with individual loops trailing outward into the
surrounding space. The tangle is lit so that individual strands are crisp and separable.
Plain seamless light grey studio backdrop, soft even large-softbox lighting from the
front left, gentle falloff to a slightly darker grey at the edges. Square composition,
subject centred, shoulders visible at the bottom edge. High detail on the wire, clean
neutral monochrome with full tonal range from soft white to deep black. Shot on medium
format, 80mm, f/8. Surreal, calm, editorial — unsettling but never frightening.
--ar 1:1 --style raw
```
**Negative:** universal **+** `horror, scary, gore, screaming, colour, coloured wires, electronics, circuit board, plug, robot, cyborg, glowing`

### C2 — The loose thread (companion, optional but recommended)
**File:** `public/images/editorial/editorial-loose-thread.jpg` · **1600 × 1600** · Used as the "after" state in a hover/scroll pair with C1.

```
Fine art black and white conceptual portrait photograph, identical framing, lighting
and wardrobe to a companion image: a person from the chest up in a plain crisp white
button-down shirt and plain black tie, arms relaxed at their sides, plain seamless
light grey studio backdrop, soft even large-softbox lighting from the front left.
In place of the head there is a single thin black cable that loops once, gently and
loosely, into one calm open curve, with both ends trailing softly out of frame.
Almost no tangle at all — just one clean loop. Square composition, subject centred.
Clean neutral monochrome, medium format, 80mm, f/8. Calm, resolved, quiet.
--ar 1:1 --style raw
```
> **Match C1 and C2 by using image-reference / character-reference on the same seed** so the shirt, tie, body position, backdrop and lighting are identical. The only thing that changes is the wire.

---

## D. Monoline icon system

**Author these as SVG by hand or with a vector tool. Do not ship AI-generated raster icons.** The spec below is what makes them look like ref 3.

### Icon spec (non-negotiable)
```
viewBox            0 0 24 24
Stroke width       1.5   (uniform, never varied within an icon)
Stroke colour      currentColor
Fill               none  (no filled shapes anywhere)
Linecap            round
Linejoin           round
Safe margin        2px on all sides — artwork lives inside a 20×20 box
Corner radius      2px minimum on any rectangle
Construction       Geometric, built from circles, rounded rects and straight segments.
                   Aligned to a 1px grid at 24px so strokes stay crisp.
Detail budget      Maximum 6 paths per icon. If it needs more, simplify it.
Style              Calm, human, slightly rounded. Not technical, not medical.
No decoration      No sparkles, no zap/lightning, no stars, no plus-badges, no motion
                   lines, no glow, no duotone, no fill accents.
```

### The 24 icons to produce

`public/icons/` — kebab-case filenames, exported as React components in `components/icons/`.

**Concerns (used in "What we help with")**
| File | Drawing |
|---|---|
| `anxiety.svg` | A head shown in outline profile with three small concentric arcs inside where the mind sits |
| `low-mood.svg` | A simple circle with one gentle downward-curving line inside, and one small circle offset above |
| `burnout.svg` | A simple candle shape with a small flame outline and one short curl of smoke |
| `relationships.svg` | Two overlapping circles of equal size with the overlap left open |
| `grief.svg` | A heart outline drawn as one continuous line with a small gap on the upper left |
| `sleep.svg` | A crescent moon outline with three short horizontal lines of decreasing length beside it |
| `trauma.svg` | A circle with one clean vertical break through it and a small arc bridging the break |
| `focus.svg` | Three concentric circles with a single small dot at the centre |
| `self-esteem.svg` | A small figure outline standing on a simple horizontal platform line |
| `stress.svg` | A rounded square being gently compressed, with two short arrows pointing inward |
| `couples.svg` | Two simple seated figure outlines facing each other with a small gap between |
| `teens.svg` | One small figure outline and one larger figure outline standing side by side |

**Product & flow**
| File | Drawing |
|---|---|
| `session-video.svg` | A rounded rectangle with a simple triangular play notch on the right side |
| `session-in-person.svg` | Two simple chair outlines facing each other |
| `session-phone.svg` | A rounded rectangle handset outline with one soft arc beside it |
| `calendar.svg` | A rounded rectangle with a top rule line and two short vertical tabs above |
| `clock.svg` | A circle with two straight hands at roughly 10 and 2 |
| `privacy.svg` | A simple shield outline with one small horizontal line across the centre |
| `notes.svg` | A rounded rectangle page with three short horizontal lines and one folded corner |
| `growth.svg` | Three short vertical bars of increasing height on a baseline, rounded tops |
| `breathing.svg` | Three concentric rounded shapes expanding outward from a centre point |
| `matching.svg` | Two simple puzzle-piece outlines beside one another, not joined |
| `assessment.svg` | A clipboard outline with one small check mark inside |
| `follow-up.svg` | A circular arrow drawn as one open arc with a small arrowhead |

### Fallback generation prompt (only if hand-authoring is not possible)
Generate as **one sheet**, then vectorize and clean each icon individually.

```
A clean icon sheet on a pure white background, arranged in a perfectly even 4 by 6 grid
with generous equal spacing between cells. Twenty-four minimal line icons, monoline
style, uniform thin black stroke of consistent weight throughout, no fill anywhere,
rounded stroke caps and rounded corners, geometric construction, each icon occupying
the same optical size within its cell and centred. Simple, calm, human, contemporary.
No labels, no text, no numbers, no frames or boxes around the icons, no shadows,
no colour, no gradient, no sparkle or star or lightning shapes.
--ar 2:3
```
**Post:** vectorize each cell separately → normalise to a 24×24 viewBox → set `stroke-width="1.5"`, `stroke="currentColor"`, `fill="none"`, `stroke-linecap="round"`, `stroke-linejoin="round"` → delete every `<rect>` background → optimise with SVGO → verify optically at 20px, 24px and 32px.

---

## E. Brand identity

### E1 — Wordmark
**Files:** `public/brand/openfield-wordmark.svg` (ink `#131316`), `openfield-wordmark-light.svg` (off-white `#F1F1F1`)

**Do not AI-generate this. Set it as type and outline it.**

```
Word:            openfield
Case:            all lowercase
Typeface:        Montserrat Alternates, SemiBold (600)
Tracking:        -0.02em
Terminal:        a solid full stop immediately after the "d", set in Signal green #00D54B,
                 optically sized to match the x-height dot of the "i"
Baseline:        flat, no italics, no custom ligatures
Clearspace:      minimum of one "o" width on all four sides
Minimum size:    88px wide on screen, 24mm wide in print
Export:          outlined paths, single compound path per colour, viewBox tight to the ink
```
The green full stop is the only place the brand mark uses colour. It is the entire logo system's signature — never render the wordmark fully green, never reverse it, never outline it.

### E2 — Symbol / app mark
**Files:** `public/brand/openfield-mark.svg`, `openfield-mark-light.svg` · **Square, 24×24 and 512×512 masters**

```
Concept:  a single continuous line that enters at the left as a small tight tangled knot,
          unwinds through one gentle wave, and exits right as a perfectly straight
          horizon line. Tangle → clarity. Same idea as illustration B6, reduced to a mark.

Construction:
  - One single continuous open path. No breaks, no separate shapes.
  - Stroke 1.5 at 24px (scales to 32 at 512px), currentColor, round caps, round joins.
  - The knot occupies the left third and contains exactly 3 crossings — no more, or it
    turns to mush at favicon size.
  - The straight section occupies the right third and is perfectly horizontal.
  - Optically centred in the square with a 2px safe margin at 24px.
  - Optional: one 1.5px solid dot in Signal green #00D54B placed exactly at the point
    where the wave becomes straight. Omit the dot in the 24px favicon version.

Test:     must remain readable as "knot resolving into a line" at 16×16px.
```

### E3 — Favicon set
Derived from E2, hand-tuned per size — do not just downscale.
```
favicon.svg              vector, currentColor, respects prefers-color-scheme
favicon-32.png           32×32, knot simplified to 2 crossings, no green dot
apple-touch-icon-180.png 180×180, ink mark on a solid #F1F1F1 square, 20% padding
icon-512.png             512×512, maskable, ink mark on solid #F1F1F1, 20% safe padding
```

### E4 — Default Open Graph image
**File:** `public/brand/og-default.jpg` · **1200 × 630** · Composite in code or a design tool, not generated.
```
Background:  solid #F1F1F1, absolutely flat, no texture, no gradient
Mark:        openfield wordmark (E1) in #131316, left-aligned, 72px cap height,
             positioned at x=80 y=80
Headline:    "Room to think." — DM Sans, 84px, weight 500, tracking -0.03em, #131316,
             left-aligned, baseline at y=390
Rule:        1px horizontal line in rgba(19,19,22,0.12) spanning x=80 to x=1120 at y=470
Micro:       "LICENSED THERAPY · BOOK IN MINUTES" — Montserrat Alternates 500, 20px,
             tracking 0.14em, uppercase, rgba(19,19,22,0.55), at x=80 y=520
Accent:      one 16px solid circle in #00D54B at x=1064 y=512
```
Per-page OG images should follow the same template with the page title swapped in. Generate these dynamically with `next/og` — see the build file.

---

## F. People

> **Compliance note — read before generating.** Openfield is a healthcare brand. Presenting AI-generated faces as named, credentialled clinicians is misleading and in several jurisdictions unlawful. Generate these **as layout placeholders only**, watermark them internally as `PLACEHOLDER`, and replace every one with a photograph of the real practitioner before the site goes live. The same applies to testimonial avatars — no invented patients.

### F1 — Practitioner portraits (×6)
**Files:** `public/images/team/therapist-01.jpg` … `therapist-06.jpg` · **1200 × 1500 (4:5)**

One shared prompt, varied per person. Consistency across the six matters more than any individual frame — same backdrop, same light, same crop, same wardrobe register.

```
Editorial portrait photograph of a professional adult, waist-up, standing, body angled
slightly and face turned to camera with a calm neutral-warm expression, mouth closed or
a very slight natural smile. Plain seamless warm off-white studio backdrop, completely
even, no texture. Large softbox key light from the front left at 45 degrees with a
gentle fill on the right, soft open shadows, no hard edges. Wardrobe is plain, quiet
and unbranded — a soft knit, a plain shirt or a simple blazer in oatmeal, warm grey,
soft sage or deep navy. No patterns, no jewellery beyond something very small, no logos.
Framed with generous headroom and empty backdrop on the left third. Shot on medium
format, 110mm, f/4. Muted natural colour, true skin tones, fine natural grain, no
retouching gloss, visible natural skin texture.
--ar 4:5 --style raw
```
**Vary per portrait** (keep everything else identical): `woman in her 40s, short dark curls` · `man in his 50s, greying beard, glasses` · `woman in her 30s, long straight black hair` · `man in his 30s, close-cropped hair` · `woman in her 60s, silver bob` · `person in their 40s, shoulder-length auburn hair`

**Negative:** universal **+** `stock photo smile, teeth, crossed arms, folded-arms pose, white coat, stethoscope, office background, bookshelf, corporate headshot lighting, heavy retouching, beauty filter, plastic skin`

### F2 — Hero avatar stack (×5)
**Files:** `public/images/team/avatar-01.jpg` … `avatar-05.jpg` · **256 × 256**

Not new generations — **crop these from the F1 portraits**: square, centred on the face, eyes at ~40% height. They are rendered at 40px in an overlapping ring, so crop tight and check legibility at that size. The stack sits beside the "12,400+ sessions held" stat in the hero.

---

## G. Textures & composites

### G1 — Torn paper edge (ref 6)
**File:** `public/images/texture/texture-torn-edge.png` · **2880 × 220, transparent PNG-24**

Best result: tear a real sheet of white paper, scan at 600dpi, key out the background. If generating:
```
A single horizontal strip showing the torn deckled edge of a sheet of plain white paper
against a solid pure black background. The paper occupies the bottom portion of the
strip with a completely flat white surface and no texture or shadow; the top edge is
irregularly torn with fine soft paper fibres visible along the tear. Even flat lighting,
no shadow, no depth, no curl. Photographed straight on from directly above.
--ar 16:1
```
**Post:** key the black to transparent, invert so the **paper is the alpha** and the torn edge is the boundary. Make it horizontally tileable by mirroring one end. Recolour the paper to `#F1F1F1` in CSS via a mask, so it always matches the page background exactly.

### G2 — Halftone dot texture (optional)
**File:** `public/images/texture/texture-halftone-dots.png` · **1024 × 1024, tileable, transparent**
```
A perfectly regular seamless tiling grid of small solid black dots of uniform size on a
transparent background, evenly spaced, no variation in size or opacity, no gradient,
no noise, aligned to a strict square grid at a 45 degree rotation.
--ar 1:1 --tile
```
Use at **6% opacity maximum**, and only inside illustration shapes or one dark band. Never across the whole page.

---

## H. Post-production checklist (run on every asset before commit)

- [ ] Opened in an editor and confirmed **zero gradients**. Sample 3 points across any large area — if the values differ, flatten it.
- [ ] No baked-in text, watermark, signature or logo anywhere in the frame.
- [ ] Photography colour-matched across the set: same white balance, same shadow depth. Check by laying all photos in one grid.
- [ ] Illustration colours snapped to the exact brand hexes — no `#00D64C`, no `#131317`.
- [ ] Green coverage measured at ≤ 8% of frame in illustrations, ≤ 5% in photography.
- [ ] SVGs run through SVGO; `fill="none"` / `stroke="currentColor"` on all icons; no `<style>` blocks, no inline `id` collisions.
- [ ] Rasters exported as AVIF + WebP + JPG fallback; every hero under **220 KB** in AVIF.
- [ ] Every image has meaningful alt text written and recorded in `content/alt-text.ts` (the build file consumes this).
- [ ] Portraits and avatars flagged `PLACEHOLDER — replace before launch` in the asset tracker.
- [ ] `blurDataURL` generated for every photographic asset (`plaiceholder` or `sharp`) and stored alongside the path.
- [ ] Faces and identifiable people: confirmed we hold rights, or the asset is marked placeholder.

---

## I. Prompt variables (for batch runs)

If you are scripting generation, these are the reusable fragments:

```
{HOUSE_PHOTO}  = "Editorial documentary photography. Natural available light only,
                  overcast or soft late-afternoon. Muted, slightly desaturated colour,
                  true neutral whites, deep but open shadows. Full frame, 35mm or 50mm
                  prime at f/2.8–f/5.6. Fine natural film grain. Generous negative space,
                  subject small in frame. Calm, quiet, unhurried."

{HOUSE_ILLO}   = "Flat vector editorial illustration, Scandinavian editorial style. Flat
                  solid fills only, no gradients, no shading. Uniform thin near-black
                  #131316 outline with a loose hand-drawn quality. Stylised figures with
                  minimal or no facial features. Solid flat black abstract cast shadows.
                  Palette limited to #131316, #F1F1F1, #E8E2D6, #00D54B (sparingly),
                  #C8563C (one accent max). Large areas of empty space."

{NEG}          = [universal negative prompt, §0]

{PALETTE}      = "#131316 near-black, #F1F1F1 off-white, #00D54B signal green,
                  #0B3B22 deep forest, #E8E2D6 warm sand"
```

---

**End of image brief.** Every path in §1 is referenced by `02-WEBSITE-BUILD-PROMPT.md`. If you rename an asset, rename it in both files.
