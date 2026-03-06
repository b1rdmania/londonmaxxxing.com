"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";

interface GuestbookEntry {
  id: string;
  name: string;
  message: string;
  createdAt: string;
}

export default function GuestbookClient() {
  const [entries, setEntries] = useState<GuestbookEntry[]>([]);
  const [storage, setStorage] = useState<"supabase" | "memory" | "unavailable" | null>(null);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadEntries() {
      try {
        const response = await fetch("/api/guestbook", { cache: "no-store" });
        const data = (await response.json()) as {
          entries?: GuestbookEntry[];
          storage?: "supabase" | "memory" | "unavailable";
          error?: string;
        };
        if (!response.ok) throw new Error(data.error || "Failed to load guestbook.");
        setEntries(data.entries || []);
        setStorage(data.storage || null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load guestbook.");
      } finally {
        setLoading(false);
      }
    }

    loadEntries();
  }, []);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!message.trim()) return;

    setPosting(true);
    setError(null);

    try {
      const response = await fetch("/api/guestbook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, message })
      });

      const data = (await response.json()) as { entry?: GuestbookEntry; error?: string };
      if (!response.ok || !data.entry) {
        throw new Error(data.error || "Failed to post entry.");
      }

      setEntries((current) => [data.entry!, ...current]);
      setName("");
      setMessage("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to post entry.");
    } finally {
      setPosting(false);
    }
  }

  return (
    <main className="guestbook-shell">
      <header className="guestbook-header">
        <h1>guestbook</h1>
        <p>This is not meant as a canonical listing site. Just an example of London&apos;s tech scene.</p>
        <p>
          If something is badly wrong, should not be on here, or you need a big trading company or startup listed, post here.
          If anyone wants to take this project and turn it into a proper listing site, DM me:{" "}
          <a href="https://x.com/b1rdmania" target="_blank" rel="noreferrer">
            @b1rdmania
          </a>
        </p>
        <p>
          <Link href="/">Back to map</Link>
        </p>
      </header>

      <section className="guestbook-form-wrap">
        {storage === "supabase" ? <p className="guestbook-ok">storage: supabase (persistent)</p> : null}
        {storage === "memory" ? <p className="guestbook-warning">storage: memory (not persistent)</p> : null}
        {storage === "unavailable" ? <p className="guestbook-warning">storage unavailable: configure Supabase</p> : null}
        <form className="guestbook-form" onSubmit={onSubmit}>
          <label>
            name (optional)
            <input value={name} onChange={(e) => setName(e.target.value)} maxLength={60} />
          </label>
          <label>
            message
            <textarea value={message} onChange={(e) => setMessage(e.target.value)} maxLength={500} required />
          </label>
          <button type="submit" disabled={posting}>
            {posting ? "posting..." : "post"}
          </button>
        </form>
        {error ? <p className="guestbook-error">{error}</p> : null}
      </section>

      <section className="guestbook-list">
        {loading ? <p>loading...</p> : null}
        {!loading && entries.length === 0 ? <p>no posts yet.</p> : null}
        {entries.map((entry) => (
          <article key={entry.id} className="guestbook-entry">
            <div className="guestbook-entry-meta">
              <strong>{entry.name}</strong>
              <span>{new Date(entry.createdAt).toLocaleString()}</span>
            </div>
            <p>{entry.message}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
