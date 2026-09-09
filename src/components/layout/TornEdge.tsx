import { cn } from "@/lib/utils";
import { TEXTURE } from "@/content/assets";

/**
 * The footer tear.
 *
 * The generated texture (2880x220) has its opaque paper along the BOTTOM with
 * the ragged edge facing up, so it is flipped vertically here: paper at the
 * top, tear biting downward into the photograph beneath.
 *
 * It is used as a MASK over a page-coloured block rather than as a picture, so
 * the paper is always exactly the page background with no colour to drift.
 */
export function TornEdge({ className }: { className?: string }) {
  const mask = `url(${TEXTURE.tornEdge})`;
  return (
    <div
      aria-hidden="true"
      className={cn("h-10 w-full bg-page md:h-14", className)}
      style={{
        maskImage: mask,
        WebkitMaskImage: mask,
        maskSize: "100% 100%",
        WebkitMaskSize: "100% 100%",
        maskRepeat: "no-repeat",
        WebkitMaskRepeat: "no-repeat",
        transform: "scaleY(-1)",
      }}
    />
  );
}
