import { notFound } from "next/navigation";
import type { Metadata } from "next";
import fs from "fs/promises";
import path from "path";
import styles from "./page.module.css";
import DownloadPdfButton from "@/components/ui/DownloadPdfButton";

/* ── Types ── */
interface LineItem {
  description: string;
  quantity: string;
  rate: string;
}

interface Invoice {
  id: string;
  createdAt: string;
  clientName: string;
  clientEmail: string;
  clientCompany: string;
  clientAddress: string;
  clientPhone: string;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  currency: string;
  paymentTerms: string;
  lineItems: LineItem[];
  taxRate: string;
  discountType: string;
  discountValue: string;
  notes: string;
  paymentInstructions: string;
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  total: number;
}

/* ── Helpers ── */
const DATA_FILE = path.join(process.cwd(), "data", "invoices.json");

async function getInvoice(id: string): Promise<Invoice | null> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf-8");
    const all = JSON.parse(raw) as Invoice[];
    return all.find(inv => inv.id === id) ?? null;
  } catch {
    return null;
  }
}

const CURRENCY_LOCALES: Record<string, string> = {
  ZAR: "en-ZA",
  USD: "en-US",
  GBP: "en-GB",
  EUR: "de-DE",
};

function fmt(amount: number, currency: string) {
  const locale = CURRENCY_LOCALES[currency] ?? "en-ZA";
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

function formatDate(dateStr: string) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-ZA", { day: "numeric", month: "long", year: "numeric" });
}

/* ── Metadata ── */
type PageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const invoice = await getInvoice(id);
  if (!invoice) return { title: "Invoice Not Found" };
  return {
    title: `Invoice ${invoice.invoiceNumber} | Voyage`,
    description: `Invoice for ${invoice.clientName}`,
  };
}

/* ── Page ── */
export default async function InvoiceViewPage({ params }: PageProps) {
  const { id } = await params;
  const invoice = await getInvoice(id);
  if (!invoice) notFound();

  const cur = invoice.currency;

  return (
    <main className={styles.page}>
      <div className={styles.a4Sheet}>
        <div className={styles.card}>
        {/* ── Header ── */}
        <header className={styles.header}>
          <h1 className={styles.title}>Invoice</h1>
          <div className={styles.headerMeta}>
            <p className={styles.metaValue}>{formatDate(invoice.issueDate)}</p>
            <p className={styles.metaValue}>Invoice No. {invoice.invoiceNumber}</p>
            {invoice.dueDate && (
              <p className={styles.metaLabel}>Due: {formatDate(invoice.dueDate)}</p>
            )}
          </div>
        </header>

        {/* ── Billed to ── */}
        <section className={styles.billedTo}>
          <span className={styles.sectionLabel}>Billed to:</span>
          <p className={styles.clientName}>
            {invoice.clientCompany || invoice.clientName}
          </p>
          {invoice.clientCompany && invoice.clientName && (
            <p className={styles.clientDetail}>{invoice.clientName}</p>
          )}
          {invoice.clientEmail && <p className={styles.clientDetail}>{invoice.clientEmail}</p>}
          {invoice.clientPhone && <p className={styles.clientDetail}>{invoice.clientPhone}</p>}
          {invoice.clientAddress && <p className={styles.clientDetail}>{invoice.clientAddress}</p>}
        </section>

        {/* ── Notes (if any, shown above table) ── */}
        {invoice.notes && (
          <section className={styles.notesSection}>
            <p className={styles.notesText}>{invoice.notes}</p>
          </section>
        )}

        {/* ── Line items table ── */}
        <section className={styles.tableWrap}>
          <div className={styles.tableHeader}>
            <span className={styles.colDesc}>Description</span>
            <span className={styles.colRate}>Price</span>
            <span className={styles.colQty}>Qty</span>
            <span className={styles.colAmount}>Total</span>
          </div>
          {invoice.lineItems.map((li, idx) => {
            const amount = (parseFloat(li.quantity) || 0) * (parseFloat(li.rate) || 0);
            return (
              <div key={idx} className={styles.tableRow}>
                <span className={styles.colDesc}>{li.description || "—"}</span>
                <span className={styles.colRate}>{fmt(parseFloat(li.rate) || 0, cur)}</span>
                <span className={styles.colQty}>{li.quantity}</span>
                <span className={styles.colAmount}>{fmt(amount, cur)}</span>
              </div>
            );
          })}

          {/* ── Totals (right-aligned within table) ── */}
          <div className={styles.totals}>
            <div className={styles.totalRow}>
              <span>Subtotal</span>
              <span>{fmt(invoice.subtotal, cur)}</span>
            </div>
            {invoice.discountAmount > 0 && (
              <div className={styles.totalRow}>
                <span>Discount</span>
                <span>-{fmt(invoice.discountAmount, cur)}</span>
              </div>
            )}
            <div className={styles.totalRow}>
              <span>Tax ({invoice.taxRate}%)</span>
              <span>{fmt(invoice.taxAmount, cur)}</span>
            </div>
            <div className={`${styles.totalRow} ${styles.totalFinal}`}>
              <span>Total</span>
              <span>{fmt(invoice.total, cur)}</span>
            </div>
          </div>
        </section>
      </div>

      {/* ── Footer bar (payment info + contact) ── */}
      <div className={styles.footerBar}>
        <div className={styles.footerInner}>
          <div className={styles.footerCol}>
            <h3 className={styles.footerHeading}>Payment Information</h3>
            {invoice.paymentInstructions ? (
              <p className={styles.footerText}>{invoice.paymentInstructions}</p>
            ) : (
              <p className={styles.footerText}>Contact us for payment details.</p>
            )}
          </div>
          <div className={styles.footerCol}>
            <h3 className={styles.footerHeading}>Voyage Visuals</h3>
            <p className={styles.footerText}>+27 78 746 2628</p>
            <p className={styles.footerText}>info@voyagevisuals.co.za</p>
          </div>
        </div>
      </div>
      </div>

      {/* ── Floating PDF download ── */}
      <DownloadPdfButton invoiceId={invoice.id} />
    </main>
  );
}
