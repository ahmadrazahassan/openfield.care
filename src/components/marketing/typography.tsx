import { cn } from "@/lib/utils";
import { BlurText } from "./BlurText";

/** Micro-caps label. Montserrat Alternates, 0.14em tracking, uppercase. */
export function Eyebrow({
  children,
  className,
  dot = false,
  as: Tag = "p",
}: {
  children: React.ReactNode;
  className?: string;
  /** Leading green dot. Used on the hero pill only. */
  dot?: boolean;
  as?: React.ElementType;
}) {
  return (
    <Tag className={cn("eyebrow inline-flex items-center gap-2", className)}>
      {dot && (
        <span
          aria-hidden="true"
          className="h-1.5 w-1.5 shrink-0 rounded-pill bg-signal"
        />
      )}
      {children}
    </Tag>
  );
}

export function SectionHeading({
  eyebrow,
  children,
  lead,
  className,
  align = "left",
  level = 2,
  tone = "ink",
}: {
  eyebrow?: string;
  children: React.ReactNode;
  lead?: string;
  className?: string;
  align?: "left" | "center";
  level?: 2 | 3;
  tone?: "ink" | "page";
}) {
  const Tag = (level === 2 ? "h2" : "h3") as "h2" | "h3";
  return (
    <div
      className={cn(
        "flex flex-col gap-4",
        align === "center" && "items-center text-center",
        className,
      )}
    >
      {eyebrow && (
        <Eyebrow className={tone === "page" ? "text-page-70" : "text-ink-55"}>
          {eyebrow}
        </Eyebrow>
      )}
      {typeof children === "string" ? (
        <BlurText
          as={Tag}
          className={cn(
            "text-d2 max-w-[18ch]",
            align === "center" && "max-w-[22ch]",
            tone === "page" ? "text-page" : "text-ink",
          )}
        >
          {children}
        </BlurText>
      ) : (
        <Tag
          className={cn(
            "text-d2 max-w-[18ch]",
            align === "center" && "max-w-[22ch]",
            tone === "page" ? "text-page" : "text-ink",
          )}
        >
          {children}
        </Tag>
      )}
      {lead && (
        <p
          className={cn(
            "text-lead measure-lead",
            tone === "page" ? "text-page-70" : "text-ink-70",
          )}
        >
          {lead}
        </p>
      )}
    </div>
  );
}

/** Small bordered pill used for specialties, modalities, filters. */
export function Chip({
  children,
  className,
  tone = "ink",
}: {
  children: React.ReactNode;
  className?: string;
  tone?: "ink" | "page";
}) {
  return (
    <span
      className={cn(
        "eyebrow inline-flex items-center rounded-pill border px-2.5 py-1",
        tone === "page"
          ? "border-page-25 text-page-70"
          : "border-ink-12 text-ink-55",
        className,
      )}
    >
      {children}
    </span>
  );
}
