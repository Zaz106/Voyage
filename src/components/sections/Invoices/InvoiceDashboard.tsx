"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { Search, ExternalLink, ChevronDown, Plus, FileText, Trash2, X, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";
import styles from "./InvoiceDashboard.module.css";

/* ── Types ── */
interface InvoiceSummary {
  id: string;
  invoiceNumber: string;
  clientName: string;
  clientCompany: string;
  clientEmail: string;
  total: number;
  currency: string;
  issueDate: string;
  dueDate: string;
  status: string;
  createdAt: string;
}

const STATUS_OPTIONS = ["sent", "paid", "overdue", "draft"] as const;

const STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  sent: "Sent",
  paid: "Paid",
  overdue: "Overdue",
};

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
  return d.toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" });
}

export default function InvoiceDashboard() {
  const [invoices, setInvoices] = useState<InvoiceSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<InvoiceSummary | null>(null);

  const fetchInvoices = useCallback(async () => {
    try {
      const res = await fetch("/api/invoices?list=true");
      if (res.ok) {
        const data = await res.json();
        setInvoices(data);
      }
    } catch (err) {
      console.error("Failed to load invoices:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchInvoices(); }, [fetchInvoices]);

  const updateStatus = async (id: string, status: string) => {
    setUpdatingId(id);
    try {
      const res = await fetch("/api/invoices", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (res.ok) {
        setInvoices(prev => prev.map(inv => inv.id === id ? { ...inv, status } : inv));
      }
    } catch (err) {
      console.error("Failed to update status:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  const deleteInvoice = async (id: string) => {
    setDeleteTarget(null);
    setDeletingId(id);
    try {
      const res = await fetch(`/api/invoices?id=${encodeURIComponent(id)}`, { method: "DELETE" });
      if (res.ok) {
        setInvoices(prev => prev.filter(inv => inv.id !== id));
      }
    } catch (err) {
      console.error("Failed to delete invoice:", err);
    } finally {
      setDeletingId(null);
    }
  };

  /* Filtered list */
  const filtered = invoices.filter(inv => {
    const matchesSearch =
      !search ||
      inv.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
      inv.clientName.toLowerCase().includes(search.toLowerCase()) ||
      inv.clientCompany.toLowerCase().includes(search.toLowerCase()) ||
      inv.clientEmail.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === "all" || inv.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  /* Stats */
  /* Stats — group by currency so multi-currency totals are correct */
  const outstandingByCurrency = invoices
    .filter(inv => inv.status === "sent" || inv.status === "overdue")
    .reduce<Record<string, number>>((acc, inv) => {
      acc[inv.currency] = (acc[inv.currency] ?? 0) + inv.total;
      return acc;
    }, {});

  const paidByCurrency = invoices
    .filter(inv => inv.status === "paid")
    .reduce<Record<string, number>>((acc, inv) => {
      acc[inv.currency] = (acc[inv.currency] ?? 0) + inv.total;
      return acc;
    }, {});

  /** Render grouped currency totals, e.g. "R 1 200,00 · $300.00" */
  function fmtGrouped(byCurrency: Record<string, number>) {
    const entries = Object.entries(byCurrency);
    if (entries.length === 0) return fmt(0, "ZAR");
    return entries.map(([cur, amt]) => fmt(amt, cur)).join(" · ");
  }

  return (
    <section className={styles.dashboard}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerText}>
          <h1 className={styles.title}>Invoices</h1>
          <p className={styles.subtitle}>Manage and track all your invoices.</p>
        </div>
        <Link href="/invoices" className={styles.createBtn}>
          <Plus size={16} />
          <span className={styles.createBtnLabel}>New Invoice</span>
        </Link>
      </div>

      {/* Stats cards */}
      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Total Invoices</span>
          <span className={styles.statValue}>{invoices.length}</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Outstanding</span>
          <span className={styles.statValue}>{fmtGrouped(outstandingByCurrency)}</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Paid</span>
          <span className={styles.statValue}>{fmtGrouped(paidByCurrency)}</span>
        </div>
      </div>

      {/* Filters */}
      <div className={styles.toolbar}>
        <div className={styles.searchBox}>
          <Search size={16} className={styles.searchIcon} />
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search invoices..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className={styles.filterGroup}>
          {["all", ...STATUS_OPTIONS].map(s => (
            <button
              key={s}
              type="button"
              className={`${styles.filterBtn} ${filterStatus === s ? styles.filterBtnActive : ""}`}
              onClick={() => setFilterStatus(s)}
            >
              {s === "all" ? "All" : STATUS_LABELS[s]}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className={styles.empty}>
          <p className={styles.emptyText}>Loading invoices...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className={styles.empty}>
          <FileText size={40} className={styles.emptyIcon} />
          <p className={styles.emptyText}>
            {invoices.length === 0 ? "No invoices yet." : "No invoices match your search."}
          </p>
          {invoices.length === 0 && (
            <Link href="/invoices" className={styles.emptyLink}>Create your first invoice</Link>
          )}
        </div>
      ) : (
        <div className={styles.tableWrap}>
          <div className={styles.tableHeader}>
            <span className={styles.colInv}>Invoice</span>
            <span className={styles.colClient}>Client</span>
            <span className={styles.colDate}>Date</span>
            <span className={styles.colAmount}>Amount</span>
            <span className={styles.colStatus}>Status</span>
            <span className={styles.colActions}></span>
          </div>
          {filtered.map(inv => (
            <div key={inv.id} className={styles.tableRow}>
              <span className={styles.colInv}>
                <span className={styles.invNum}>{inv.invoiceNumber}</span>
              </span>
              <span className={styles.colClient}>
                <span className={styles.clientPrimary}>{inv.clientCompany || inv.clientName}</span>
                {inv.clientCompany && <span className={styles.clientSecondary}>{inv.clientName}</span>}
              </span>
              <span className={styles.colDate}>
                <span className={styles.dateText}>{formatDate(inv.issueDate)}</span>
                {inv.dueDate && <span className={styles.dateSecondary}>Due {formatDate(inv.dueDate)}</span>}
              </span>
              <span className={styles.colAmount}>
                {fmt(inv.total, inv.currency)}
              </span>
              <span className={styles.colStatus}>
                <StatusDropdown
                  value={inv.status}
                  onChange={(s) => updateStatus(inv.id, s)}
                  disabled={updatingId === inv.id}
                />
              </span>
              <span className={styles.colActions}>
                <Link href={`/invoices/${inv.id}`} className={styles.viewBtn} title="View invoice" target="_blank">
                  <ExternalLink size={15} />
                </Link>
                <button
                  type="button"
                  className={styles.deleteBtn}
                  title="Delete invoice"
                  onClick={() => setDeleteTarget(inv)}
                  disabled={deletingId === inv.id}
                >
                  <Trash2 size={15} />
                </button>
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Delete confirmation modal */}
      <AnimatePresence>
        {deleteTarget && (
          <div className={styles.modalOverlay} onClick={() => setDeleteTarget(null)}>
            <motion.div
              className={styles.modalBox}
              onClick={e => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            >
              <button
                type="button"
                className={styles.modalCloseBtn}
                onClick={() => setDeleteTarget(null)}
                aria-label="Close"
              >
                <X size={18} />
              </button>
              <div className={styles.deleteIcon}><AlertTriangle size={32} /></div>
              <h2 className={styles.modalTitle}>Delete Invoice</h2>
              <p className={styles.modalText}>
                Are you sure you want to delete <strong>{deleteTarget.invoiceNumber}</strong>
                {deleteTarget.clientCompany ? ` for ${deleteTarget.clientCompany}` : ""}? This action cannot be undone.
              </p>
              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.modalCancelBtn}
                  onClick={() => setDeleteTarget(null)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className={styles.modalDeleteBtn}
                  onClick={() => deleteInvoice(deleteTarget.id)}
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}

/* ── Status dropdown ── */
function StatusDropdown({ value, onChange, disabled }: { value: string; onChange: (s: string) => void; disabled: boolean }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const closeOnScroll = () => setOpen(false);
    document.addEventListener("mousedown", close);
    window.addEventListener("scroll", closeOnScroll, true);
    return () => {
      document.removeEventListener("mousedown", close);
      window.removeEventListener("scroll", closeOnScroll, true);
    };
  }, [open]);

  const toggle = () => {
    if (!open && wrapRef.current) {
      const rect = wrapRef.current.getBoundingClientRect();
      setPos({ top: rect.bottom + 4, left: rect.left });
    }
    setOpen(o => !o);
  };

  return (
    <div className={styles.statusWrap} ref={wrapRef}>
      <button
        type="button"
        className={`${styles.statusBadge} ${styles[`status_${value}`]}`}
        onClick={toggle}
        disabled={disabled}
      >
        {STATUS_LABELS[value] ?? value}
        <ChevronDown size={12} />
      </button>
      {open && (
        <div
          className={styles.statusDropdown}
          style={{ position: "fixed", top: pos.top, left: pos.left }}
        >
          {STATUS_OPTIONS.map(s => (
            <button
              key={s}
              type="button"
              className={`${styles.statusOption} ${s === value ? styles.statusOptionActive : ""}`}
              onClick={() => { onChange(s); setOpen(false); }}
            >
              <span className={`${styles.statusDot} ${styles[`dot_${s}`]}`} />
              {STATUS_LABELS[s]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
