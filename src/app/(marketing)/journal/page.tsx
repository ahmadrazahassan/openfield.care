import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Container, Section } from "@/components/layout/primitives";
import { PageHero } from "@/components/marketing/PageHero";
import { Chip } from "@/components/marketing/typography";
import { Reveal } from "@/components/marketing/Reveal";
import { CtaBand } from "@/components/marketing/sections";
import { getPosts } from "@/lib/queries";
import { JOURNAL_COVERS, IMAGE_QUALITY } from "@/content/assets";

export const metadata: Metadata = {
  title: "Journal",
  description:
    "Writing from the Openfield practice on starting therapy, burnout, sleep, relationships and grief.",
  alternates: { canonical: "/journal" },
};

export const revalidate = 3600;

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function JournalPage() {
  const posts = await getPosts();
  const [featured, ...rest] = posts;

  return (
    <>
      <PageHero
        eyebrow="Journal"
        title="Writing from the practice."
        lead="Short pieces on the things that come up most often. No listicles, no advice you have already read twice."
      />

      {featured && (
        <Section bg="paper" size="sm">
          <Container>
            <Reveal>
              <Link
                href={`/journal/${featured.slug}`}
                className="group grid gap-8 lg:grid-cols-12 lg:gap-12"
              >
                <div className="relative aspect-[16/10] overflow-hidden rounded-lg lg:col-span-7">
                  <Image
                    src={JOURNAL_COVERS[0].src}
                    alt={JOURNAL_COVERS[0].alt}
                    fill
                    priority
                    sizes="(min-width: 1024px) 58vw, 100vw"
                    placeholder={
                      JOURNAL_COVERS[0].blurDataURL ? "blur" : "empty"
                    }
                    blurDataURL={JOURNAL_COVERS[0].blurDataURL}
                    quality={IMAGE_QUALITY.feature}
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-col justify-center lg:col-span-5">
                  <div className="flex flex-wrap items-center gap-2">
                    {featured.tags.map((t) => (
                      <Chip key={t}>{t}</Chip>
                    ))}
                  </div>
                  <h2 className="mt-5 text-d2 group-hover:underline group-hover:decoration-ink-25 group-hover:underline-offset-8">
                    {featured.title}
                  </h2>
                  <p className="mt-5 measure text-lead text-ink-70">
                    {featured.excerpt}
                  </p>
                  <p className="eyebrow mt-7 text-ink-55">
                    {featured.published_at
                      ? formatDate(featured.published_at)
                      : null}
                    {featured.reading_min
                      ? ` · ${featured.reading_min} min read`
                      : null}
                  </p>
                </div>
              </Link>
            </Reveal>
          </Container>
        </Section>
      )}

      <Section bg="page">
        <Container>
          <ul className="grid gap-x-4 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((post, i) => {
              const cover = JOURNAL_COVERS[(i + 1) % JOURNAL_COVERS.length];
              return (
                <Reveal as="li" key={post.id} delay={Math.min(i, 5) * 0.06}>
                  <Link href={`/journal/${post.slug}`} className="group block">
                    <div className="relative aspect-[16/10] overflow-hidden rounded-lg">
                      <Image
                        src={cover.src}
                        alt={cover.alt}
                        fill
                        sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw"
                        placeholder={cover.blurDataURL ? "blur" : "empty"}
                        blurDataURL={cover.blurDataURL}
                        quality={IMAGE_QUALITY.feature}
                        className="object-cover"
                      />
                    </div>
                    <div className="mt-5 flex flex-wrap items-center gap-2">
                      {post.tags.map((t) => (
                        <Chip key={t}>{t}</Chip>
                      ))}
                    </div>
                    <h2 className="mt-4 text-d4 group-hover:underline group-hover:decoration-ink-25 group-hover:underline-offset-4">
                      {post.title}
                    </h2>
                    <p className="mt-2 text-sm text-ink-70">{post.excerpt}</p>
                    <p className="eyebrow mt-4 text-ink-55">
                      {post.published_at ? formatDate(post.published_at) : null}
                      {post.reading_min ? ` · ${post.reading_min} min` : null}
                    </p>
                  </Link>
                </Reveal>
              );
            })}
          </ul>
        </Container>
      </Section>

      <CtaBand />
    </>
  );
}
