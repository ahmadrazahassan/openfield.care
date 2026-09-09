import { Container } from "@/components/layout/primitives";
import { Eyebrow } from "./typography";
import { cn } from "@/lib/utils";

/**
 * Inner-page opener. Deliberately typographic — the photography budget is
 * spent on the home page, and a quiet start suits the subject matter.
 */
export function PageHero({
  eyebrow,
  title,
  lead,
  children,
  className,
}: {
  eyebrow?: string;
  title: string;
  lead?: string;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("bg-page", className)}>
      <Container className="pb-14 pt-14 md:pb-20 md:pt-20">
        {eyebrow && <Eyebrow className="text-ink-55">{eyebrow}</Eyebrow>}
        <h1 className="mt-5 text-d1 max-w-[16ch]">{title}</h1>
        {lead && (
          <p className="mt-7 measure-lead text-lead text-ink-70">{lead}</p>
        )}
        {children && <div className="mt-9">{children}</div>}
      </Container>
    </div>
  );
}
