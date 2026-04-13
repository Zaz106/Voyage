/**
 * invoiceStorage.ts — Vercel Blob storage for invoices
 *
 * All environments (local dev + production) use Vercel Blob.
 * Requires BLOB_READ_WRITE_TOKEN in your environment:
 *   - Production/Preview: set automatically when you connect the Blob store in the Vercel dashboard
 *   - Local dev: run `vercel env pull .env.local` after connecting the store
 */

import { put, list, del } from "@vercel/blob";

export type InvoiceRecord = Record<string, unknown>;

/* ── Blob pathname — deterministic, single source of truth ── */
const BLOB_PATHNAME = "invoices.json";

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
    const { blobs } = await list({ prefix: BLOB_PATHNAME });
    const blob = blobs.find(b => b.pathname === BLOB_PATHNAME);
    if (!blob) return [];
    // downloadUrl carries auth for private blobs
    const res = await fetch(blob.downloadUrl, { cache: "no-store" });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

/* ── Write all invoices ── */
export async function writeAll(invoices: InvoiceRecord[]): Promise<void> {
  // Capture any existing blobs before writing so we can clean them up
  const { blobs } = await list({ prefix: BLOB_PATHNAME });
  const existing = blobs.filter(b => b.pathname === BLOB_PATHNAME);

  await put(BLOB_PATHNAME, JSON.stringify(invoices, null, 2), {
    access: "private",
    contentType: "application/json",
    addRandomSuffix: false,
  });

  // Remove stale blobs (handles edge case where multiple old versions accumulated)
  if (existing.length > 0) {
    await del(existing.map(b => b.url));
  }
}
