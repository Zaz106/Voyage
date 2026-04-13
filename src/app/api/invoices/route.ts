import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { readAll, writeAll, withLock, type InvoiceRecord } from "@/lib/invoiceStorage";

// TODO: Authentication required before going live.
// All invoice routes are currently unprotected. Add a session/JWT check
// once an auth provider (e.g. NextAuth, Clerk) is integrated.

async function getNextInvoiceNumber(): Promise<string> {
  const all = await readAll();
  let maxNum = 0;
  for (const inv of all) {
    const match = String(inv.invoiceNumber ?? "").match(/INV-(\d+)/);
    if (match) {
      const num = parseInt(match[1], 10);
      if (num > maxNum) maxNum = num;
    }
  }
  return `INV-${String(maxNum + 1).padStart(3, "0")}`;
}

/* ── POST — Create a new invoice ── */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.clientName || !body.clientEmail || !body.invoiceNumber) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const lineItems = Array.isArray(body.lineItems)
      ? body.lineItems.map((li: Record<string, unknown>) => ({
          description: String(li.description ?? ""),
          quantity: String(li.quantity ?? "0"),
          rate: String(li.rate ?? "0"),
        }))
      : [];

    const id = crypto.randomUUID();
    const invoice: InvoiceRecord = {
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

    const all = await readAll();
    all.unshift(invoice); // newest first
    await withLock(() => writeAll(all));

    return NextResponse.json({ id }, { status: 201 });
  } catch (err) {
    console.error("Failed to create invoice:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/* ── GET — single invoice, list, or next number ── */
export async function GET(request: NextRequest) {
  try {
    if (request.nextUrl.searchParams.get("nextNumber") === "true") {
      const num = await getNextInvoiceNumber();
      return NextResponse.json({ invoiceNumber: num });
    }

    if (request.nextUrl.searchParams.get("list") === "true") {
      const all = await readAll();
      const summaries = all.map(inv => ({
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
      }));
      return NextResponse.json(summaries);
    }

    const id = request.nextUrl.searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Missing id parameter" }, { status: 400 });
    }

    const all = await readAll();
    const invoice = all.find(inv => inv.id === id);
    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }
    return NextResponse.json(invoice);
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

    const all = await readAll();
    const idx = all.findIndex(inv => inv.id === id);
    if (idx === -1) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    all[idx] = { ...all[idx], status };
    await withLock(() => writeAll(all));
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

    const all = await readAll();
    const filtered = all.filter(inv => inv.id !== id);
    if (filtered.length === all.length) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    await withLock(() => writeAll(filtered));
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Failed to delete invoice:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
