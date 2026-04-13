/**
 * invoiceStorage.ts — Vercel Blob storage for invoices
 *
 * Requires BLOB_READ_WRITE_TOKEN in your environment:
 *   - Production/Preview: set automatically when you connect the Blob store in the Vercel dashboard
 *   - Local dev: run `vercel env pull .env.local` after connecting the store
 *
 * Request strategy (minimising Blob API calls):
 *   readAll  → 1 list() on cold start, then 1 fetch() per call (URL cached in module scope)
 *   writeAll → 1 put()  (addRandomSuffix:false overwrites in-place — no pre-list or delete needed)
 */

import { put, list } from "@vercel/blob";

export type InvoiceRecord = Record<string, unknown>;

const BLOB_PATHNAME = "invoices.json";

/* ── Module-level URL cache ───────────────────────────────────────────────────
   After the first list() resolves the blob URL, warm function instances reuse
   it directly — skipping a list() on every subsequent read.
   Reset on any read error; updated after every successful write. */
let cachedBlobUrl: string | null = null;

/* ── In-process write mutex ──────────────────────────────────────────────────
   Serialises concurrent writes within a single server instance. */
let writeLock: Promise<void> = Promise.resolve();

export async function withLock<T>(fn: () => Promise<T>): Promise<T> {
  const current = writeLock;
  let release!: () => void;
  writeLock = new Promise<void>(res => { release = res; });
  await current;
  try {
    return await fn();
  } finally {
    release();
  }
}

/* ── Read all invoices ── */
export async function readAll(): Promise<InvoiceRecord[]> {
  try {
    /* Resolve blob URL — use cache on warm instances, list() on cold start */
    if (!cachedBlobUrl) {
      const { blobs } = await list({ prefix: BLOB_PATHNAME });
      const blob = blobs.find(b => b.pathname === BLOB_PATHNAME);
      if (!blob) return []; // no invoices stored yet
      cachedBlobUrl = blob.url;
    }

    /* Private blobs require the token as a Bearer header on server-side fetch */
    const res = await fetch(cachedBlobUrl, {
      headers: { Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}` },
      cache: "no-store",
    });

    if (!res.ok) {
      cachedBlobUrl = null; // force re-discovery on next call
      return [];
    }

    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    cachedBlobUrl = null;
    return [];
  }
}

/* ── Write all invoices ── */
export async function writeAll(invoices: InvoiceRecord[]): Promise<void> {
  /* put() with addRandomSuffix:false overwrites the existing blob in-place.
     No pre-list or post-delete needed — this is a single API call. */
  const result = await put(BLOB_PATHNAME, JSON.stringify(invoices, null, 2), {
    access: "private",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
  });
  cachedBlobUrl = result.url; // keep cache in sync after write
}

