import "server-only";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { env, serverEnv } from "@/lib/env";
import type { DatabaseWithSheetsSync } from "@/types/sheets-sync";

/**
 * SERVICE ROLE — bypasses RLS entirely.
 *
 * This module is the only place the service key may be referenced (enforced by
 * scripts/check-constraints.mjs). Use it only for work that genuinely has no
 * user session: cron jobs, webhooks, admin reporting. Booking and account
 * mutations must go through lib/supabase/server.ts so RLS applies.
 */
export function createAdminClient() {
  const { SUPABASE_SERVICE_ROLE_KEY } = serverEnv();
  return createSupabaseClient<DatabaseWithSheetsSync>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
