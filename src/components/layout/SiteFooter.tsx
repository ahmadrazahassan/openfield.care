import Image from "next/image";
import Link from "next/link";
import { Logo } from "./Logo";
import { Container, Scrim } from "./primitives";
import { TornEdge } from "./TornEdge";
import { ScrollMedia } from "@/components/marketing/ScrollMedia";
import { FOOTER_NAV, SITE } from "@/content/site";
import { PHOTO, IMAGE_QUALITY } from "@/content/assets";

export function SiteFooter() {
  const photo = PHOTO.footerField;

  return (
    <footer className="relative isolate bg-page">
      <div className="relative min-h-[520px] overflow-hidden pb-8 pt-4 md:min-h-[560px]">
        {/* The page tears away over the photograph to reveal it. */}
        <div className="absolute inset-x-0 top-0 z-20">
          <TornEdge />
        </div>

        <ScrollMedia travel={5}>
          <Image
            src={photo.src}
            alt=""
            fill
            sizes="100vw"
            quality={IMAGE_QUALITY.max}
            placeholder={photo.blurDataURL ? "blur" : "empty"}
            blurDataURL={photo.blurDataURL}
            className="-z-20 object-cover object-bottom"
          />
        </ScrollMedia>
        <Scrim strong />

        <Container className="on-dark relative z-10 flex h-full flex-col pt-10 md:pt-14">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-8">
            {/* Identity */}
            <div className="lg:col-span-4">
              <Logo light />
              <p className="mt-4 max-w-[34ch] text-sm text-on-image/85">
                Licensed therapy and consultation. Room to think.
              </p>
            </div>

            {/* Nav columns */}
            <nav
              aria-label="Footer"
              className="grid grid-cols-2 gap-8 sm:grid-cols-4 lg:col-span-8"
            >
              {FOOTER_NAV.map((col) => (
                <div key={col.heading}>
                  <h2 className="eyebrow text-on-image/70">{col.heading}</h2>
                  <ul className="mt-4 flex flex-col gap-2.5">
                    {col.links.map((link) => (
                      <li key={link.href}>
                        <Link
                          href={link.href}
                          className="text-sm text-on-image transition-opacity duration-fast hover:opacity-70"
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </nav>
          </div>

          {/* Pushes the legal block to the bottom, keeping the middle of the
              photograph clear. */}
          <div className="mt-auto pt-24">
            <p className="text-center text-sm text-on-image/85">
              {SITE.name} is not an emergency service. If you need help right
              now, see{" "}
              <Link
                href="/crisis-support"
                className="underline underline-offset-4 hover:opacity-70"
              >
                crisis support
              </Link>
              .
            </p>
            <p className="eyebrow mt-5 text-center text-on-image/60">
              © {SITE.foundedYear} {SITE.legalName} All rights reserved.
            </p>
          </div>
        </Container>
      </div>
    </footer>
  );
}
