"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Download, Loader2 } from "lucide-react";
import styles from "./DownloadPdfButton.module.css";

interface DownloadPdfButtonProps {
  invoiceId: string;
}

export default function DownloadPdfButton({ invoiceId }: DownloadPdfButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    if (loading) return;
    setLoading(true);
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
    } catch (err) {
      console.error("Download failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
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
  );
}
