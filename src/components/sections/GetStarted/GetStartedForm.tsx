"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Check, Upload, X, Lightbulb, ArrowUp, AlertCircle } from "lucide-react";
import {
  ZAFlag, USFlag, GBFlag, AUFlag, CAFlag,
} from "../../ui/Icons";
import styles from "./GetStartedForm.module.css";

/* ══════════════════════════════════════
   Constants
   ══════════════════════════════════════ */

const STORAGE_KEY = "luxe_get_started_draft";

const ALLOWED_FILE_TYPES = [
  "image/png", "image/jpeg", "image/jpg", "image/gif", "image/webp", "image/svg+xml",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
];
const ALLOWED_EXTENSIONS = [".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg", ".pdf", ".doc", ".docx", ".ppt", ".pptx"];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const MAX_FILES = 5;

const countries = [
  { code: "ZA", dial: "+27", flag: <ZAFlag /> },
  { code: "US", dial: "+1", flag: <USFlag /> },
  { code: "GB", dial: "+44", flag: <GBFlag /> },
  { code: "AU", dial: "+61", flag: <AUFlag /> },
  { code: "CA", dial: "+1", flag: <CAFlag /> },
];

/* ── Step configuration ── */
interface StepConfig {
  id: string;
  title: string;
  subtitle: string;
}

const STEPS: Record<string, StepConfig> = {
  aboutYou: { id: "about-you", title: "About You", subtitle: "Let\u2019s start with some basics about you and your business." },
  digitalPresence: { id: "digital-presence", title: "Digital Presence", subtitle: "Tell us about your current online presence." },
  services: { id: "services", title: "Services Needed", subtitle: "What can we help you with?" },
  website: { id: "website", title: "Website", subtitle: "Tell us about the website you need." },
  ecommerce: { id: "ecommerce", title: "E-Commerce Store", subtitle: "Tell us about your online store needs." },
  app: { id: "app", title: "App Development", subtitle: "Tell us about the application you need built." },
  branding: { id: "branding", title: "Branding & Design", subtitle: "Tell us about your brand vision." },
  socialMedia: { id: "social-media", title: "Social Media", subtitle: "Tell us about your social media goals." },
  budget: { id: "budget", title: "Budget & Timeline", subtitle: "Help us understand your practical constraints." },
  final: { id: "final", title: "Final Details", subtitle: "Just a few more things before we wrap up." },
  review: { id: "review", title: "Review Your Answers", subtitle: "Here\u2019s a summary of everything you\u2019ve told us." },
};

const SERVICE_MAP: Record<string, StepConfig> = {
  "Website": STEPS.website,
  "E-Commerce Store": STEPS.ecommerce,
  "Mobile or Web Application": STEPS.app,
  "Branding & Graphic Design": STEPS.branding,
  "Social Media Management": STEPS.socialMedia,
};

const SERVICE_ORDER = [
  "Website", "E-Commerce Store", "Mobile or Web Application",
  "Branding & Graphic Design", "Social Media Management",
];

/* ── Required fields per step ── */
const REQUIRED_FIELDS: Record<string, string[]> = {
  "about-you": ["fullName", "email", "businessName", "businessDescription", "targetAudience"],
  "digital-presence": ["existingBranding", "hasWebsite"],
  "services": ["servicesNeeded"],
  "website": ["websiteGoal", "contentReady", "needsCMS"],
  "ecommerce": ["sellingType", "productCount", "needsOnlinePayments"],
  "app": ["appType", "appDescription", "appUserType"],
  "branding": ["brandingDeliverables", "brandPersonality"],
  "social-media": ["managedPlatforms", "socialMediaGoal", "contentCreation"],
  "budget": ["budget", "timeline"],
};

/* ── Human-readable display labels for review step ── */
const FIELD_DISPLAY_LABELS: Record<string, Record<string, string>> = {
  operatingTime: {
    "pre-launch": "Pre-launch / Not yet open",
    "less-than-1": "Less than 1 year",
    "1-3": "1–3 years",
    "3+": "3+ years",
  },
  businessSize: {
    "solo": "Solo / Freelancer",
    "small": "Small (2–10 people)",
    "medium": "Medium (11–50 people)",
    "large": "Large (50+ people)",
  },
  existingBranding: {
    "fully-developed": "Yes, fully developed",
    "partial": "Partially (logo or colours only)",
    "none": "No, starting from scratch",
  },
  hasWebsite: { "yes": "Yes", "no": "No" },
  socialMediaActive: { "yes": "Yes", "no": "No" },
  googleBusinessProfile: { "yes": "Yes", "no": "No", "not-sure": "Not sure" },
  websiteGoal: {
    "leads": "Generate leads / enquiries",
    "portfolio": "Showcase work or portfolio",
    "information": "Provide information",
    "sell": "Sell products or services",
    "bookings": "Book appointments or classes",
    "other": "Other",
  },
  contentReady: {
    "yes": "Yes, everything is ready",
    "partial": "Partially ready",
    "no": "No, I'll need help",
  },
  hasReferenceWebsites: { "yes": "Yes", "no": "No" },
  multiLanguage: { "yes": "Yes", "no": "No" },
  needsCMS: {
    "yes": "Yes — I'd like a CMS",
    "no": "No — I'll rely on your team",
  },
  needsContactForm: { "yes": "Yes", "no": "No" },
  needsBooking: { "yes": "Yes", "no": "No" },
  sellingType: {
    "physical": "Physical products",
    "digital": "Digital products",
    "both": "Both physical and digital",
  },
  productCount: {
    "1-10": "1–10 products",
    "11-50": "11–50 products",
    "51-200": "51–200 products",
    "200+": "200+ products",
  },
  hasEcommercePlatform: { "yes": "Yes", "no": "No" },
  storeIntegration: {
    "integrated": "Integrated into my website",
    "standalone": "Standalone store",
    "not-sure": "Not sure",
  },
  needsInventory: { "yes": "Yes", "no": "No", "not-sure": "Not sure" },
  needsOnlinePayments: { "yes": "Yes", "no": "No", "not-sure": "Not sure" },
  needsOrderTracking: { "yes": "Yes", "no": "No", "not-sure": "Not sure" },
  appType: {
    "mobile": "Mobile app (iOS / Android)",
    "web": "Web app (browser-based)",
    "desktop": "Desktop application",
    "not-sure": "Not sure",
  },
  appUserType: {
    "public": "Customers / public users",
    "internal": "Internal team only",
    "both": "Both internal and external",
  },
  needsUserAccounts: { "yes": "Yes", "no": "No", "not-sure": "Not sure" },
  needsExternalIntegrations: { "yes": "Yes", "no": "No" },
  hasWireframes: { "yes": "Yes", "no": "No" },
  hasBrandExamples: { "yes": "Yes", "no": "No" },
  currentPostingFrequency: {
    "regularly": "Yes, regularly",
    "occasionally": "Yes, occasionally",
    "no": "Not currently posting",
  },
  socialMediaGoal: {
    "awareness": "Grow followers & brand awareness",
    "traffic": "Drive traffic to website",
    "leads": "Generate leads & enquiries",
    "promote": "Promote products / services",
    "all": "All of the above",
  },
  desiredPostFrequency: {
    "1-2": "1–2 times per week",
    "3-4": "3–4 times per week",
    "daily": "Daily",
    "not-sure": "Open to recommendation",
  },
  contentCreation: {
    "provide": "I will provide content",
    "create": "I need you to create it",
    "mix": "A mix of both",
  },
  paidAds: {
    "currently": "Yes, currently running ads",
    "interested": "Yes, interested in starting",
    "no": "No",
  },
  budget: {
    "under-5k": "Under R5,000",
    "5k-15k": "R5,000 – R15,000",
    "15k-30k": "R15,000 – R30,000",
    "30k-50k": "R30,000 – R50,000",
    "50k+": "R50,000+",
    "not-sure": "Not sure yet",
  },
  timeline: {
    "asap": "As soon as possible",
    "1-month": "Within 1 month",
    "1-3-months": "1–3 months",
    "3-6-months": "3–6 months",
    "no-deadline": "No fixed deadline",
  },
  deadlineFlexible: { "yes": "Yes", "no": "No", "somewhat": "Somewhat" },
  decisionMaker: {
    "myself": "Myself",
    "someone-else": "Someone else",
    "team": "A team of people",
  },
  howHeardAboutUs: {
    "referral": "Referral",
    "social-media": "Social media",
    "google": "Google search",
    "other": "Other",
  },
};

