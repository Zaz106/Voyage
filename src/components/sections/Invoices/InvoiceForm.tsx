"use client";

import React, { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Check, X, Plus, Trash2, ArrowUp, AlertCircle } from "lucide-react";
import DatePicker from "../../ui/DatePicker";
import styles from "./InvoiceForm.module.css";

/* ══════════════════════════════════════
   Constants
   ══════════════════════════════════════ */

const STORAGE_KEY = "voyage_invoice_draft";

/* ── Step configuration ── */
interface StepConfig {
  id: string;
  title: string;
  subtitle: string;
}

const STEPS: StepConfig[] = [
  { id: "client", title: "Client Details", subtitle: "Who is this invoice for?" },
  { id: "invoice", title: "Invoice Details", subtitle: "Set the invoice number, dates, and payment terms." },
  { id: "line-items", title: "Line Items", subtitle: "Add the products or services you're billing for." },
  { id: "additional", title: "Additional Info", subtitle: "Tax, discounts, notes, and payment instructions." },
  { id: "review", title: "Review Invoice", subtitle: "Check everything before generating the invoice." },
];

/* ── Required fields per step ── */
const REQUIRED_FIELDS: Record<string, string[]> = {
  client: ["clientName", "clientEmail"],
  invoice: ["invoiceNumber", "issueDate", "dueDate"],
  "line-items": [],
  additional: [],
};

/* ── Line item ── */
interface LineItem {
  id: string;
  description: string;
  quantity: string;
  rate: string;
}

const createLineItem = (): LineItem => ({
  id: crypto.randomUUID(),
  description: "",
  quantity: "1",
  rate: "",
});

/* ── Form data ── */
interface InvoiceFormData {
  /* Client */
  clientName: string;
  clientEmail: string;
  clientCompany: string;
  clientAddress: string;
  clientPhone: string;
  /* Invoice */
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  currency: string;
  paymentTerms: string;
  /* Additional */
  taxRate: string;
  discountType: string;
  discountValue: string;
  notes: string;
  paymentInstructions: string;
}

const initialFormData: InvoiceFormData = {
  clientName: "",
  clientEmail: "",
  clientCompany: "",
  clientAddress: "",
  clientPhone: "",
  invoiceNumber: "",
  issueDate: new Date().toISOString().split("T")[0],
  dueDate: "",
  currency: "ZAR",
  paymentTerms: "due-on-receipt",
  taxRate: "15",
  discountType: "none",
  discountValue: "",
  notes: "",
  paymentInstructions: `Account Holder: Joshua Huisman\nAccount Number: 1243280565\nAccount Type: Current account\nBank Name: Nedbank\nBranch Code: 198765`,
};

/* ── Animation variants ── */
const stepVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 30 : -30, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -30 : 30, opacity: 0 }),
};

/* ══════════════════════════════════════
   Component
   ══════════════════════════════════════ */
