import { NextRequest, NextResponse } from "next/server";
import { readAll } from "@/lib/invoiceStorage";

/* ── Types ── */
interface LineItem {
  description: string;
  quantity: string;
  rate: string;
}

interface Invoice {
  id: string;
  clientName: string;
  clientEmail: string;
  clientCompany: string;
  clientAddress: string;
  clientPhone: string;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  currency: string;
  lineItems: LineItem[];
  taxRate: string;
  discountAmount: number;
  notes: string;
  paymentInstructions: string;
  subtotal: number;
  taxAmount: number;
  total: number;
}

/* ── Helpers ── */
const CURRENCY_LOCALES: Record<string, string> = {
  ZAR: "en-ZA", USD: "en-US", GBP: "en-GB", EUR: "de-DE",
};

function fmt(amount: number, currency: string) {
  const locale = CURRENCY_LOCALES[currency] ?? "en-ZA";
  try {
    return new Intl.NumberFormat(locale, { style: "currency", currency, minimumFractionDigits: 2 }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

function formatDate(dateStr: string) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-ZA", { day: "numeric", month: "long", year: "numeric" });
}

function escapeHtml(str: string) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/* ── Build self-contained HTML for the invoice ── */
function buildInvoiceHtml(inv: Invoice): string {
  const cur = inv.currency;

  const lineItemsHtml = inv.lineItems.map(li => {
    const amount = (parseFloat(li.quantity) || 0) * (parseFloat(li.rate) || 0);
    return `<div class="row">
      <span class="col-desc">${escapeHtml(li.description || "—")}</span>
      <span class="col-right">${fmt(parseFloat(li.rate) || 0, cur)}</span>
      <span class="col-right">${escapeHtml(li.quantity)}</span>
      <span class="col-right">${fmt(amount, cur)}</span>
    </div>`;
  }).join("");

  const discountRow = inv.discountAmount > 0
    ? `<div class="total-row"><span>Discount</span><span>-${fmt(inv.discountAmount, cur)}</span></div>`
    : "";

  const notesHtml = inv.notes
    ? `<div class="notes"><p>${escapeHtml(inv.notes)}</p></div>`
    : "";

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; color: #1a1a1a; background: #fff; }
  .sheet { width: 210mm; min-height: 297mm; margin: 0 auto; display: flex; flex-direction: column; padding-bottom: 2.5rem; }
  .card { flex: 1 1 auto; padding: 6rem 3.5rem 1rem; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 5rem; }
  .title { font-size: 3rem; font-weight: 700; letter-spacing: -0.03em; line-height: 1; }
  .header-meta { text-align: right; display: flex; flex-direction: column; gap: 0.15rem; }
  .meta-value { font-size: 0.9375rem; line-height: 1.5; }
  .meta-label { font-size: 0.875rem; color: rgba(0,0,0,0.45); line-height: 1.5; margin-top: 0.25rem; }
  .billed { margin-bottom: 2rem; }
  .section-label { font-size: 0.8125rem; color: rgba(0,0,0,0.4); display: block; margin-bottom: 0.375rem; }
  .client-name { font-size: 1.375rem; font-weight: 600; margin-bottom: 0.25rem; }
  .client-detail { font-size: 0.9375rem; color: rgba(0,0,0,0.5); line-height: 1.55; }
  .notes { margin-bottom: 1.75rem; padding: 1rem 0.1rem; }
  .notes p { font-size: 0.9375rem; color: rgba(0,0,0,0.55); line-height: 1.6; white-space: pre-wrap; }
  .table-header, .row { display: grid; grid-template-columns: 1fr 120px 80px 120px; gap: 1rem; padding: 0.875rem 0; }
  .table-header { border-bottom: 1px solid #1a1a1a; font-size: 0.85rem; font-weight: 600; margin-bottom: 0.5rem; }
  .row { border-bottom: 1px solid rgba(0,0,0,0.08); font-size: 0.9375rem; }
  .col-desc { text-align: left; }
  .col-right { text-align: right; }
  .totals { display: flex; flex-direction: column; align-items: flex-end; gap: 0.5rem; padding-top: 1.25rem; }
  .total-row { display: flex; justify-content: space-between; width: 260px; font-size: 0.9375rem; color: rgba(0,0,0,0.55); }
  .total-final { padding-top: 0.75rem; margin-top: 0.25rem; border-top: 1px solid #1a1a1a; font-weight: 700; font-size: 1.25rem; color: #1a1a1a; margin-bottom: 1rem; }
  .footer-bar { padding: 1.75rem 3.5rem; border-top: 1px solid rgba(0,0,0,0.06); }
  .footer-inner { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; }
  .footer-col { display: flex; flex-direction: column; gap: 0.35rem; }
  .footer-heading { font-size: 0.9375rem; font-weight: 600; margin-bottom: 0.5rem; }
  .footer-text { font-size: 0.875rem; color: rgba(0,0,0,0.65); line-height: 1.6; white-space: pre-wrap; }
</style></head><body>
<div class="sheet">
  <div class="card">
    <header class="header">
      <h1 class="title">Invoice</h1>
      <div class="header-meta">
        <p class="meta-value">${escapeHtml(formatDate(inv.issueDate))}</p>
        <p class="meta-value">Invoice No. ${escapeHtml(inv.invoiceNumber)}</p>
        ${inv.dueDate ? `<p class="meta-label">Due: ${escapeHtml(formatDate(inv.dueDate))}</p>` : ""}
      </div>
    </header>
    <section class="billed">
      <span class="section-label">Billed to:</span>
      <p class="client-name">${escapeHtml(inv.clientCompany || inv.clientName)}</p>
      ${inv.clientCompany && inv.clientName ? `<p class="client-detail">${escapeHtml(inv.clientName)}</p>` : ""}
      ${inv.clientEmail ? `<p class="client-detail">${escapeHtml(inv.clientEmail)}</p>` : ""}
      ${inv.clientPhone ? `<p class="client-detail">${escapeHtml(inv.clientPhone)}</p>` : ""}
      ${inv.clientAddress ? `<p class="client-detail">${escapeHtml(inv.clientAddress)}</p>` : ""}
    </section>
    ${notesHtml}
    <section>
      <div class="table-header">
        <span class="col-desc">Description</span>
        <span class="col-right">Price</span>
        <span class="col-right">Qty</span>
        <span class="col-right">Total</span>
      </div>
      ${lineItemsHtml}
      <div class="totals">
        <div class="total-row"><span>Subtotal</span><span>${fmt(inv.subtotal, cur)}</span></div>
        ${discountRow}
        <div class="total-row"><span>Tax (${escapeHtml(inv.taxRate)}%)</span><span>${fmt(inv.taxAmount, cur)}</span></div>
        <div class="total-row total-final"><span>Total</span><span>${fmt(inv.total, cur)}</span></div>
      </div>
    </section>
  </div>
  <div class="footer-bar">
    <div class="footer-inner">
      <div class="footer-col">
        <h3 class="footer-heading">Payment Information</h3>
        <p class="footer-text">${inv.paymentInstructions ? escapeHtml(inv.paymentInstructions) : "Contact us for payment details."}</p>
      </div>
      <div class="footer-col">
        <h3 class="footer-heading">Voyage Visuals</h3>
        <p class="footer-text">+27 78 746 2628</p>
        <p class="footer-text">info@voyagevisuals.co.za</p>
      </div>
    </div>
  </div>
</div>
</body></html>`;
}

export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing id parameter" }, { status: 400 });
  }

  /* Validate id format (UUID only) */
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  /* Read invoice directly from blob storage — no network round-trip */
  const all = await readAll();
  const invoice = all.find(inv => inv.id === id) as unknown as Invoice | undefined;
  if (!invoice) {
    return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  }

  let browser;
  try {
    const isDev = process.env.NODE_ENV !== "production";

    const chromiumArgs = [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
      "--disable-extensions",
      "--hide-scrollbars",
    ];

    if (isDev) {
      const puppeteer = (await import("puppeteer")).default;
      browser = await puppeteer.launch({ headless: true, args: chromiumArgs });
    } else {
      const chromium = (await import("@sparticuz/chromium")).default;
      const puppeteer = (await import("puppeteer-core")).default;
      browser = await puppeteer.launch({
        args: [...chromium.args, ...chromiumArgs],
        executablePath: await chromium.executablePath(),
        headless: true,
      });
    }

    const page = await browser.newPage();

    /* A4 at 96 dpi */
    await page.setViewport({ width: 794, height: 1123, deviceScaleFactor: 2 });

    /* Set content directly — no network request needed */
    const html = buildInvoiceHtml(invoice);
    await page.setContent(html, { waitUntil: "domcontentloaded" });

    /* Wait briefly for the Google Font to load */
    await page.evaluate(() => document.fonts?.ready);

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "0", bottom: "0", left: "0", right: "0" },
    });

    await browser.close();

    const filename = `invoice-${invoice.invoiceNumber || id}.pdf`;

    return new NextResponse(Buffer.from(pdf), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (err) {
    console.error("PDF generation failed:", err);
    if (browser) await browser.close();
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 });
  }
}