const formatFieldValue = (field: string, val: string | string[]): string => {
  if (Array.isArray(val)) {
    return val.map(v => FIELD_DISPLAY_LABELS[field]?.[v] ?? v).join(", ");
  }
  return FIELD_DISPLAY_LABELS[field]?.[val] ?? val;
};

/* ── Form data ── */
interface FormData {
  [key: string]: string | string[];
}

const initialFormData: FormData = {
  fullName: "", email: "", phone: "", businessName: "", industry: "", location: "",
  operatingTime: "", businessSize: "", businessDescription: "", targetAudience: "",
  existingBranding: "", hasWebsite: "", websiteUrl: "", websiteDislikes: "",
  socialMediaActive: "", socialPlatforms: [], googleBusinessProfile: "",
  servicesNeeded: [],
  websiteGoal: "", websiteGoalOther: "", websitePages: [], websitePagesOther: "",
  contentReady: "", hasReferenceWebsites: "", referenceWebsiteUrls: "",
  multiLanguage: "", needsCMS: "", needsContactForm: "", needsBooking: "", existingBookingTool: "",
  sellingType: "", productCount: "", hasEcommercePlatform: "", currentEcommercePlatform: "",
  storeIntegration: "", needsInventory: "", needsOnlinePayments: "", needsOrderTracking: "",
  appType: "", appDescription: "", appUserType: "", needsUserAccounts: "",
  needsExternalIntegrations: "", integrationDetails: "", hasWireframes: "", wireframeDetails: "",
  brandingDeliverables: [], brandingDeliverablesOther: "", brandPersonality: [],
  brandPersonalityOther: "", hasBrandExamples: "", brandExamples: "", avoidStyles: "",
  managedPlatforms: [], managedPlatformsOther: "", currentPostingFrequency: "",
  socialMediaGoal: "", desiredPostFrequency: "", contentCreation: "", paidAds: "",
  budget: "", timeline: "", deadlineFlexible: "",
  decisionMaker: "", decisionMakerDetails: "", howHeardAboutUs: "", howHeardDetails: "", additionalNotes: "",
  // Anti-bot honeypot (must stay empty)
  _hp: "",
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
const GetStartedForm = () => {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Set<string>>(new Set());
  const [shakeFields, setShakeFields] = useState<Set<string>>(new Set());

  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(countries[0]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const formCardRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const draftTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* ── Compute active steps based on selected services ── */
  const activeSteps = useMemo(() => {
    const steps: StepConfig[] = [STEPS.aboutYou, STEPS.digitalPresence, STEPS.services];
    const services = (formData.servicesNeeded as string[]) || [];
    for (const svc of SERVICE_ORDER) {
      if (services.includes(svc) && SERVICE_MAP[svc]) {
        steps.push(SERVICE_MAP[svc]);
      }
    }
    steps.push(STEPS.budget, STEPS.final, STEPS.review);
    return steps;
  }, [formData.servicesNeeded]);

  /* ── Clamp step index when steps change ── */
  useEffect(() => {
    if (currentStepIndex >= activeSteps.length) {
      setCurrentStepIndex(activeSteps.length - 1);
    }
  }, [activeSteps.length, currentStepIndex]);

  /* ── Load draft from localStorage ── */
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === "object") {
          setFormData(prev => ({ ...prev, ...parsed, _hp: "" }));
        }
      }
    } catch {
      // silently ignore corrupt saves
    }
  }, []);

  /* ── Auto-detect country ── */
  useEffect(() => {
    const getCountryCode = async () => {
      try {
        const cached = localStorage.getItem("user_country_code");
        if (cached) {
          const country = countries.find(c => c.code === cached);
          if (country) { setSelectedCountry(country); return; }
        }
        const res = await fetch("https://ipapi.co/json/");
        if (!res.ok) return;
        const data = await res.json();
        const country = countries.find(c => c.code === data.country_code);
        if (country) {
          setSelectedCountry(country);
          localStorage.setItem("user_country_code", data.country_code);
        }
      } catch { /* silently fail */ }
    };
    getCountryCode();
  }, []);

  /* ── Save draft on data change ── */
  useEffect(() => {
    if (draftTimerRef.current) clearTimeout(draftTimerRef.current);
    draftTimerRef.current = setTimeout(() => {
      try {
        const { _hp, ...draftData } = formData;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(draftData));
      } catch { /* storage full */ }
    }, 800);
    return () => { if (draftTimerRef.current) clearTimeout(draftTimerRef.current); };
  }, [formData]);

  /* ── Back to top visibility ── */
  useEffect(() => {
    const handleScroll = () => setShowBackToTop(window.scrollY > 600);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /* ── Close dropdown on outside click ── */
  useEffect(() => {
    if (!isDropdownOpen) return;
    const handler = () => setIsDropdownOpen(false);
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [isDropdownOpen]);

  /* ── Data helpers ── */
  const str = (field: string): string => (formData[field] as string) || "";
  const arr = (field: string): string[] => (formData[field] as string[]) || [];

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (validationErrors.has(field)) {
      setValidationErrors(prev => { const n = new Set(prev); n.delete(field); return n; });
    }
  };

  const toggleArrayField = (field: string, value: string) => {
    setFormData(prev => {
      const current = (prev[field] as string[]) || [];
      const updated = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value];
      return { ...prev, [field]: updated };
    });
    if (validationErrors.has(field)) {
      setValidationErrors(prev => { const n = new Set(prev); n.delete(field); return n; });
    }
  };

  const handleServiceToggle = (value: string) => {
    setFormData(prev => {
      const current = (prev.servicesNeeded as string[]) || [];
      if (value === "Not sure") {
        return { ...prev, servicesNeeded: current.includes("Not sure") ? [] : ["Not sure"] };
      }
      let updated = current.filter(v => v !== "Not sure");
      updated = updated.includes(value)
        ? updated.filter(v => v !== value)
        : [...updated, value];
      return { ...prev, servicesNeeded: updated };
    });
    if (validationErrors.has("servicesNeeded")) {
      setValidationErrors(prev => { const n = new Set(prev); n.delete("servicesNeeded"); return n; });
    }
  };

  /* ── Phone formatting ── */
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let digits = e.target.value.replace(/\D/g, "");
    let value: string;
    if (selectedCountry.code === "ZA") {
      if (digits.length > 9 && digits.startsWith("0")) digits = digits.substring(1);
      value = digits.substring(0, 9).replace(/^(\d{2})(\d{0,3})(\d{0,4}).*/, (_, p1, p2, p3) => {
        let r = p1; if (p2) r += " " + p2; if (p3) r += " " + p3; return r;
      });
    } else if (selectedCountry.code === "US" || selectedCountry.code === "CA") {
      if (digits.length > 10 && digits.startsWith("1")) digits = digits.substring(1);
      value = digits.substring(0, 10).replace(/^(\d{3})(\d{0,3})(\d{0,4}).*/, (_, p1, p2, p3) => {
        let r = p1; if (p2) r += " " + p2; if (p3) r += " " + p3; return r;
      });
    } else {
      value = digits.replace(/(\d{3})(?=\d)/g, "$1 ");
    }
    updateField("phone", value);
  };

  const getPhonePlaceholder = (code: string) => {
    switch (code) { case "ZA": return "00 000 0000"; case "US": case "CA": return "000 000 0000"; default: return "000 000 000"; }
  };

  /* ── File upload ── */
  const validateFile = (file: File): string | null => {
    const ext = "." + file.name.split(".").pop()?.toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) return `"${file.name}" is not an allowed file type.`;
    if (!ALLOWED_FILE_TYPES.includes(file.type) && file.type !== "") return `"${file.name}" has an invalid MIME type.`;
    if (file.size > MAX_FILE_SIZE) return `"${file.name}" exceeds the 10 MB limit.`;
    // Extra safety: check for double extensions like .jpg.exe
    const parts = file.name.split(".");
    if (parts.length > 2) {
      const suspicious = parts.slice(1).some(p => ["exe", "bat", "cmd", "msi", "ps1", "sh", "js", "vbs", "scr", "com", "pif"].includes(p.toLowerCase()));
      if (suspicious) return `"${file.name}" appears to contain a suspicious extension.`;
    }
    return null;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const remaining = MAX_FILES - uploadedFiles.length;
    const toAdd = files.slice(0, remaining);
    const validFiles: File[] = [];
    for (const file of toAdd) {
      const error = validateFile(file);
      if (!error) validFiles.push(file);
    }
    setUploadedFiles(prev => [...prev, ...validFiles]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeUploadedFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  /* ── Validation ── */
  const validateCurrentStep = (): boolean => {
    const stepId = activeSteps[currentStepIndex]?.id;
    const requiredFields = REQUIRED_FIELDS[stepId || ""];
    if (!requiredFields) return true;

    const errors = new Set<string>();
    for (const field of requiredFields) {
      const val = formData[field];
      if (Array.isArray(val) ? val.length === 0 : !val || !(val as string).trim()) {
        errors.add(field);
      }
    }

    // Email validation
    if (requiredFields.includes("email") && str("email")) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(str("email"))) errors.add("email");
    }

    // Phone minimum-length check (optional field, but must be valid if filled)
    if (stepId === "about-you" && str("phone") && str("phone").replace(/\D/g, "").length < 7) {
      errors.add("phone");
    }

    // Website URL format check (optional field, but must look like a URL if filled)
    if (stepId === "digital-presence" && str("hasWebsite") === "yes" && str("websiteUrl")) {
      if (!/^(https?:\/\/|www\.)/i.test(str("websiteUrl").trim())) {
        errors.add("websiteUrl");
      }
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
    if (currentStepIndex < activeSteps.length - 1) {
      setDirection(1);
      setCurrentStepIndex(prev => prev + 1);
      scrollToForm();
    }
  };

  const goBack = () => {
    if (currentStepIndex > 0) {
      setValidationErrors(new Set());
      setDirection(-1);
      setCurrentStepIndex(prev => prev - 1);
      scrollToForm();
    }
  };

  const goToStep = (index: number) => {
    if (index < currentStepIndex) {
      setValidationErrors(new Set());
      setDirection(-1);
      setCurrentStepIndex(index);
      scrollToForm();
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("brief", JSON.stringify({ ...formData, phoneCountryCode: selectedCountry.dial }));
      uploadedFiles.forEach((file) => fd.append("file", file, file.name));

      const res = await fetch("/api/send-brief", {
        method: "POST",
        body: fd,
      });

      if (res.ok) {
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
    setFormData(initialFormData);
    setCurrentStepIndex(0);
    setDirection(1);
    setValidationErrors(new Set());
    setShakeFields(new Set());
    setUploadedFiles([]);
    scrollToForm();
  };

  const handleCloseErrorModal = () => {
    setShowConfirmModal(false);
    setSubmitError(false);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /* ══════════════════════════════════════
     Reusable field renderers
     ══════════════════════════════════════ */

  const renderTextField = (field: string, label: string, placeholder = "", required = false, maxLength = 200) => {
    const hasError = validationErrors.has(field);
    const shouldShake = shakeFields.has(field);
    return (
      <div id={`field-${field}`} className={`${styles.fieldGroup} ${shouldShake ? styles.shake : ""}`}>
        <label className={styles.fieldLabel}>
          {label}{required && <span className={styles.required}> *</span>}
        </label>
        <input
          type={field === "email" ? "email" : "text"}
          className={`${styles.fieldInput} ${hasError ? styles.fieldInputError : ""}`}
          value={str(field)}
          onChange={(e) => updateField(field, e.target.value)}
          onBlur={field !== "email" ? undefined : () => {
            const v = str("email");
            if (v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) {
              setValidationErrors(prev => new Set([...prev, "email"]));
            }
          }}
          placeholder={placeholder}
          maxLength={maxLength}
        />
      </div>
    );
  };

  const renderTextarea = (field: string, label: string, placeholder = "", rows = 3, required = false, maxLength = 2000) => {
    const hasError = validationErrors.has(field);
    const shouldShake = shakeFields.has(field);
    const currentLen = str(field).length;
    return (
      <div id={`field-${field}`} className={`${styles.fieldGroup} ${shouldShake ? styles.shake : ""}`}>
        <label className={styles.fieldLabel}>
          {label}{required && <span className={styles.required}> *</span>}
        </label>
        <div className={styles.textareaWrapper}>
          <textarea
            className={`${styles.fieldTextarea} ${hasError ? styles.fieldInputError : ""}`}
            value={str(field)}
            onChange={(e) => updateField(field, e.target.value)}
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

  const renderSingleSelect = (field: string, label: string, options: { value: string; label: string }[], required = false) => {
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
              className={`${styles.optionBtn} ${str(field) === opt.value ? styles.optionSelected : ""}`}
              onClick={() => updateField(field, opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    );
  };

  const renderMultiSelect = (field: string, label: string, options: { value: string; label: string }[], required = false) => {
    const shouldShake = shakeFields.has(field);
    return (
      <div id={`field-${field}`} className={`${styles.fieldGroup} ${shouldShake ? styles.shake : ""}`}>
        <label className={styles.fieldLabel}>
          {label}{required && <span className={styles.required}> *</span>}
        </label>
        <div className={styles.chipGroup}>
          {options.map(opt => (
            <button
              key={opt.value}
              type="button"
              className={`${styles.chip} ${arr(field).includes(opt.value) ? styles.chipSelected : ""}`}
              onClick={() => toggleArrayField(field, opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    );
  };

  const renderFileUpload = (label: string) => (
    <div className={styles.fieldGroup}>
      <label className={styles.fieldLabel}>{label}</label>
      <div className={styles.uploadArea} onClick={() => fileInputRef.current?.click()}>
        <div className={styles.uploadIcon}><Upload size={24} /></div>
        <p className={styles.uploadText}>Click to upload files</p>
        <p className={styles.uploadHint}>PNG, JPG, PDF, DOC, PPT — max 10 MB each, up to {MAX_FILES} files</p>
      </div>
      {uploadedFiles.length > 0 && (
        <div className={styles.uploadedFiles}>
          {uploadedFiles.map((file, i) => (
            <div key={`${file.name}-${i}`} className={styles.uploadedFile}>
              <span>{file.name}</span>
              <button type="button" className={styles.removeFile} onClick={() => removeUploadedFile(i)}>
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  /* ── Phone field ── */
  const renderPhoneField = () => {
    const hasError = validationErrors.has("phone");
    return (
      <div className={styles.fieldGroup}>
        <label className={styles.fieldLabel}>Phone number</label>
        <div className={`${styles.phoneInputContainer} ${hasError ? styles.phoneInputContainerError : ""}`}>
          <div
            className={styles.countrySelector}
            onClick={(e) => { e.stopPropagation(); setIsDropdownOpen(!isDropdownOpen); }}
          >
            <div className={styles.flagIcon}>{selectedCountry.flag}</div>
            <span className={styles.countryCode}>{selectedCountry.dial}</span>
            {isDropdownOpen && (
              <div className={styles.countryDropdown}>
                {countries.map(c => (
                  <div
                    key={c.code}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedCountry(c);
                      setIsDropdownOpen(false);
                      updateField("phone", "");
                    }}
                    className={styles.countryOption}
                  >
                    <div className={styles.optionFlag}>{c.flag}</div>
                    <span>{c.code}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <input
            type="tel"
            className={styles.phoneInput}
            value={str("phone")}
            onChange={handlePhoneChange}
            placeholder={getPhonePlaceholder(selectedCountry.code)}
          />
        </div>
      </div>
    );
  };

  /* ══════════════════════════════════════
     Step content renderers
     ══════════════════════════════════════ */

  const renderAboutYou = () => (
    <div className={styles.stepFields}>
      <div className={styles.fieldRow}>
        {renderTextField("fullName", "What is your full name?", "e.g. John Doe", true)}
        {renderTextField("businessName", "What is your business name?", "e.g. Acme Corp", true)}
      </div>
      <div className={styles.phoneRow}>
        {renderTextField("email", "Email address", "e.g. john@example.com", true, 254)}
        {renderPhoneField()}
      </div>
      <div className={styles.fieldRow}>
        {renderTextField("industry", "What industry are you in?", "e.g. Real Estate, Fitness, Tech")}
        {renderTextField("location", "Where is your business based?", "e.g. Cape Town, Western Cape")}
      </div>
      {renderSingleSelect("operatingTime", "How long have you been operating?", [
        { value: "pre-launch", label: "Pre-launch / Not yet open" },
        { value: "less-than-1", label: "Less than 1 year" },
        { value: "1-3", label: "1\u20133 years" },
        { value: "3+", label: "3+ years" },
      ])}
      {renderSingleSelect("businessSize", "How would you describe your business size?", [
        { value: "solo", label: "Solo / Freelancer" },
        { value: "small", label: "Small (2\u201310)" },
        { value: "medium", label: "Medium (11\u201350)" },
        { value: "large", label: "Large (50+)" },
      ])}
      {renderTextarea("businessDescription", "What does your business do?", "Give us a brief overview of your business...", 3, true)}
      {renderTextarea("targetAudience", "Who is your target audience?", "Describe your ideal customer or client...", 3, true)}
    </div>
  );

  const renderDigitalPresence = () => (
    <div className={styles.stepFields}>
      {renderSingleSelect("existingBranding", "Do you have existing branding? (logo, colours, fonts)", [
        { value: "fully-developed", label: "Yes, fully developed" },
        { value: "partial", label: "Partially (logo or colours only)" },
        { value: "none", label: "No, starting from scratch" },
      ], true)}
      {renderSingleSelect("hasWebsite", "Do you have an existing website?", [
        { value: "yes", label: "Yes" },
        { value: "no", label: "No" },
      ], true)}
      {str("hasWebsite") === "yes" && (
        <div className={styles.conditionalFields}>
          {renderTextField("websiteUrl", "What is the URL?", "e.g. www.example.com", false, 500)}
          {renderTextarea("websiteDislikes", "What do you dislike about it?", "Tell us what\u2019s not working...")}
        </div>
      )}
      {renderSingleSelect("socialMediaActive", "Are you active on social media?", [
        { value: "yes", label: "Yes" },
        { value: "no", label: "No" },
      ])}
      {str("socialMediaActive") === "yes" && (
        <div className={styles.conditionalFields}>
          {renderMultiSelect("socialPlatforms", "Which platforms?", [
            { value: "Instagram", label: "Instagram" }, { value: "Facebook", label: "Facebook" },
            { value: "TikTok", label: "TikTok" }, { value: "LinkedIn", label: "LinkedIn" },
            { value: "X", label: "X (Twitter)" }, { value: "YouTube", label: "YouTube" },
            { value: "Other", label: "Other" },
          ])}
        </div>
      )}
      {renderSingleSelect("googleBusinessProfile", "Do you have a Google Business Profile?", [
        { value: "yes", label: "Yes" },
        { value: "no", label: "No" },
        { value: "not-sure", label: "Not sure" },
      ])}
    </div>
  );

  const renderServicesNeeded = () => (
    <div className={styles.stepFields}>
      <div id="field-servicesNeeded" className={`${styles.fieldGroup} ${shakeFields.has("servicesNeeded") ? styles.shake : ""}`}>
        <label className={styles.fieldLabel}>
          Which of the following do you need? <span className={styles.required}>*</span>
        </label>
        <div className={styles.chipGroup}>
          {[
            { value: "Website", label: "Website" },
            { value: "E-Commerce Store", label: "E-Commerce Store" },
            { value: "Mobile or Web Application", label: "Mobile or Web App" },
            { value: "Branding & Graphic Design", label: "Branding & Design" },
            { value: "Social Media Management", label: "Social Media Management" },
            { value: "Not sure", label: "Not sure \u2014 I\u2019d like guidance" },
          ].map(opt => (
            <button
              key={opt.value}
              type="button"
              className={`${styles.chip} ${arr("servicesNeeded").includes(opt.value) ? styles.chipSelected : ""}`}
              onClick={() => handleServiceToggle(opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
      <p className={styles.multiSelectHint}>Select all that apply. Your selections determine which sections appear next.</p>
      {arr("servicesNeeded").includes("Not sure") && (
        <div className={styles.guidanceCallout}>
          <Lightbulb size={20} className={styles.guidanceIcon} />
          <p className={styles.guidanceText}>
            No problem — we&apos;ll review your answers and recommend the right services during your consultation. Just carry on with the rest of the form.
          </p>
        </div>
      )}
    </div>
  );

  const renderWebsite = () => (
    <div className={styles.stepFields}>
      {renderSingleSelect("websiteGoal", "What is the primary goal of your website?", [
        { value: "leads", label: "Generate leads / enquiries" },
        { value: "portfolio", label: "Showcase work or portfolio" },
        { value: "information", label: "Provide information" },
        { value: "sell", label: "Sell products or services" },
        { value: "bookings", label: "Book appointments or classes" },
        { value: "other", label: "Other" },
      ], true)}
      {str("websiteGoal") === "other" && (
        <div className={styles.conditionalFields}>{renderTextField("websiteGoalOther", "Please describe", "What is the primary goal?")}</div>
      )}
      {renderMultiSelect("websitePages", "What pages do you think you need?", [
        { value: "Home", label: "Home" }, { value: "About", label: "About" },
        { value: "Services", label: "Services" }, { value: "Portfolio", label: "Portfolio / Gallery" },
        { value: "Blog", label: "Blog / News" }, { value: "Contact", label: "Contact" },
        { value: "FAQ", label: "FAQ" }, { value: "Booking", label: "Booking / Appointments" },
        { value: "Legal", label: "Terms & Privacy Policy" }, { value: "Other", label: "Other" },
      ])}
      {arr("websitePages").includes("Other") && (
        <div className={styles.conditionalFields}>{renderTextField("websitePagesOther", "What other pages do you need?", "e.g. Careers, Resources")}</div>
      )}
      {renderSingleSelect("contentReady", "Do you have content ready? (text, images, videos)", [
        { value: "yes", label: "Yes, everything is ready" }, { value: "partial", label: "Partially ready" }, { value: "no", label: "No, I\u2019ll need help" },
      ], true)}
      {renderSingleSelect("hasReferenceWebsites", "Do you have reference websites you like the look of?", [
        { value: "yes", label: "Yes" }, { value: "no", label: "No" },
      ])}
      {str("hasReferenceWebsites") === "yes" && (
        <div className={styles.conditionalFields}>{renderTextarea("referenceWebsiteUrls", "Please share the URLs", "e.g. www.example.com, www.another.com")}</div>
      )}
      {renderSingleSelect("multiLanguage", "Do you need the website in more than one language?", [
        { value: "yes", label: "Yes" }, { value: "no", label: "No" },
      ])}
      {renderSingleSelect("needsCMS", "Will you need to update the website yourself after launch?", [
        { value: "yes", label: "Yes \u2014 I\u2019d like a CMS" }, { value: "no", label: "No \u2014 I\u2019ll rely on your team" },
      ], true)}
      {renderSingleSelect("needsContactForm", "Do you need a contact or enquiry form?", [
        { value: "yes", label: "Yes" }, { value: "no", label: "No" },
      ])}
      {renderSingleSelect("needsBooking", "Do you need appointment or class booking functionality?", [
        { value: "yes", label: "Yes" }, { value: "no", label: "No" },
      ])}
      {str("needsBooking") === "yes" && (
        <div className={styles.conditionalFields}>{renderTextField("existingBookingTool", "Do you use any existing booking tool?", "e.g. Calendly, Acuity, etc.")}</div>
      )}
    </div>
  );

  const renderEcommerce = () => (
    <div className={styles.stepFields}>
      {renderSingleSelect("sellingType", "What are you selling?", [
        { value: "physical", label: "Physical products" }, { value: "digital", label: "Digital products" }, { value: "both", label: "Both" },
      ], true)}
      {renderSingleSelect("productCount", "How many products do you plan to launch with?", [
        { value: "1-10", label: "1\u201310" }, { value: "11-50", label: "11\u201350" }, { value: "51-200", label: "51\u2013200" }, { value: "200+", label: "200+" },
      ], true)}
      {renderSingleSelect("hasEcommercePlatform", "Do you already have an e-commerce platform?", [
        { value: "yes", label: "Yes" }, { value: "no", label: "No" },
      ])}
      {str("hasEcommercePlatform") === "yes" && (
        <div className={styles.conditionalFields}>{renderTextField("currentEcommercePlatform", "Which platform?", "e.g. Shopify, WooCommerce")}</div>
      )}
      {renderSingleSelect("storeIntegration", "Do you need the store integrated into your website or standalone?", [
        { value: "integrated", label: "Integrated into my website" }, { value: "standalone", label: "Standalone store" }, { value: "not-sure", label: "Not sure" },
      ])}
      {renderSingleSelect("needsInventory", "Do you need inventory management?", [
        { value: "yes", label: "Yes" }, { value: "no", label: "No" }, { value: "not-sure", label: "Not sure" },
      ])}
      {renderSingleSelect("needsOnlinePayments", "Do you need to accept payments online?", [
        { value: "yes", label: "Yes" }, { value: "no", label: "No" }, { value: "not-sure", label: "Not sure" },
      ], true)}
      {renderSingleSelect("needsOrderTracking", "Do you need order tracking or customer accounts?", [
        { value: "yes", label: "Yes" }, { value: "no", label: "No" }, { value: "not-sure", label: "Not sure" },
      ])}
    </div>
  );

  const renderApp = () => (
    <div className={styles.stepFields}>
      {renderSingleSelect("appType", "What type of application do you need?", [
        { value: "mobile", label: "Mobile app (iOS / Android)" }, { value: "web", label: "Web app (browser-based)" },
        { value: "desktop", label: "Desktop application" }, { value: "not-sure", label: "Not sure" },
      ], true)}
      {renderTextarea("appDescription", "In one or two sentences, what should the application do?", "Describe the core functionality...", 3, true)}
      {renderSingleSelect("appUserType", "Who will use this application?", [
        { value: "public", label: "Customers / public users" }, { value: "internal", label: "Internal team only" }, { value: "both", label: "Both" },
      ], true)}
      {renderSingleSelect("needsUserAccounts", "Do you need user accounts and login functionality?", [
        { value: "yes", label: "Yes" }, { value: "no", label: "No" }, { value: "not-sure", label: "Not sure" },
      ])}
      {renderSingleSelect("needsExternalIntegrations", "Does the app need to connect to existing tools or systems?", [
        { value: "yes", label: "Yes" }, { value: "no", label: "No" },
      ])}
      {str("needsExternalIntegrations") === "yes" && (
        <div className={styles.conditionalFields}>{renderTextarea("integrationDetails", "Please describe the integrations needed", "e.g. CRM, payment gateway, accounting software...")}</div>
      )}
      {renderSingleSelect("hasWireframes", "Do you have wireframes, sketches, or references?", [
        { value: "yes", label: "Yes" }, { value: "no", label: "No" },
      ])}
      {str("hasWireframes") === "yes" && (
        <div className={styles.conditionalFields}>{renderTextarea("wireframeDetails", "Please describe or share links", "Links or description of your wireframes...")}</div>
      )}
      {renderFileUpload("Upload wireframes or reference files")}
    </div>
  );

  const renderBranding = () => (
    <div className={styles.stepFields}>
      {renderMultiSelect("brandingDeliverables", "What branding deliverables do you need?", [
        { value: "Logo", label: "Logo design" }, { value: "Colours", label: "Colour palette" },
        { value: "Typography", label: "Typography / font selection" }, { value: "Style Guide", label: "Brand style guide" },
        { value: "Business Cards", label: "Business cards" }, { value: "Social Templates", label: "Social media templates" },
        { value: "Presentation", label: "Presentation templates" }, { value: "Other", label: "Other" },
      ], true)}
      {arr("brandingDeliverables").includes("Other") && (
        <div className={styles.conditionalFields}>{renderTextField("brandingDeliverablesOther", "What other deliverables?", "e.g. Signage, vehicle wraps")}</div>
      )}
      {renderMultiSelect("brandPersonality", "How would you describe your desired brand personality?", [
        { value: "Professional", label: "Professional & corporate" }, { value: "Minimal", label: "Clean & minimal" },
        { value: "Bold", label: "Bold & energetic" }, { value: "Friendly", label: "Friendly & approachable" },
        { value: "Luxurious", label: "Luxurious & premium" }, { value: "Creative", label: "Creative & expressive" },
        { value: "Other", label: "Other" },
      ], true)}
      {arr("brandPersonality").includes("Other") && (
        <div className={styles.conditionalFields}>{renderTextField("brandPersonalityOther", "Describe your desired personality", "e.g. Rustic, playful")}</div>
      )}
      {renderSingleSelect("hasBrandExamples", "Are there brands or logos you admire?", [
        { value: "yes", label: "Yes" }, { value: "no", label: "No" },
      ])}
      {str("hasBrandExamples") === "yes" && (
        <div className={styles.conditionalFields}>{renderTextarea("brandExamples", "Please share examples", "Brand names, URLs, or descriptions...")}</div>
      )}
      {renderTextarea("avoidStyles", "Are there any colours or styles you want to avoid?", "e.g. No neon colours, no cursive fonts...")}
      {renderFileUpload("Upload existing brand assets or references")}
    </div>
  );

  const renderSocialMedia = () => (
    <div className={styles.stepFields}>
      {renderMultiSelect("managedPlatforms", "Which platforms do you want managed?", [
        { value: "Instagram", label: "Instagram" }, { value: "Facebook", label: "Facebook" },
        { value: "TikTok", label: "TikTok" }, { value: "LinkedIn", label: "LinkedIn" },
        { value: "X", label: "X (Twitter)" }, { value: "YouTube", label: "YouTube" },
        { value: "Other", label: "Other" },
      ], true)}
      {arr("managedPlatforms").includes("Other") && (
        <div className={styles.conditionalFields}>{renderTextField("managedPlatformsOther", "Which other platforms?", "e.g. Pinterest, Threads")}</div>
      )}
      {renderSingleSelect("currentPostingFrequency", "Do you currently post on social media?", [
        { value: "regularly", label: "Yes, regularly" }, { value: "occasionally", label: "Yes, occasionally" }, { value: "no", label: "No" },
      ])}
      {renderSingleSelect("socialMediaGoal", "What is the main goal of your social media?", [
        { value: "awareness", label: "Grow followers & awareness" }, { value: "traffic", label: "Drive traffic to website" },
        { value: "leads", label: "Generate leads & enquiries" }, { value: "promote", label: "Promote products / services" },
        { value: "all", label: "All of the above" },
      ], true)}
      {renderSingleSelect("desiredPostFrequency", "How often do you want content posted per week?", [
        { value: "1-2", label: "1\u20132 times" }, { value: "3-4", label: "3\u20134 times" },
        { value: "daily", label: "Daily" }, { value: "not-sure", label: "Open to recommendation" },
      ])}
      {renderSingleSelect("contentCreation", "Will you provide content or do you need us to create it?", [
        { value: "provide", label: "I will provide content" }, { value: "create", label: "I need you to create it" }, { value: "mix", label: "A mix of both" },
      ], true)}
      {renderSingleSelect("paidAds", "Do you run or want to run paid social media ads?", [
        { value: "currently", label: "Yes, currently running" }, { value: "interested", label: "Yes, interested in starting" }, { value: "no", label: "No" },
      ])}
    </div>
  );

  const renderBudgetTimeline = () => (
    <div className={styles.stepFields}>
      {renderSingleSelect("budget", "What is your approximate budget for this project?", [
        { value: "under-5k", label: "Under R5,000" }, { value: "5k-15k", label: "R5,000 \u2013 R15,000" },
        { value: "15k-30k", label: "R15,000 \u2013 R30,000" }, { value: "30k-50k", label: "R30,000 \u2013 R50,000" },
        { value: "50k+", label: "R50,000+" }, { value: "not-sure", label: "I\u2019m not sure yet" },
      ], true)}
      {renderSingleSelect("timeline", "When would you ideally like this completed?", [
        { value: "asap", label: "As soon as possible" }, { value: "1-month", label: "Within 1 month" },
        { value: "1-3-months", label: "1\u20133 months" }, { value: "3-6-months", label: "3\u20136 months" },
        { value: "no-deadline", label: "No fixed deadline" },
      ], true)}
      {renderSingleSelect("deadlineFlexible", "Is this deadline flexible?", [
        { value: "yes", label: "Yes" }, { value: "no", label: "No" }, { value: "somewhat", label: "Somewhat" },
      ])}
    </div>
  );

  const renderFinalDetails = () => (
    <div className={styles.stepFields}>
      {renderSingleSelect("decisionMaker", "Who will be the primary decision maker on this project?", [
        { value: "myself", label: "Myself" }, { value: "someone-else", label: "Someone else" }, { value: "team", label: "A team of people" },
      ])}
      {str("decisionMaker") === "someone-else" && (
        <div className={styles.conditionalFields}>{renderTextField("decisionMakerDetails", "Name and role of the decision maker", "e.g. Jane Smith, CEO")}</div>
      )}
      {renderSingleSelect("howHeardAboutUs", "How did you hear about us?", [
        { value: "referral", label: "Referral" }, { value: "social-media", label: "Social media" },
        { value: "google", label: "Google search" }, { value: "other", label: "Other" },
      ])}
      {(str("howHeardAboutUs") === "referral" || str("howHeardAboutUs") === "other") && (
        <div className={styles.conditionalFields}>
          {renderTextField("howHeardDetails",
            str("howHeardAboutUs") === "referral" ? "Who referred you?" : "Please specify",
            str("howHeardAboutUs") === "referral" ? "e.g. John from ABC Company" : "How did you find us?"
          )}
        </div>
      )}
      {renderTextarea("additionalNotes", "Is there anything else you\u2019d like us to know before we get started?", "Any additional details, preferences, or questions...", 4)}
      {renderFileUpload("Upload any reference files (logos, inspiration, documents)")}
    </div>
  );

  /* ── Summary/Review step ── */
  const renderSummaryRow = (label: string, field: string) => {
    const val = formData[field];
    const display = formatFieldValue(field, val);
    return (
      <div key={field} className={styles.summaryRow}>
        <span className={styles.summaryLabel}>{label}</span>
        <span className={display ? styles.summaryValue : `${styles.summaryValue} ${styles.summaryEmpty}`}>
          {display || "\u2014"}
        </span>
      </div>
    );
  };

  const renderSummarySection = (title: string, stepIndex: number, rows: { label: string; field: string }[]) => {
    const hasAnyValue = rows.some(r => {
      const v = formData[r.field];
      return Array.isArray(v) ? v.length > 0 : !!v;
    });
    if (!hasAnyValue && stepIndex > 2) return null;
    return (
      <div className={styles.summarySection}>
        <div className={styles.summarySectionHeader}>
          <h3>{title}</h3>
          <button type="button" className={styles.editStepBtn} onClick={() => goToStep(stepIndex)}>Edit</button>
        </div>
        {rows.map(r => renderSummaryRow(r.label, r.field))}
      </div>
    );
  };

  const renderReview = () => {
    const services = arr("servicesNeeded");
    // Build step index lookup
    const stepIndexMap: Record<string, number> = {};
    activeSteps.forEach((s, i) => { stepIndexMap[s.id] = i; });

    return (
      <div className={styles.stepFields}>
        {renderSummarySection("About You", stepIndexMap["about-you"] ?? 0, [
          { label: "Full name", field: "fullName" }, { label: "Email", field: "email" },
          { label: "Phone", field: "phone" }, { label: "Business name", field: "businessName" },
          { label: "Industry", field: "industry" }, { label: "Location", field: "location" },
          { label: "Operating time", field: "operatingTime" }, { label: "Business size", field: "businessSize" },
          { label: "Business description", field: "businessDescription" }, { label: "Target audience", field: "targetAudience" },
        ])}
        {renderSummarySection("Digital Presence", stepIndexMap["digital-presence"] ?? 1, [
          { label: "Existing branding", field: "existingBranding" }, { label: "Has website", field: "hasWebsite" },
          { label: "Website URL", field: "websiteUrl" }, { label: "Social media active", field: "socialMediaActive" },
          { label: "Social platforms", field: "socialPlatforms" }, { label: "Google Business Profile", field: "googleBusinessProfile" },
        ])}
        {renderSummarySection("Services Needed", stepIndexMap["services"] ?? 2, [
          { label: "Services", field: "servicesNeeded" },
        ])}
        {services.includes("Website") && renderSummarySection("Website", stepIndexMap["website"] ?? 3, [
          { label: "Primary goal", field: "websiteGoal" }, { label: "Pages needed", field: "websitePages" },
          { label: "Content ready", field: "contentReady" }, { label: "Reference sites", field: "referenceWebsiteUrls" },
          { label: "Multi-language", field: "multiLanguage" }, { label: "CMS needed", field: "needsCMS" },
          { label: "Contact form", field: "needsContactForm" }, { label: "Booking", field: "needsBooking" },
        ])}
        {services.includes("E-Commerce Store") && renderSummarySection("E-Commerce", stepIndexMap["ecommerce"] ?? 3, [
          { label: "Selling type", field: "sellingType" }, { label: "Product count", field: "productCount" },
          { label: "Existing platform", field: "hasEcommercePlatform" }, { label: "Integration", field: "storeIntegration" },
          { label: "Inventory", field: "needsInventory" }, { label: "Online payments", field: "needsOnlinePayments" },
          { label: "Order tracking", field: "needsOrderTracking" },
        ])}
        {services.includes("Mobile or Web Application") && renderSummarySection("App Development", stepIndexMap["app"] ?? 3, [
          { label: "App type", field: "appType" }, { label: "Description", field: "appDescription" },
          { label: "User type", field: "appUserType" }, { label: "User accounts", field: "needsUserAccounts" },
          { label: "Integrations", field: "needsExternalIntegrations" },
        ])}
        {services.includes("Branding & Graphic Design") && renderSummarySection("Branding & Design", stepIndexMap["branding"] ?? 3, [
          { label: "Deliverables", field: "brandingDeliverables" }, { label: "Personality", field: "brandPersonality" },
          { label: "Brand examples", field: "hasBrandExamples" }, { label: "Styles to avoid", field: "avoidStyles" },
        ])}
        {services.includes("Social Media Management") && renderSummarySection("Social Media", stepIndexMap["social-media"] ?? 3, [
          { label: "Platforms", field: "managedPlatforms" }, { label: "Current posting", field: "currentPostingFrequency" },
          { label: "Goal", field: "socialMediaGoal" }, { label: "Post frequency", field: "desiredPostFrequency" },
          { label: "Content creation", field: "contentCreation" }, { label: "Paid ads", field: "paidAds" },
        ])}
        {renderSummarySection("Budget & Timeline", stepIndexMap["budget"] ?? (activeSteps.length - 3), [
          { label: "Budget", field: "budget" }, { label: "Timeline", field: "timeline" },
          { label: "Deadline flexible", field: "deadlineFlexible" },
        ])}
        {renderSummarySection("Final Details", stepIndexMap["final"] ?? (activeSteps.length - 2), [
          { label: "Decision maker", field: "decisionMaker" }, { label: "How heard about us", field: "howHeardAboutUs" },
          { label: "Additional notes", field: "additionalNotes" },
        ])}
        {uploadedFiles.length > 0 && (
          <div className={styles.summarySection}>
            <div className={styles.summarySectionHeader}><h3>Uploaded Files</h3></div>
            <div className={styles.uploadedFiles}>
              {uploadedFiles.map((f, i) => (
                <div key={`${f.name}-${i}`} className={styles.uploadedFile}><span>{f.name}</span></div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  /* ── Step router ── */
  const renderStep = () => {
    switch (activeSteps[currentStepIndex]?.id) {
      case "about-you": return renderAboutYou();
      case "digital-presence": return renderDigitalPresence();
      case "services": return renderServicesNeeded();
      case "website": return renderWebsite();
      case "ecommerce": return renderEcommerce();
      case "app": return renderApp();
      case "branding": return renderBranding();
      case "social-media": return renderSocialMedia();
      case "budget": return renderBudgetTimeline();
      case "final": return renderFinalDetails();
      case "review": return renderReview();
      default: return null;
    }
  };

  /* ── Derived values ── */
  const currentStep = activeSteps[currentStepIndex];
  const isReviewStep = currentStep?.id === "review";

  if (!currentStep) return null;

  /* ══════════════════════════════════════
     Render
     ══════════════════════════════════════ */
  return (
    <section className={styles.formSection}>
      {showConfirmModal && (
        <div
          className={styles.modalOverlay}
          onClick={submitError ? handleCloseErrorModal : handleCloseModal}
        >
          <motion.div
            className={styles.modalBox}
            onClick={(e) => e.stopPropagation()}
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
                <div className={styles.errorIcon}>
                  <AlertCircle size={32} />
                </div>
                <h2 className={styles.thankYouTitle}>Something went wrong</h2>
                <p className={styles.thankYouText}>
                  We couldn&apos;t send your brief. Please check your connection and try again. Your answers have been saved.
                </p>
                <button
                  type="button"
                  className={styles.modalDoneBtn}
                  onClick={handleCloseErrorModal}
                >
                  Try Again
                </button>
              </>
            ) : (
              <>
                <div className={styles.thankYouIcon}>
                  <Check size={32} />
                </div>
                <h2 className={styles.thankYouTitle}>Thank You!</h2>
                <p className={styles.thankYouText}>
                  We&apos;ve received your project brief. Our team will review your details and get back to you within 24&ndash;48 hours.
                </p>
                <button
                  type="button"
                  className={styles.modalDoneBtn}
                  onClick={handleCloseModal}
                >
                  Close
                </button>
              </>
            )}
          </motion.div>
        </div>
      )}

      <div className={styles.formCard} ref={formCardRef}>
            {/* Honeypot — hidden from real users; bots fill it and are silently rejected */}
            <input
              type="text"
              name="website"
              aria-hidden="true"
              tabIndex={-1}
              autoComplete="off"
              value={str("_hp")}
              onChange={(e) => updateField("_hp", e.target.value)}
              style={{ position: "absolute", left: "-9999px", width: "1px", height: "1px", overflow: "hidden", opacity: 0, pointerEvents: "none" }}
            />
            {/* Single shared file input — triggered by all renderFileUpload() calls */}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept={ALLOWED_EXTENSIONS.join(",")}
              onChange={handleFileUpload}
              style={{ display: "none" }}
            />
            {/* Pagination dots */}
            <div className={styles.pagination}>
              {activeSteps.map((step, i) => (
                <button
                  key={step.id}
                  type="button"
                  className={`${styles.paginationDot} ${i === currentStepIndex ? styles.paginationDotActive : ""} ${i < currentStepIndex ? styles.paginationDotCompleted : ""}`}
                  onClick={() => i < currentStepIndex ? goToStep(i) : undefined}
                  aria-label={`Step ${i + 1}: ${step.title}`}
                />
              ))}
            </div>

            <div className={styles.formCardInner}>
              <div className={styles.stepHeader}>
                <span className={styles.stepCounter}>
                  Step {currentStepIndex + 1} of {activeSteps.length}
                </span>
                <h2 className={styles.stepTitle}>{currentStep.title}</h2>
                <p className={styles.stepSubtitle}>{currentStep.subtitle}</p>
              </div>

              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={currentStep.id}
                  custom={direction}
                  variants={stepVariants}
                  initial="enter"
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
                    <span className={styles.arrowIcon}>&rarr;</span>
                    Back
                  </button>
                ) : (
                  <div />
                )}
                {isReviewStep ? (
                  <button
                    type="button"
                    className={styles.submitBtn}
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Sending…" : "Submit"}
                    {!isSubmitting && <Check size={15} />}
                  </button>
                ) : (
                  <button type="button" className={styles.nextBtn} onClick={goNext}>
                    Next
                    <span className={styles.arrowIcon}>&rarr;</span>
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

export default GetStartedForm;
