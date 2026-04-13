/**
 * invoiceStorage.ts
 *
 * Unified invoice storage layer:
 *   - Development  → local file at data/invoices.json
 *   - Production   → Vercel Blob Storage (persistent, shared across instances)
 *
 * Setup (one-time, production only):
 *   1. Vercel Dashboard → Storage → Create Blob Store → Connect to this project
 *   2. Vercel automatically adds BLOB_READ_WRITE_TOKEN to your project env vars
 *   3. Pull the updated env: `vercel env pull .env.local`
 */

import fs from "fs/promises";
import path from "path";

export type InvoiceRecord = Record<string, unknown>;

/* ── Local file path (dev only) ── */
const DATA_FILE = path.join(process.cwd(), "data", "invoices.json");

/* ── Blob pathname (prod only) — deterministic so it can be overwritten ── */
const BLOB_PATHNAME = "invoices.json";

/* ── In-process write mutex ──────────────────────────────────────────────────
   Prevents concurrent read-modify-write races within a single instance.
   Note: does NOT guard against races across multiple serverless instances,
   but is still worthwhile protection for bursts on a single cold-start. */
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
  if (process.env.NODE_ENV !== "production") {
    try {
      const raw = await fs.readFile(DATA_FILE, "utf-8");
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  /* Production: fetch from Vercel Blob */
  try {
    const { list } = await import("@vercel/blob");
    const { blobs } = await list({ prefix: BLOB_PATHNAME });
    const blob = blobs.find(b => b.pathname === BLOB_PATHNAME);
    if (!blob) return [];
    const res = await fetch(blob.url, { cache: "no-store" });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

/* ── Write all invoices ── */
export async function writeAll(invoices: InvoiceRecord[]): Promise<void> {
  if (process.env.NODE_ENV !== "production") {
    await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
    await fs.writeFile(DATA_FILE, JSON.stringify(invoices, null, 2), "utf-8");
    return;
  }

  /* Production: upload to Vercel Blob, overwriting the same pathname */
  const { put } = await import("@vercel/blob");
  await put(BLOB_PATHNAME, JSON.stringify(invoices, null, 2), {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: false,
  });
}
