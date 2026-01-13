import { db } from "../db";
import { appSettings } from "../db/schema";
import { eq } from "drizzle-orm";

const MNEMO_BASE =
  "https://nlnpmdkhcgpybrohmemy.supabase.co/functions/v1";
const MNEMO_API_KEY = "MV17TgvhqHgg5PC0XKvkBOIlWGM9lMoA";

function getPersonalToken(): string | null {
  const row = db
    .select()
    .from(appSettings)
    .where(eq(appSettings.key, "mnemoApiToken"))
    .get();
  return row?.value || null;
}

function buildHeaders(): Record<string, string> {
  const token = getPersonalToken();
  if (token) {
    return { Authorization: `Bearer ${token}` };
  }
  return { "x-api-key": MNEMO_API_KEY };
}

export async function mnemoFetch<T>(
  endpoint: string,
  params?: Record<string, string>
): Promise<{ data: T[]; count: number }> {
  const url = new URL(`${MNEMO_BASE}/public-api${endpoint}`);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, value);
    }
  }

  const res = await fetch(url.toString(), { headers: buildHeaders() });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Mnemo API error ${res.status}: ${text}`);
  }

  return res.json();
}

export async function mnemoUserFetch<T>(
  endpoint: string,
  params?: Record<string, string>
): Promise<T> {
  const token = getPersonalToken();
  if (!token) {
    throw new Error("Personal API token required. Set it in Settings.");
  }

  const url = new URL(`${MNEMO_BASE}/user-api${endpoint}`);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, value);
    }
  }

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Mnemo User API error ${res.status}: ${text}`);
  }

  return res.json();
}

export function hasPersonalToken(): boolean {
  return !!getPersonalToken();
}