const InvoiceForm = () => {
  const [formData, setFormData] = useState<InvoiceFormData>(initialFormData);
  const [lineItems, setLineItems] = useState<LineItem[]>([createLineItem()]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(false);
  const [invoiceUrl, setInvoiceUrl] = useState("");
  const [validationErrors, setValidationErrors] = useState<Set<string>>(new Set());
  const [shakeFields, setShakeFields] = useState<Set<string>>(new Set());
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [hasNavigated, setHasNavigated] = useState(false);
  const [invoiceNumberLoading, setInvoiceNumberLoading] = useState(true);

  const formCardRef = useRef<HTMLDivElement>(null);
  const draftTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* ── Load draft from localStorage ── */
  // NOTE: Draft persistence includes paymentInstructions (bank details).
  // These are shared transfer details for clients, not personal credentials,
  // but if this changes revisit whether to exclude that field from storage.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.formData) setFormData(prev => ({ ...prev, ...parsed.formData }));
        if (parsed?.lineItems?.length) setLineItems(parsed.lineItems);
      }
    } catch {
      /* silently ignore corrupt saves */
    }
  }, []);

  /* ── Save draft on change ── */
  useEffect(() => {
    if (draftTimerRef.current) clearTimeout(draftTimerRef.current);
    draftTimerRef.current = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ formData, lineItems }));
      } catch {
        /* storage full */
      }
    }, 800);
    return () => {
      if (draftTimerRef.current) clearTimeout(draftTimerRef.current);
    };
  }, [formData, lineItems]);

  /* ── Back to top visibility ── */
  useEffect(() => {
    const handleScroll = () => setShowBackToTop(window.scrollY > 600);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /* ── Auto-generate sequential invoice number ── */
  useEffect(() => {
    if (!formData.invoiceNumber) {
      setInvoiceNumberLoading(true);
      fetch("/api/invoices?nextNumber=true")
        .then(res => res.json())
        .then(data => {
          if (data.invoiceNumber) {
            setFormData(prev => ({ ...prev, invoiceNumber: data.invoiceNumber }));
          }
        })
        .catch(() => {
          /* Fallback to timestamp-based if API fails */
          setFormData(prev => ({ ...prev, invoiceNumber: `INV-${String(Date.now()).slice(-6)}` }));
        })
        .finally(() => setInvoiceNumberLoading(false));
    } else {
      setInvoiceNumberLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Data helpers ── */
  const updateField = useCallback((field: keyof InvoiceFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setValidationErrors(prev => {
      if (!prev.has(field)) return prev;
      const n = new Set(prev);
      n.delete(field);
      return n;
    });
  }, []);

  /* ── Line item helpers ── */
  const updateLineItem = useCallback((id: string, field: keyof LineItem, value: string) => {
    setLineItems(prev => prev.map(item => (item.id === id ? { ...item, [field]: value } : item)));
  }, []);

  const addLineItem = useCallback(() => {
    setLineItems(prev => [...prev, createLineItem()]);
  }, []);

  const removeLineItem = useCallback((id: string) => {
    setLineItems(prev => (prev.length > 1 ? prev.filter(item => item.id !== id) : prev));
  }, []);

  /* ── Calculations ── */
  const subtotal = useMemo(() => {
    return lineItems.reduce((sum, item) => {
      const qty = parseFloat(item.quantity) || 0;
      const rate = parseFloat(item.rate) || 0;
      return sum + qty * rate;
    }, 0);
  }, [lineItems]);

  const discountAmount = useMemo(() => {
    const val = parseFloat(formData.discountValue) || 0;
    if (formData.discountType === "percentage") return subtotal * (val / 100);
    if (formData.discountType === "fixed") return val;
    return 0;
  }, [formData.discountType, formData.discountValue, subtotal]);

  const taxAmount = useMemo(() => {
    const rate = parseFloat(formData.taxRate) || 0;
    return (subtotal - discountAmount) * (rate / 100);
  }, [subtotal, discountAmount, formData.taxRate]);

  const total = useMemo(() => subtotal - discountAmount + taxAmount, [subtotal, discountAmount, taxAmount]);

  const CURRENCY_LOCALES: Record<string, string> = {
    ZAR: "en-ZA",
    USD: "en-US",
    GBP: "en-GB",
    EUR: "de-DE",
  };

  const currencySymbol = formData.currency === "ZAR" ? "R" : formData.currency === "USD" ? "$" : formData.currency === "GBP" ? "£" : formData.currency === "EUR" ? "€" : formData.currency;

  const formatCurrency = useCallback(
    (amount: number) => {
      const locale = CURRENCY_LOCALES[formData.currency] ?? "en-ZA";
      try {
        return new Intl.NumberFormat(locale, {
          style: "currency",
          currency: formData.currency,
          minimumFractionDigits: 2,
        }).format(amount);
      } catch {
        return `${currencySymbol}${amount.toFixed(2)}`;
      }
    },
    [formData.currency, currencySymbol],
  );

  /* ── Validation ── */
  const validateCurrentStep = (): boolean => {
    const stepId = STEPS[currentStepIndex]?.id;
    const requiredFields = REQUIRED_FIELDS[stepId || ""];
    if (!requiredFields) return true;

    const errors = new Set<string>();
    for (const field of requiredFields) {
      const val = formData[field as keyof InvoiceFormData];
      if (!val || !val.trim()) errors.add(field);
    }

    /* Email check */
    if (requiredFields.includes("clientEmail") && formData.clientEmail) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.clientEmail)) {
        errors.add("clientEmail");
      }
    }

    /* Line items — at least one must have description + rate */
    if (stepId === "line-items") {
      const hasValidItem = lineItems.some(li => li.description.trim() && (parseFloat(li.rate) || 0) > 0);
      if (!hasValidItem) errors.add("lineItems");
    }

    if (errors.size > 0) {
      setValidationErrors(errors);
      setShakeFields(new Set(errors));
      setTimeout(() => setShakeFields(new Set()), 400);
      const firstErrorField = requiredFields.find(f => errors.has(f)) ?? Array.from(errors)[0];
      if (firstErrorField) {
        setTimeout(() => {
          const el = document.getElementById(`field-${firstErrorField}`);
          if (el) {
            const rect = el.getBoundingClientRect();
            const centeredTop = rect.top + window.scrollY - window.innerHeight / 2 + rect.height / 2;
            window.scrollTo({ top: Math.max(0, centeredTop), behavior: "smooth" });
          }
        }, 50);
      }
      return false;
    }
    setValidationErrors(new Set());
    return true;
  };

  /* ── Navigation ── */
  const scrollToForm = () => {
    setTimeout(() => {
      if (formCardRef.current) {
        const top = formCardRef.current.getBoundingClientRect().top + window.scrollY - 100;
        window.scrollTo({ top, behavior: "smooth" });
      }
    }, 50);
  };

  const goNext = () => {
    if (!validateCurrentStep()) return;
    if (currentStepIndex < STEPS.length - 1) {
      setHasNavigated(true);
      setDirection(1);
      setCurrentStepIndex(prev => prev + 1);
      scrollToForm();
    }
  };

  const goBack = () => {
    if (currentStepIndex > 0) {
      setHasNavigated(true);
      setValidationErrors(new Set());
      setDirection(-1);
      setCurrentStepIndex(prev => prev - 1);
      scrollToForm();
    }
  };

  const goToStep = (index: number) => {
    if (index < currentStepIndex) {
      setHasNavigated(true);
      setValidationErrors(new Set());
      setDirection(-1);
      setCurrentStepIndex(index);
      scrollToForm();
    }
  };

  /* ── Submit ── */
  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        lineItems,
        subtotal,
        discountAmount,
        taxAmount,
        total,
      };

      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        setInvoiceUrl(`${window.location.origin}/invoices/${data.id}`);
        localStorage.removeItem(STORAGE_KEY);
        setSubmitError(false);
      } else {
        setSubmitError(true);
      }
    } catch {
      setSubmitError(true);
    } finally {
      setIsSubmitting(false);
      setShowConfirmModal(true);
    }
  };

  const handleCloseModal = () => {
    setShowConfirmModal(false);
    setSubmitError(false);
    setFormData({ ...initialFormData, invoiceNumber: "" });
    setLineItems([createLineItem()]);
    setCurrentStepIndex(0);
    setDirection(1);
    setValidationErrors(new Set());
    setShakeFields(new Set());
    setInvoiceUrl("");
    /* Fetch next sequential number */
    setInvoiceNumberLoading(true);
    fetch("/api/invoices?nextNumber=true")
      .then(res => res.json())
      .then(data => {
        if (data.invoiceNumber) setFormData(prev => ({ ...prev, invoiceNumber: data.invoiceNumber }));
      })
      .catch(() => {
        setFormData(prev => ({ ...prev, invoiceNumber: `INV-${String(Date.now()).slice(-6)}` }));
      })
      .finally(() => setInvoiceNumberLoading(false));
    scrollToForm();
  };

  const handleCloseErrorModal = () => {
    setShowConfirmModal(false);
    setSubmitError(false);
  };

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  /* ══════════════════════════════════════
     Reusable field renderers
     ══════════════════════════════════════ */

  const renderTextField = (field: keyof InvoiceFormData, label: string, placeholder = "", required = false, type = "text") => {
    const hasError = validationErrors.has(field);
    const shouldShake = shakeFields.has(field);
    return (
      <div id={`field-${field}`} className={`${styles.fieldGroup} ${shouldShake ? styles.shake : ""}`}>
        <label className={styles.fieldLabel}>
          {label}{required && <span className={styles.required}> *</span>}
        </label>
        <input
          type={type}
          className={`${styles.fieldInput} ${hasError ? styles.fieldInputError : ""}`}
          value={formData[field]}
          onChange={e => updateField(field, e.target.value)}
          placeholder={placeholder}
        />
      </div>
    );
  };

  const renderDateField = (field: keyof InvoiceFormData, label: string, required = false) => {
    const hasError = validationErrors.has(field);
    const shouldShake = shakeFields.has(field);
    return (
      <div id={`field-${field}`} className={`${styles.fieldGroup} ${shouldShake ? styles.shake : ""}`}>
        <label className={styles.fieldLabel}>
          {label}{required && <span className={styles.required}> *</span>}
        </label>
        <DatePicker
          value={formData[field]}
          onChange={val => updateField(field, val)}
          placeholder="Select date"
          className={styles.fieldInput}
          errorClassName={styles.fieldInputError}
          hasError={hasError}
        />
      </div>
    );
  };

  const renderTextarea = (field: keyof InvoiceFormData, label: string, placeholder = "", rows = 3, maxLength = 2000) => {
    const hasError = validationErrors.has(field);
    const shouldShake = shakeFields.has(field);
    const currentLen = formData[field].length;
    return (
      <div id={`field-${field}`} className={`${styles.fieldGroup} ${shouldShake ? styles.shake : ""}`}>
        <label className={styles.fieldLabel}>{label}</label>
        <div className={styles.textareaWrapper}>
          <textarea
            className={`${styles.fieldTextarea} ${hasError ? styles.fieldInputError : ""}`}
            value={formData[field]}
            onChange={e => updateField(field, e.target.value)}
            placeholder={placeholder}
            rows={rows}
            maxLength={maxLength}
          />
          <span className={`${styles.charCounter} ${currentLen >= maxLength * 0.9 ? styles.charCounterWarn : ""}`}>
            {currentLen}/{maxLength}
          </span>
        </div>
      </div>
    );
  };

  const renderSingleSelect = (field: keyof InvoiceFormData, label: string, options: { value: string; label: string }[], required = false) => {
    const shouldShake = shakeFields.has(field);
    return (
      <div id={`field-${field}`} className={`${styles.fieldGroup} ${shouldShake ? styles.shake : ""}`}>
        <label className={styles.fieldLabel}>
          {label}{required && <span className={styles.required}> *</span>}
        </label>
        <div className={styles.optionGroup}>
          {options.map(opt => (
            <button
              key={opt.value}
              type="button"
              className={`${styles.optionBtn} ${formData[field] === opt.value ? styles.optionSelected : ""}`}
              onClick={() => updateField(field, opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    );
  };

  /* ══════════════════════════════════════
     Step content renderers
     ══════════════════════════════════════ */

  const renderClientDetails = () => (
    <div className={styles.stepFields}>
      <div className={styles.fieldRow}>
        {renderTextField("clientName", "Client name", "e.g. John Doe", true)}
        {renderTextField("clientEmail", "Client email", "e.g. john@example.com", true, "email")}
      </div>
      <div className={styles.fieldRow}>
        {renderTextField("clientCompany", "Company name", "e.g. Acme Corp")}
        {renderTextField("clientPhone", "Phone number", "e.g. +27 82 000 0000")}
      </div>
      {renderTextarea("clientAddress", "Client address", "Full billing address...", 3, 500)}
    </div>
  );

  const renderInvoiceDetails = () => (
    <div className={styles.stepFields}>
      <div className={styles.fieldRow}>
        {renderTextField("invoiceNumber", "Invoice number", invoiceNumberLoading ? "Generating…" : "e.g. INV-001", true)}
        {renderSingleSelect("currency", "Currency", [
          { value: "ZAR", label: "ZAR (R)" },
          { value: "USD", label: "USD ($)" },
          { value: "GBP", label: "GBP (£)" },
          { value: "EUR", label: "EUR (€)" },
        ])}
      </div>
      <div className={styles.fieldRow}>
        {renderDateField("issueDate", "Issue date", true)}
        {renderDateField("dueDate", "Due date", true)}
      </div>
      {renderSingleSelect("paymentTerms", "Payment terms", [
        { value: "due-on-receipt", label: "Due on receipt" },
        { value: "net-7", label: "Net 7 days" },
        { value: "net-14", label: "Net 14 days" },
        { value: "net-30", label: "Net 30 days" },
        { value: "net-60", label: "Net 60 days" },
        { value: "custom", label: "Custom" },
      ])}
    </div>
  );

  const renderLineItems = () => {
    const hasError = validationErrors.has("lineItems");
    const shouldShake = shakeFields.has("lineItems");
    return (
      <div className={`${styles.stepFields} ${shouldShake ? styles.shake : ""}`}>
        {hasError && (
          <p className={styles.lineItemError}>Please add at least one item with a description and rate.</p>
        )}
        {lineItems.map((item, idx) => (
          <div key={item.id} className={styles.lineItemCard}>
            <div className={styles.lineItemHeader}>
              <span className={styles.lineItemIndex}>Item {idx + 1}</span>
              {lineItems.length > 1 && (
                <button type="button" className={styles.removeLineItem} onClick={() => removeLineItem(item.id)}>
                  <Trash2 size={16} />
                </button>
              )}
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>Description</label>
              <input
                type="text"
                className={styles.fieldInput}
                value={item.description}
                onChange={e => updateLineItem(item.id, "description", e.target.value)}
                placeholder="e.g. Website design & development"
              />
            </div>
            <div className={styles.lineItemRow}>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Quantity</label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  className={styles.fieldInput}
                  value={item.quantity}
                  onChange={e => updateLineItem(item.id, "quantity", e.target.value)}
                  placeholder="1"
                />
              </div>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Rate ({currencySymbol})</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className={styles.fieldInput}
                  value={item.rate}
                  onChange={e => updateLineItem(item.id, "rate", e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Amount</label>
                <div className={styles.lineItemAmount}>
                  {formatCurrency((parseFloat(item.quantity) || 0) * (parseFloat(item.rate) || 0))}
                </div>
              </div>
            </div>
          </div>
        ))}
        <button type="button" className={styles.addLineItemBtn} onClick={addLineItem}>
          <Plus size={18} />
          Add line item
        </button>

        {/* Running total */}
        <div className={styles.runningTotal}>
          <div className={styles.totalRow}>
            <span>Subtotal</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
        </div>
      </div>
    );
  };

  const renderAdditional = () => (
    <div className={styles.stepFields}>
      <div className={styles.fieldRow}>
        {renderTextField("taxRate", "Tax rate (%)", "e.g. 15")}
        {renderSingleSelect("discountType", "Discount", [
          { value: "none", label: "No discount" },
          { value: "percentage", label: "Percentage (%)" },
          { value: "fixed", label: `Fixed (${currencySymbol})` },
        ])}
      </div>
      {formData.discountType !== "none" && (
        <div className={styles.conditionalFields}>
          {renderTextField("discountValue", formData.discountType === "percentage" ? "Discount percentage" : "Discount amount", formData.discountType === "percentage" ? "e.g. 10" : "e.g. 500")}
        </div>
      )}
      {renderTextarea("notes", "Notes to client", "e.g. Thank you for your business!", 3, 1000)}
      {renderTextarea("paymentInstructions", "Payment instructions", "e.g. Bank name, account number, branch code...", 4, 1000)}

      {/* Totals summary */}
      <div className={styles.totalsSummary}>
        <div className={styles.totalRow}>
          <span>Subtotal</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
        {discountAmount > 0 && (
          <div className={styles.totalRow}>
            <span>Discount</span>
            <span>-{formatCurrency(discountAmount)}</span>
          </div>
        )}
        {taxAmount > 0 && (
          <div className={styles.totalRow}>
            <span>Tax ({formData.taxRate}%)</span>
            <span>{formatCurrency(taxAmount)}</span>
          </div>
        )}
        <div className={`${styles.totalRow} ${styles.totalRowFinal}`}>
          <span>Total</span>
          <span>{formatCurrency(total)}</span>
        </div>
      </div>
    </div>
  );

  /* ── Review step ── */
  const renderReview = () => (
    <div className={styles.stepFields}>
      {/* Client */}
      <div className={styles.summarySection}>
        <div className={styles.summarySectionHeader}>
          <h3>Client Details</h3>
          <button type="button" className={styles.editStepBtn} onClick={() => goToStep(0)}>Edit</button>
        </div>
        <SummaryRow label="Name" value={formData.clientName} />
        <SummaryRow label="Email" value={formData.clientEmail} />
        <SummaryRow label="Company" value={formData.clientCompany} />
        <SummaryRow label="Phone" value={formData.clientPhone} />
        <SummaryRow label="Address" value={formData.clientAddress} />
      </div>

      {/* Invoice */}
      <div className={styles.summarySection}>
        <div className={styles.summarySectionHeader}>
          <h3>Invoice Details</h3>
          <button type="button" className={styles.editStepBtn} onClick={() => goToStep(1)}>Edit</button>
        </div>
        <SummaryRow label="Invoice #" value={formData.invoiceNumber} />
        <SummaryRow label="Issue date" value={formData.issueDate} />
        <SummaryRow label="Due date" value={formData.dueDate} />
        <SummaryRow label="Currency" value={formData.currency} />
        <SummaryRow label="Payment terms" value={PAYMENT_TERM_LABELS[formData.paymentTerms] ?? formData.paymentTerms} />
      </div>

      {/* Line items */}
      <div className={styles.summarySection}>
        <div className={styles.summarySectionHeader}>
          <h3>Line Items</h3>
          <button type="button" className={styles.editStepBtn} onClick={() => goToStep(2)}>Edit</button>
        </div>
        {lineItems.filter(li => li.description.trim()).map((li, idx) => (
          <div key={li.id} className={styles.summaryRow}>
            <span className={styles.summaryLabel}>{idx + 1}. {li.description}</span>
            <span className={styles.summaryValue}>
              {li.quantity} × {formatCurrency(parseFloat(li.rate) || 0)} = {formatCurrency((parseFloat(li.quantity) || 0) * (parseFloat(li.rate) || 0))}
            </span>
          </div>
        ))}
      </div>

      {/* Totals */}
      <div className={styles.totalsSummary}>
        <div className={styles.totalRow}>
          <span>Subtotal</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
        {discountAmount > 0 && (
          <div className={styles.totalRow}>
            <span>Discount</span>
            <span>-{formatCurrency(discountAmount)}</span>
          </div>
        )}
        {taxAmount > 0 && (
          <div className={styles.totalRow}>
            <span>Tax ({formData.taxRate}%)</span>
            <span>{formatCurrency(taxAmount)}</span>
          </div>
        )}
        <div className={`${styles.totalRow} ${styles.totalRowFinal}`}>
          <span>Total</span>
          <span>{formatCurrency(total)}</span>
        </div>
      </div>

      {/* Notes/Payment */}
      {(formData.notes || formData.paymentInstructions) && (
        <div className={styles.summarySection}>
          <div className={styles.summarySectionHeader}>
            <h3>Additional</h3>
            <button type="button" className={styles.editStepBtn} onClick={() => goToStep(3)}>Edit</button>
          </div>
          {formData.notes && <SummaryRow label="Notes" value={formData.notes} />}
          {formData.paymentInstructions && <SummaryRow label="Payment instructions" value={formData.paymentInstructions} />}
        </div>
      )}
    </div>
  );

  /* ── Step router ── */
  const renderStep = () => {
    switch (STEPS[currentStepIndex]?.id) {
      case "client": return renderClientDetails();
      case "invoice": return renderInvoiceDetails();
      case "line-items": return renderLineItems();
      case "additional": return renderAdditional();
      case "review": return renderReview();
      default: return null;
    }
  };

  /* ── Derived ── */
  const currentStep = STEPS[currentStepIndex];
  const isReviewStep = currentStep?.id === "review";

  /* ══════════════════════════════════════
     Render
     ══════════════════════════════════════ */
  return (
    <section className={styles.formSection}>
      {/* Confirmation / Error modal */}
      {showConfirmModal && (
        <div className={styles.modalOverlay} onClick={submitError ? handleCloseErrorModal : handleCloseModal}>
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
              onClick={submitError ? handleCloseErrorModal : handleCloseModal}
              aria-label="Close"
            >
              <X size={18} />
            </button>

            {submitError ? (
              <>
                <div className={styles.errorIcon}><AlertCircle size={32} /></div>
                <h2 className={styles.thankYouTitle}>Something went wrong</h2>
                <p className={styles.thankYouText}>
                  We couldn&apos;t save the invoice. Please check your connection and try again.
                </p>
                <button type="button" className={styles.modalDoneBtn} onClick={handleCloseErrorModal}>
                  Try Again
                </button>
              </>
            ) : (
              <>
                <div className={styles.thankYouIcon}><Check size={32} /></div>
                <h2 className={styles.thankYouTitle}>Invoice Created</h2>
                <p className={styles.thankYouText}>
                  Your invoice has been generated. Share the link below with your client.
                </p>
                {invoiceUrl && (
                  <div className={styles.invoiceLinkBox}>
                    <input type="text" readOnly value={invoiceUrl} className={styles.invoiceLinkInput} onClick={e => (e.target as HTMLInputElement).select()} />
                    <button
                      type="button"
                      className={styles.copyBtn}
                      onClick={() => navigator.clipboard.writeText(invoiceUrl)}
                    >
                      Copy
                    </button>
                  </div>
                )}
                <button type="button" className={styles.modalDoneBtn} onClick={handleCloseModal}>
                  Create Another
                </button>
              </>
            )}
          </motion.div>
        </div>
      )}

      <div className={styles.formCard} ref={formCardRef}>
        {/* Pagination dots */}
        <div className={styles.pagination}>
          {STEPS.map((step, i) => (
            <button
              key={step.id}
              type="button"
              className={`${styles.paginationDot} ${i === currentStepIndex ? styles.paginationDotActive : ""} ${i < currentStepIndex ? styles.paginationDotCompleted : ""}`}
              onClick={() => (i < currentStepIndex ? goToStep(i) : undefined)}
              aria-label={`Step ${i + 1}: ${step.title}`}
            />
          ))}
        </div>

        <div className={styles.formCardInner}>
          <div className={styles.stepHeader}>
            <span className={styles.stepCounter}>Step {currentStepIndex + 1} of {STEPS.length}</span>
            <h2 className={styles.stepTitle}>{currentStep.title}</h2>
            <p className={styles.stepSubtitle}>{currentStep.subtitle}</p>
          </div>

          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentStep.id}
              custom={direction}
              variants={stepVariants}
              initial={hasNavigated ? "enter" : false}
              animate="center"
              exit="exit"
              transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>

          <div className={styles.navButtons}>
            {currentStepIndex > 0 ? (
              <button type="button" className={styles.backBtn} onClick={goBack}>
                <span className={styles.arrowIcon}>&rarr;</span> Back
              </button>
            ) : (
              <div />
            )}
            {isReviewStep ? (
              <button type="button" className={styles.submitBtn} onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? "Saving…" : "Generate Invoice"}
                {!isSubmitting && <Check size={0} />}
              </button>
            ) : (
              <button type="button" className={styles.nextBtn} onClick={goNext}>
                Next <span className={styles.arrowIcon}>&rarr;</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Floating back to top */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            className={styles.backToTop}
            onClick={scrollToTop}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
            aria-label="Back to top"
          >
            <ArrowUp size={20} />
          </motion.button>
        )}
      </AnimatePresence>
    </section>
  );
};

/* ── Small helper components ── */

const PAYMENT_TERM_LABELS: Record<string, string> = {
  "due-on-receipt": "Due on receipt",
  "net-7": "Net 7 days",
  "net-14": "Net 14 days",
  "net-30": "Net 30 days",
  "net-60": "Net 60 days",
  "custom": "Custom",
};

const SummaryRow = ({ label, value }: { label: string; value: string }) => (
  <div className={styles.summaryRow}>
    <span className={styles.summaryLabel}>{label}</span>
    <span className={value ? styles.summaryValue : `${styles.summaryValue} ${styles.summaryEmpty}`}>
      {value || "\u2014"}
    </span>
  </div>
);

export default InvoiceForm;
