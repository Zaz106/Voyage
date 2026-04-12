import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

/* ══════════════════════════════════════
   Invoice Storage — file-based JSON
   ══════════════════════════════════════ */

const DATA_DIR = path.join(process.cwd(), "data", "invoices");

/** Ensure the data directory exists */
async function ensureDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

/** Get the next sequential invoice number based on existing invoices */
async function getNextInvoiceNumber(): Promise<string> {
  await ensureDir();
  const files = await fs.readdir(DATA_DIR);
  let maxNum = 0;
  for (const file of files) {
    if (!file.endsWith(".json") || file === "counter.json") continue;
    try {
      const raw = await fs.readFile(path.join(DATA_DIR, file), "utf-8");
      const inv = JSON.parse(raw);
      const match = inv.invoiceNumber?.match(/INV-(\d+)/);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxNum) maxNum = num;
      }
    } catch { /* skip */ }
  }
  return `INV-${String(maxNum + 1).padStart(3, "0")}`;
}

/* ── POST — Create a new invoice ── */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    /* Basic validation */
    if (!body.clientName || !body.clientEmail || !body.invoiceNumber) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    /* Sanitise line items */
    const lineItems = Array.isArray(body.lineItems)
      ? body.lineItems.map((li: Record<string, unknown>) => ({
          description: String(li.description ?? ""),
          quantity: String(li.quantity ?? "0"),
          rate: String(li.rate ?? "0"),
        }))
      : [];

    const id = crypto.randomUUID();
    const invoice = {
      id,
      createdAt: new Date().toISOString(),
      status: "sent",
      clientName: String(body.clientName),
      clientEmail: String(body.clientEmail),
      clientCompany: String(body.clientCompany ?? ""),
      clientAddress: String(body.clientAddress ?? ""),
      clientPhone: String(body.clientPhone ?? ""),
      invoiceNumber: String(body.invoiceNumber),
      issueDate: String(body.issueDate ?? ""),
      dueDate: String(body.dueDate ?? ""),
      currency: String(body.currency ?? "ZAR"),
      paymentTerms: String(body.paymentTerms ?? ""),
      lineItems,
      taxRate: String(body.taxRate ?? "0"),
      discountType: String(body.discountType ?? "none"),
      discountValue: String(body.discountValue ?? "0"),
      notes: String(body.notes ?? ""),
      paymentInstructions: String(body.paymentInstructions ?? ""),
      subtotal: Number(body.subtotal ?? 0),
      discountAmount: Number(body.discountAmount ?? 0),
      taxAmount: Number(body.taxAmount ?? 0),
      total: Number(body.total ?? 0),
    };

    await ensureDir();
    const filePath = path.join(DATA_DIR, `${id}.json`);
    await fs.writeFile(filePath, JSON.stringify(invoice, null, 2), "utf-8");

    return NextResponse.json({ id }, { status: 201 });
  } catch (err) {
    console.error("Failed to create invoice:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/* ── GET — Retrieve a single invoice by ?id=, list all by ?list=true, or next number by ?nextNumber=true ── */
export async function GET(request: NextRequest) {
  try {
    /* Next invoice number */
    if (request.nextUrl.searchParams.get("nextNumber") === "true") {
      const num = await getNextInvoiceNumber();
      return NextResponse.json({ invoiceNumber: num });
    }

    /* List all invoices (for dashboard) */
    if (request.nextUrl.searchParams.get("list") === "true") {
      await ensureDir();
      const files = await fs.readdir(DATA_DIR);
      const invoices = [];
      for (const file of files) {
        if (!file.endsWith(".json") || file === "counter.json") continue;
        try {
          const raw = await fs.readFile(path.join(DATA_DIR, file), "utf-8");
          const inv = JSON.parse(raw);
          invoices.push({
            id: inv.id,
            invoiceNumber: inv.invoiceNumber,
            clientName: inv.clientName,
            clientCompany: inv.clientCompany,
            clientEmail: inv.clientEmail,
            total: inv.total,
            currency: inv.currency,
            issueDate: inv.issueDate,
            dueDate: inv.dueDate,
            status: inv.status ?? "sent",
            createdAt: inv.createdAt,
          });
        } catch { /* skip corrupt files */ }
      }
      /* Sort by createdAt descending */
      invoices.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      return NextResponse.json(invoices);
    }

    const id = request.nextUrl.searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Missing id parameter" }, { status: 400 });
    }

    /* Prevent path traversal */
    const safeId = path.basename(id);
    const filePath = path.join(DATA_DIR, `${safeId}.json`);

    try {
      const raw = await fs.readFile(filePath, "utf-8");
      return NextResponse.json(JSON.parse(raw));
    } catch {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }
  } catch (err) {
    console.error("Failed to fetch invoice:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/* ── PATCH — Update invoice status ── */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ error: "Missing id or status" }, { status: 400 });
    }

    const validStatuses = ["draft", "sent", "paid", "overdue"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const safeId = path.basename(id);
    const filePath = path.join(DATA_DIR, `${safeId}.json`);

    let invoice;
    try {
      const raw = await fs.readFile(filePath, "utf-8");
      invoice = JSON.parse(raw);
    } catch {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    invoice.status = status;
    await fs.writeFile(filePath, JSON.stringify(invoice, null, 2), "utf-8");
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Failed to update invoice:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/* ── DELETE — Remove an invoice by ?id= ── */
export async function DELETE(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Missing id parameter" }, { status: 400 });
    }

    const safeId = path.basename(id);
    const filePath = path.join(DATA_DIR, `${safeId}.json`);

    try {
      await fs.access(filePath);
    } catch {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    await fs.unlink(filePath);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Failed to delete invoice:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
