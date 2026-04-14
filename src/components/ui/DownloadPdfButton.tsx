"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Download, Loader2, AlertCircle, X } from "lucide-react";
import styles from "./DownloadPdfButton.module.css";

interface DownloadPdfButtonProps {
  invoiceId: string;
}

export default function DownloadPdfButton({ invoiceId }: DownloadPdfButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const handleDownload = async () => {
    if (loading) return;
    setLoading(true);
    setError(false);
    try {
      const res = await fetch(`/api/invoices/pdf?id=${encodeURIComponent(invoiceId)}`);
      if (!res.ok) throw new Error("PDF generation failed");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `invoice-${invoiceId}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        <motion.button
          data-pdf-hide
          className={styles.fab}
          onClick={handleDownload}
          disabled={loading}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.5 }}
          aria-label="Download PDF"
          title="Download PDF"
        >
          {loading ? (
            <Loader2 size={20} className={styles.spinner} />
          ) : (
            <Download size={20} />
          )}
        </motion.button>
      </AnimatePresence>

      <AnimatePresence>
        {error && (
          <div className={styles.modalOverlay} onClick={() => setError(false)}>
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
                onClick={() => setError(false)}
                aria-label="Close"
              >
                <X size={18} />
              </button>
              <div className={styles.errorIcon}>
                <AlertCircle size={32} />
              </div>
              <h2 className={styles.modalTitle}>Download Failed</h2>
              <p className={styles.modalText}>
                We couldn&apos;t generate the PDF. Please check your connection and try again.
              </p>
              <button
                type="button"
                className={styles.modalDoneBtn}
                onClick={() => setError(false)}
              >
                Dismiss
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
