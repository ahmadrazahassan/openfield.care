import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Container, Section } from "@/components/layout/primitives";
import { Chip } from "@/components/marketing/typography";
import { CtaBand } from "@/components/marketing/sections";
import { getPost, getPosts } from "@/lib/queries";
import { getStaticSlugs } from "@/lib/supabase/static";
import { JOURNAL_COVERS } from "@/content/assets";
import { SITE } from "@/content/site";

export const revalidate = 3600;

export async function generateStaticParams() {
  return getStaticSlugs("posts");
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: "Not found" };
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `/journal/${post.slug}` },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.excerpt,
      publishedTime: post.published_at ?? undefined,
    },
  };
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  const all = await getPosts();
  const index = all.findIndex((p) => p.id === post.id);
  const cover = JOURNAL_COVERS[Math.max(index, 0) % JOURNAL_COVERS.length];
  const related = all.filter((p) => p.id !== post.id).slice(0, 3);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.published_at,
    publisher: { "@type": "Organization", name: SITE.name, url: SITE.url },
    mainEntityOfPage: `${SITE.url}/journal/${post.slug}`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Section bg="page" size="sm">
        <Container>
          <Link
            href="/journal"
            className="text-sm text-ink-55 underline underline-offset-4 hover:text-ink"
          >
            All writing
          </Link>

          <article className="mx-auto mt-10 max-w-[68ch]">
            <div className="flex flex-wrap items-center gap-2">
              {post.tags.map((t) => (
                <Chip key={t}>{t}</Chip>
              ))}
            </div>

            <h1 className="mt-6 text-d1">{post.title}</h1>

            <p className="eyebrow mt-7 text-ink-55">
              {post.published_at ? formatDate(post.published_at) : null}
              {post.reading_min ? ` · ${post.reading_min} min read` : null}
            </p>

            <div className="relative mt-12 aspect-[16/10] overflow-hidden rounded-lg">
              <Image
                src={cover.src}
                alt={cover.alt}
                fill
                priority
                sizes="(min-width: 768px) 68ch, 100vw"
                placeholder={cover.blurDataURL ? "blur" : "empty"}
                blurDataURL={cover.blurDataURL}
                className="object-cover"
              />
            </div>

            <p className="mt-12 text-lead text-ink">{post.excerpt}</p>

            <div className="mt-8 flex flex-col gap-6">
              {post.body.map((para, i) => (
                <p key={i} className="text-ink-70">
                  {para}
                </p>
              ))}
            </div>

            <div className="mt-14 rounded-lg border border-ink-12 p-7">
              <p className="text-sm text-ink-70">
                Writing is not a substitute for care. If any of this is live for
                you right now, a first consultation costs nothing.{" "}
                <Link
                  href="/book"
                  className="text-ink underline underline-offset-4"
                >
                  Book one
                </Link>
                , or see{" "}
                <Link
                  href="/crisis-support"
                  className="text-ink underline underline-offset-4"
                >
                  crisis support
                </Link>{" "}
                if you need someone now.
              </p>
            </div>
          </article>
        </Container>
      </Section>

      {related.length > 0 && (
        <Section bg="paper">
          <Container>
            <h2 className="text-d3">More from the journal</h2>
            <ul className="mt-10 grid gap-x-4 gap-y-10 sm:grid-cols-3">
              {related.map((p) => {
                const c =
                  JOURNAL_COVERS[
                    (all.findIndex((x) => x.id === p.id) + 1) %
                      JOURNAL_COVERS.length
                  ];
                return (
                  <li key={p.id}>
                    <Link href={`/journal/${p.slug}`} className="group block">
                      <div className="relative aspect-[16/10] overflow-hidden rounded-lg">
                        <Image
                          src={c.src}
                          alt={c.alt}
                          fill
                          sizes="(min-width: 640px) 30vw, 100vw"
                          placeholder={c.blurDataURL ? "blur" : "empty"}
                          blurDataURL={c.blurDataURL}
                          className="object-cover"
                        />
                      </div>
                      <h3 className="mt-4 text-d4 group-hover:underline group-hover:decoration-ink-25 group-hover:underline-offset-4">
                        {p.title}
                      </h3>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </Container>
        </Section>
      )}

      <CtaBand />
    </>
  );
}
