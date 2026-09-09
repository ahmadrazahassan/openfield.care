import { Suspense } from "react";
import Link from "next/link";
import { Logo } from "@/components/layout/Logo";
import { Container } from "@/components/layout/primitives";
import { SITE } from "@/content/site";

/**
 * Booking runs with minimal chrome: no primary nav, no footer sprawl. The only
 * links out are the logo and crisis support, which must be reachable from
 * every page including this one.
 */
export default function BookLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-page">
      <header className="bg-page">
        <Container className="flex h-[72px] items-center justify-between gap-4">
          <Logo />
          <Link
            href="/crisis-support"
            className="text-sm text-ink-55 underline underline-offset-4 hover:text-ink"
          >
            Need help now?
          </Link>
        </Container>
      </header>

      <main id="main" className="flex-1">
        <Suspense fallback={<BookingSkeleton />}>{children}</Suspense>
      </main>

      <footer className="py-10">
        <Container>
          <p className="text-center text-sm text-ink-55">
            {SITE.name} is not an emergency service.{" "}
            <Link
              href="/crisis-support"
              className="text-ink underline underline-offset-4"
            >
              Crisis support
            </Link>
          </p>
        </Container>
      </footer>
    </div>
  );
}

function BookingSkeleton() {
  return (
    <Container className="pt-16">
      <p className="text-ink-55">Loading availability…</p>
    </Container>
  );
}
