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

export const dynamic = "force-dynamic";

function sanitize(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export async function GET() {
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

  const entry: GuestbookEntry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: name || "anonymous",
    message,
    createdAt: new Date().toISOString()
  };

  guestbookEntries.unshift(entry);

  if (guestbookEntries.length > 200) {
    guestbookEntries.length = 200;
  }

  return NextResponse.json({ entry }, { status: 201 });
}
