import { NextResponse } from "next/server";

interface GuestbookEntry {
  id: string;
  name: string;
  message: string;
  createdAt: string;
}

const guestbookEntries: GuestbookEntry[] = [];

const MAX_NAME_LENGTH = 60;
const MAX_MESSAGE_LENGTH = 500;
const MAX_ENTRIES = 200;

export const dynamic = "force-dynamic";

function sanitize(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function getSupabaseConfig() {
  const url = process.env.SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || process.env.SUPABASE_KEY?.trim();

  if (!url || !key) return null;
  return { url, key };
}

async function listFromSupabase(): Promise<GuestbookEntry[] | null> {
  const config = getSupabaseConfig();
  if (!config) return null;

  const response = await fetch(
    `${config.url}/rest/v1/guestbook_entries?select=id,name,message,created_at&order=created_at.desc&limit=${MAX_ENTRIES}`,
    {
      headers: {
        apikey: config.key,
        Authorization: `Bearer ${config.key}`
      },
      cache: "no-store"
    }
  );

  if (!response.ok) {
    return null;
  }

  const rows = (await response.json()) as Array<{
    id: string;
    name: string;
    message: string;
    created_at: string;
  }>;

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    message: row.message,
    createdAt: row.created_at
  }));
}

async function insertIntoSupabase(name: string, message: string): Promise<GuestbookEntry | null> {
  const config = getSupabaseConfig();
  if (!config) return null;

  const response = await fetch(`${config.url}/rest/v1/guestbook_entries`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: config.key,
      Authorization: `Bearer ${config.key}`,
      Prefer: "return=representation"
    },
    body: JSON.stringify([{ name, message }])
  });

  if (!response.ok) {
    return null;
  }

  const rows = (await response.json()) as Array<{
    id: string;
    name: string;
    message: string;
    created_at: string;
  }>;
  const row = rows[0];
  if (!row) return null;

  return {
    id: row.id,
    name: row.name,
    message: row.message,
    createdAt: row.created_at
  };
}

export async function GET() {
  const supabaseEntries = await listFromSupabase();
  if (supabaseEntries) {
    return NextResponse.json({ entries: supabaseEntries });
  }
  return NextResponse.json({ entries: guestbookEntries });
}

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null);
  const name = sanitize(payload?.name);
  const message = sanitize(payload?.message);

  if (!message) {
    return NextResponse.json({ error: "Message is required." }, { status: 400 });
  }

  if (name.length > MAX_NAME_LENGTH || message.length > MAX_MESSAGE_LENGTH) {
    return NextResponse.json({ error: "Entry is too long." }, { status: 400 });
  }

  const normalizedName = name || "anonymous";

  const persistedEntry = await insertIntoSupabase(normalizedName, message);
  if (persistedEntry) {
    return NextResponse.json({ entry: persistedEntry }, { status: 201 });
  }

  const entry: GuestbookEntry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: normalizedName,
    message,
    createdAt: new Date().toISOString()
  };

  guestbookEntries.unshift(entry);

  if (guestbookEntries.length > MAX_ENTRIES) {
    guestbookEntries.length = MAX_ENTRIES;
  }

  return NextResponse.json({ entry }, { status: 201 });
}
