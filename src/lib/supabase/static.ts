import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";
import type { Database } from "@/types/database.types";

/**
 * Cookieless anon client for contexts that run without an HTTP request —
 * generateStaticParams, sitemap, and other build-time work.
 *
 * It still carries only the anon key, so the public-read RLS policies apply
 * exactly as they do for a visitor. This is NOT a way around RLS; use
 * lib/supabase/server.ts anywhere a user session exists.
 */
export function createStaticClient() {
  return createSupabaseClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}

type SlugParam = { slug: string };

/** Slugs for generateStaticParams. Branches per table so the row type narrows. */
export async function getStaticSlugs(
  table: "services" | "therapists" | "posts",
): Promise<SlugParam[]> {
  const supabase = createStaticClient();

  if (table === "posts") {
    const { data } = await supabase
      .from("posts")
      .select("slug")
      .not("published_at", "is", null);
    return (data ?? []).map((r) => ({ slug: r.slug }));
  }

  if (table === "therapists") {
    const { data } = await supabase
      .from("therapists")
      .select("slug")
      .eq("is_active", true);
    return (data ?? []).map((r) => ({ slug: r.slug }));
  }

  const { data } = await supabase
    .from("services")
    .select("slug")
    .eq("is_active", true);
  return (data ?? []).map((r) => ({ slug: r.slug }));
}
