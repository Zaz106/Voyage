import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

/* ══════════════════════════════════════
   Config
   ══════════════════════════════════════ */

const COMPANY_NAME = "Company Name";
const FROM_ADDRESS = `${COMPANY_NAME} <noreply@sixfootdesignco.co.za>`;
const INTERNAL_EMAIL = "joshua.huisman06@gmail.com";
const ACCENT = "#987ed2";
const MAX_ATTACHMENT_SIZE = 10 * 1024 * 1024; // 10 MB per file

/* ══════════════════════════════════════
   Rate limiting (in-memory, per IP)
   ══════════════════════════════════════ */
const RATE_LIMIT = 5;            // max requests per window
const RATE_WINDOW_MS = 15 * 60 * 1000; // 15-minute window
const rateMap = new Map<string, { count: number; resetAt: number }>();

/* ══════════════════════════════════════
   Types
   ══════════════════════════════════════ */

interface BriefPayload {
  // About
  fullName?: string;
  email?: string;
  phone?: string;
  phoneCountryCode?: string;
  businessName?: string;
  industry?: string;
  location?: string;
  operatingTime?: string;
  businessSize?: string;
  businessDescription?: string;
  targetAudience?: string;
  // Digital presence
  existingBranding?: string;
  hasWebsite?: string;
  websiteUrl?: string;
  websiteDislikes?: string;
  socialMediaActive?: string;
  socialPlatforms?: string | string[];
  googleBusinessProfile?: string;
  // Services
  servicesNeeded?: string | string[];
  // Website
  websiteGoal?: string;
  websiteGoalOther?: string;
  websitePages?: string | string[];
  websitePagesOther?: string;
  contentReady?: string;
  hasReferenceWebsites?: string;
  referenceWebsiteUrls?: string;
  multiLanguage?: string;
  needsCMS?: string;
  needsContactForm?: string;
  needsBooking?: string;
  existingBookingTool?: string;
  // Ecommerce
  sellingType?: string;
  productCount?: string;
  hasEcommercePlatform?: string;
  currentEcommercePlatform?: string;
  storeIntegration?: string;
  needsInventory?: string;
  needsOnlinePayments?: string;
  needsOrderTracking?: string;
  // App
  appType?: string;
  appDescription?: string;
  appUserType?: string;
  needsUserAccounts?: string;
  needsExternalIntegrations?: string;
  integrationDetails?: string;
  hasWireframes?: string;
  wireframeDetails?: string;
  // Branding
  brandingDeliverables?: string | string[];
  brandingDeliverablesOther?: string;
  brandPersonality?: string | string[];
  brandPersonalityOther?: string;
  hasBrandExamples?: string;
  brandExamples?: string;
  avoidStyles?: string;
  // Social media
  managedPlatforms?: string | string[];
  managedPlatformsOther?: string;
  currentPostingFrequency?: string;
  socialMediaGoal?: string;
  desiredPostFrequency?: string;
  contentCreation?: string;
  paidAds?: string;
  // Budget
  budget?: string;
  timeline?: string;
  deadlineFlexible?: string;
  // Final
  decisionMaker?: string;
  decisionMakerDetails?: string;
  howHeardAboutUs?: string;
  howHeardDetails?: string;
  additionalNotes?: string;
  // Anti-bot honeypot
  _hp?: string;
}

/* ══════════════════════════════════════
   Helpers
   ══════════════════════════════════════ */

/** Escape HTML special chars in user input */
function esc(s: string | undefined | null): string {
  if (!s) return "";
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Field display label mappings (mirror of front-end FIELD_DISPLAY_LABELS) */
const LABELS: Record<string, Record<string, string>> = {
  operatingTime: {
    "pre-launch": "Pre-launch / Not yet open",
    "less-than-1": "Less than 1 year",
    "1-3": "1–3 years",
    "3+": "3+ years",
  },
  businessSize: {
    solo: "Solo / Freelancer",
    small: "Small (2–10 people)",
    medium: "Medium (11–50 people)",
    large: "Large (50+ people)",
  },
  existingBranding: {
    "fully-developed": "Yes, fully developed",
    partial: "Partially (logo or colours only)",
    none: "No, starting from scratch",
  },
  hasWebsite: { yes: "Yes", no: "No" },
  socialMediaActive: { yes: "Yes", no: "No" },
  googleBusinessProfile: { yes: "Yes", no: "No", "not-sure": "Not sure" },
  websiteGoal: {
    leads: "Generate leads / enquiries",
    portfolio: "Showcase work or portfolio",
    information: "Provide information",
    sell: "Sell products or services",
    bookings: "Book appointments or classes",
    other: "Other",
  },
  contentReady: {
    yes: "Yes, everything is ready",
    partial: "Partially ready",
    no: "No, I'll need help",
  },
  hasReferenceWebsites: { yes: "Yes", no: "No" },
  multiLanguage: { yes: "Yes", no: "No" },
  needsCMS: {
    yes: "Yes — I'd like a CMS",
    no: "No — I'll rely on your team",
  },
  needsContactForm: { yes: "Yes", no: "No" },
  needsBooking: { yes: "Yes", no: "No" },
  sellingType: {
    physical: "Physical products",
    digital: "Digital products",
    both: "Both physical and digital",
  },
  productCount: {
    "1-10": "1–10 products",
    "11-50": "11–50 products",
    "51-200": "51–200 products",
    "200+": "200+ products",
  },
  hasEcommercePlatform: { yes: "Yes", no: "No" },
  storeIntegration: {
    integrated: "Integrated into my website",
    standalone: "Standalone store",
    "not-sure": "Not sure",
  },
  needsInventory: { yes: "Yes", no: "No", "not-sure": "Not sure" },
  needsOnlinePayments: { yes: "Yes", no: "No", "not-sure": "Not sure" },
  needsOrderTracking: { yes: "Yes", no: "No", "not-sure": "Not sure" },
  appType: {
    mobile: "Mobile app (iOS / Android)",
    web: "Web app (browser-based)",
    desktop: "Desktop application",
    "not-sure": "Not sure",
  },
  appUserType: {
    public: "Customers / public users",
    internal: "Internal team only",
    both: "Both internal and external",
  },
  needsUserAccounts: { yes: "Yes", no: "No", "not-sure": "Not sure" },
  needsExternalIntegrations: { yes: "Yes", no: "No" },
  hasWireframes: { yes: "Yes", no: "No" },
  hasBrandExamples: { yes: "Yes", no: "No" },
  currentPostingFrequency: {
    regularly: "Yes, regularly",
    occasionally: "Yes, occasionally",
    no: "Not currently posting",
  },
  socialMediaGoal: {
    awareness: "Grow followers & brand awareness",
    traffic: "Drive traffic to website",
    leads: "Generate leads & enquiries",
    promote: "Promote products / services",
    all: "All of the above",
  },
  desiredPostFrequency: {
    "1-2": "1–2 times per week",
    "3-4": "3–4 times per week",
    daily: "Daily",
    "not-sure": "Open to recommendation",
  },
  contentCreation: {
    provide: "I will provide content",
    create: "I need you to create it",
    mix: "A mix of both",
  },
  paidAds: {
    currently: "Yes, currently running ads",
    interested: "Yes, interested in starting",
    no: "No",
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
    asap: "As soon as possible",
    "1-month": "Within 1 month",
    "1-3-months": "1–3 months",
    "3-6-months": "3–6 months",
    "no-deadline": "No fixed deadline",
  },
  deadlineFlexible: { yes: "Yes", no: "No", somewhat: "Somewhat" },
  decisionMaker: {
    myself: "Myself",
    "someone-else": "Someone else",
    team: "A team of people",
  },
  howHeardAboutUs: {
    referral: "Referral",
    "social-media": "Social media",
    google: "Google search",
    other: "Other",
  },
};

function fmt(field: string, val: string | string[] | undefined): string {
  if (!val) return "";
  if (Array.isArray(val)) {
    return val
      .filter(Boolean)
      .map((v) => LABELS[field]?.[v] ?? v)
      .join(", ");
  }
  return LABELS[field]?.[val] ?? val;
}

function toArray(val: string | string[] | undefined): string[] {
  if (!val) return [];
  return Array.isArray(val) ? val.filter(Boolean) : [val].filter(Boolean);
}

/** Strip header-injectable characters for use in email subject lines */
function sanitizeHeader(s: string | undefined | null): string {
  if (!s) return "";
  return String(s).replace(/[\r\n\t]/g, " ").trim().slice(0, 200);
}

/** Clamp a value to a maximum string length */
function sanitizeStr(val: unknown, maxLen: number): string {
  if (val == null) return "";
  return String(val).slice(0, maxLen);
}

/** Maximum allowed lengths for each free-text field */
const FIELD_MAX_LENGTHS: Record<string, number> = {
  fullName: 150, email: 254, phone: 30, phoneCountryCode: 8,
  businessName: 150, industry: 100, location: 150,
  businessDescription: 2000, targetAudience: 1000,
  websiteUrl: 500, websiteDislikes: 1000,
  websiteGoalOther: 500, websitePagesOther: 300,
  referenceWebsiteUrls: 1000, existingBookingTool: 200,
  currentEcommercePlatform: 200, appDescription: 2000,
  integrationDetails: 1000, wireframeDetails: 500,
  brandingDeliverablesOther: 300, brandPersonalityOther: 300,
  brandExamples: 1000, avoidStyles: 1000, managedPlatformsOther: 200,
  decisionMakerDetails: 200, howHeardDetails: 500, additionalNotes: 2000,
};

/** Validate a string value against the known enum set for a field */
function sanitizeEnum(field: string, val: unknown): string {
  if (!val || typeof val !== "string") return "";
  const known = LABELS[field];
  if (!known) return "";
  return Object.prototype.hasOwnProperty.call(known, val) ? val : "";
}

/** Allowed values for multi-select (array) fields */
const ARRAY_FIELD_ALLOWLISTS: Record<string, Set<string>> = {
  servicesNeeded:       new Set(["Website", "E-Commerce Store", "Mobile or Web Application", "Branding & Graphic Design", "Social Media Management", "Not sure"]),
  socialPlatforms:      new Set(["Instagram", "Facebook", "TikTok", "LinkedIn", "X", "YouTube", "Other"]),
  websitePages:         new Set(["Home", "About", "Services", "Portfolio", "Blog", "Contact", "FAQ", "Booking", "Legal", "Other"]),
  brandingDeliverables: new Set(["Logo", "Colours", "Typography", "Style Guide", "Business Cards", "Social Templates", "Presentation", "Other"]),
  brandPersonality:     new Set(["Professional", "Minimal", "Bold", "Friendly", "Luxurious", "Creative", "Other"]),
  managedPlatforms:     new Set(["Instagram", "Facebook", "TikTok", "LinkedIn", "X", "YouTube", "Other"]),
};

/** Validate a URL for use as an href — only allow http/https protocols */
function safeUrl(val: string | undefined | null): string {
  if (!val) return "";
  const v = String(val).trim();
  if (/^https?:\/\//i.test(v)) return v;
  if (/^www\./i.test(v)) return `https://${v}`;
  return "";
}

/* ══════════════════════════════════════
   Email base styles (shared)
   ══════════════════════════════════════ */

const EMAIL_FONTS = `
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="">
  <link href="https://fonts.googleapis.com/css2?family=Instrument+Sans:ital,wght@0,400;0,500;0,600&display=swap" rel="stylesheet">
  <link href="https://api.fontshare.com/v2/css?f[]=satoshi@400,500,700&display=swap" rel="stylesheet">
`;

const BASE_CSS = `
  :root { color-scheme: light only; }
  html { color-scheme: light only; }
  body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
  table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
  img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
  body { margin: 0; padding: 0; width: 100% !important; }
  a[x-apple-data-detectors] { color: inherit !important; text-decoration: none !important; font-size: inherit !important; font-family: inherit !important; font-weight: inherit !important; line-height: inherit !important; }
  @media only screen and (max-width: 620px) {
    .ec { width: 100% !important; max-width: 100% !important; }
    .ep { padding-left: 24px !important; padding-right: 24px !important; }
    .ms { display: block !important; width: 100% !important; padding-left: 0 !important; padding-right: 0 !important; }
  }
  @media (prefers-color-scheme: dark) {
    body { background-color: #f5f5f5 !important; color: #1a1a1a !important; }
  }
  [data-ogsc] body { background-color: #f5f5f5 !important; color: #1a1a1a !important; }
`;

const BODY_FONT = `font-family: 'Instrument Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;`;
const HEAD_FONT = `font-family: 'Satoshi', Georgia, 'Times New Roman', serif;`;

/* ══════════════════════════════════════
   Internal email helpers
   ══════════════════════════════════════ */

function sectionHead(title: string): string {
  return `<tr><td class="ep" style="padding: 28px 40px 0;"><p style="margin: 0 0 16px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: ${ACCENT}; border-bottom: 2px solid ${ACCENT}; padding-bottom: 8px; ${BODY_FONT}">${title}</p><table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">`;
}

function sectionClose(): string {
  return `</table></td></tr>`;
}

function fieldRow(label: string, value: string | undefined): string {
  if (!value) return "";
  return `<tr><td colspan="2" style="padding: 0 0 12px;"><p style="margin: 0 0 3px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.04em; color: #999999; ${BODY_FONT}">${label}</p><p style="margin: 0; font-size: 14px; color: #1a1a1a; line-height: 1.55; ${BODY_FONT}">${esc(value)}</p></td></tr>`;
}

function fieldPair(
  label1: string,
  value1: string | undefined,
  label2: string,
  value2: string | undefined
): string {
  if (!value1 && !value2) return "";
  const cell1 = value1
    ? `<td width="50%" valign="top" class="ms" style="padding: 0 8px 12px 0;"><p style="margin: 0 0 3px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.04em; color: #999999; ${BODY_FONT}">${label1}</p><p style="margin: 0; font-size: 14px; color: #1a1a1a; ${BODY_FONT}">${esc(value1)}</p></td>`
    : `<td width="50%" valign="top" class="ms" style="padding: 0 8px 12px 0;"></td>`;
  const cell2 = value2
    ? `<td width="50%" valign="top" class="ms" style="padding: 0 0 12px 8px;"><p style="margin: 0 0 3px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.04em; color: #999999; ${BODY_FONT}">${label2}</p><p style="margin: 0; font-size: 14px; color: #1a1a1a; ${BODY_FONT}">${esc(value2)}</p></td>`
    : `<td width="50%" valign="top" class="ms" style="padding: 0 0 12px 8px;"></td>`;
  return `<tr>${cell1}${cell2}</tr>`;
}

function linkRow(label: string, value: string | undefined): string {
  const href = safeUrl(value);
  if (!href) return "";
  return `<tr><td colspan="2" style="padding: 0 0 12px;"><p style="margin: 0 0 3px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.04em; color: #999999; ${BODY_FONT}">${label}</p><p style="margin: 0; font-size: 14px; ${BODY_FONT}"><a href="${esc(href)}" style="color: ${ACCENT}; text-decoration: none;">${esc(href)}</a></p></td></tr>`;
}

/* ══════════════════════════════════════
   Client confirmation email
   ══════════════════════════════════════ */

function buildClientEmail(data: BriefPayload): string {
  const services = toArray(data.servicesNeeded);
  const year = new Date().getFullYear();
  const name = data.fullName || "there";
  const bizName = data.businessName || "your business";
  const hasBudget = !!data.budget;

  const servicesListRows = services
    .map(
      (s) =>
        `<tr><td style="padding: 6px 0; font-size: 14px; line-height: 1.5; color: #1a1a1a; border-bottom: 1px solid #f0f0f0; ${BODY_FONT}"><span style="color: ${ACCENT}; margin-right: 8px;">&#9679;</span> ${esc(s)}</td></tr>`
    )
    .join("");

  const budgetRow = hasBudget
    ? `<tr><td width="50%" class="ms" style="padding: 18px 0 0 0; padding-right: 12px;"><p style="margin: 0 0 4px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #999999; ${BODY_FONT}">Budget</p><p style="margin: 0; font-size: 14px; font-weight: 600; color: #1a1a1a; ${BODY_FONT}">${esc(fmt("budget", data.budget))}</p></td><td width="50%" class="ms" style="padding: 18px 0 0 12px;"><p style="margin: 0 0 4px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #999999; ${BODY_FONT}">Timeline</p><p style="margin: 0; font-size: 14px; font-weight: 600; color: #1a1a1a; ${BODY_FONT}">${esc(fmt("timeline", data.timeline))}</p></td></tr>`
    : "";

  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="x-apple-disable-message-reformatting">
  <meta name="format-detection" content="telephone=no,address=no,email=no,date=no,url=no">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <title>We've Received Your Project Brief</title>
  <!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:AllowPNG/><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->
  <!--[if !mso]><!-->
  ${EMAIL_FONTS}
  <!--<![endif]-->
  <style>${BASE_CSS}</style>
</head>
<body style="margin: 0; padding: 0; background-color: #f5f5f5; ${BODY_FONT}">

  <div style="display: none; max-height: 0; overflow: hidden; mso-hide: all;">
    We've received your project brief and our team will be in touch within 24–48 hours.
    &zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;
  </div>

  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f5f5f5;">
    <tr>
      <td align="center" style="padding: 40px 16px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="560" class="ec" style="max-width: 560px; width: 100%;">

          <!-- Header -->
          <tr>
            <td style="background-color: #1a1a1a; border-radius: 16px 16px 0 0;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td class="ep" align="center" style="padding: 36px 48px 32px;">
                    <span style="${HEAD_FONT} font-size: 20px; font-weight: 700; letter-spacing: 0.04em; color: #ffffff;">${COMPANY_NAME}</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background-color: #ffffff;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">

                <!-- Check icon -->
                <tr>
                  <td align="center" class="ep" style="padding: 48px 48px 0;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td align="center" valign="middle" style="width: 56px; height: 56px; background-color: #000000; border-radius: 50%; color: #ffffff; font-size: 24px; line-height: 56px; text-align: center;">&#10003;</td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Heading -->
                <tr>
                  <td align="center" class="ep" style="padding: 24px 48px 0;">
                    <h1 style="margin: 0; ${HEAD_FONT} font-size: 26px; font-weight: 700; color: #1a1a1a; letter-spacing: -0.02em;">We've received your brief!</h1>
                  </td>
                </tr>

                <!-- Greeting -->
                <tr>
                  <td class="ep" style="padding: 20px 48px 0;">
                    <p style="margin: 0; font-size: 15px; line-height: 1.65; color: #555555; ${BODY_FONT}">Hi ${esc(name)},</p>
                  </td>
                </tr>

                <!-- Body copy -->
                <tr>
                  <td class="ep" style="padding: 12px 48px 0;">
                    <p style="margin: 0; font-size: 15px; line-height: 1.65; color: #555555; ${BODY_FONT}">
                      Thank you for taking the time to complete our project questionnaire. We're excited to learn more about <strong style="color: #1a1a1a;">${esc(bizName)}</strong> and how we can help bring your vision to life.
                    </p>
                  </td>
                </tr>

                <!-- What happens next -->
                <tr>
                  <td class="ep" style="padding: 28px 48px 0;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #faf9fc; border-radius: 12px; border-left: 3px solid ${ACCENT};">
                      <tr>
                        <td style="padding: 24px 28px;">
                          <p style="margin: 0 0 14px; ${HEAD_FONT} font-size: 15px; font-weight: 700; color: #1a1a1a;">What happens next?</p>
                          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                            <tr>
                              <td valign="top" style="width: 22px; padding: 0 0 10px; font-size: 13px; color: ${ACCENT}; font-weight: 600; ${BODY_FONT}">1.</td>
                              <td style="padding: 0 0 10px; font-size: 14px; line-height: 1.55; color: #555555; ${BODY_FONT}">Our team reviews your project brief in detail.</td>
                            </tr>
                            <tr>
                              <td valign="top" style="width: 22px; padding: 0 0 10px; font-size: 13px; color: ${ACCENT}; font-weight: 600; ${BODY_FONT}">2.</td>
                              <td style="padding: 0 0 10px; font-size: 14px; line-height: 1.55; color: #555555; ${BODY_FONT}">We'll reach out within <strong style="color: #1a1a1a;">24–48 hours</strong> to schedule a discovery call.</td>
                            </tr>
                            <tr>
                              <td valign="top" style="width: 22px; font-size: 13px; color: ${ACCENT}; font-weight: 600; ${BODY_FONT}">3.</td>
                              <td style="font-size: 14px; line-height: 1.55; color: #555555; ${BODY_FONT}">We'll discuss your goals and put together a tailored proposal.</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                ${
                  services.length > 0
                    ? `<!-- Services -->
                <tr>
                  <td class="ep" style="padding: 28px 48px 0;">
                    <p style="margin: 0 0 12px; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; color: ${ACCENT}; ${BODY_FONT}">Services requested</p>
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                      ${servicesListRows}
                    </table>
                  </td>
                </tr>`
                    : ""
                }

                ${
                  hasBudget
                    ? `<!-- Budget & Timeline -->
                <tr>
                  <td class="ep" style="padding: 24px 48px 0;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-top: 1px solid #f0f0f0;">
                      ${budgetRow}
                    </table>
                  </td>
                </tr>`
                    : ""
                }

                <!-- Closing -->
                <tr>
                  <td class="ep" style="padding: 28px 48px 0;">
                    <p style="margin: 0; font-size: 15px; line-height: 1.65; color: #555555; ${BODY_FONT}">In the meantime, if you have any questions or need to update your brief, feel free to reply directly to this email.</p>
                  </td>
                </tr>

                <!-- Sign-off -->
                <tr>
                  <td class="ep" style="padding: 24px 48px 48px;">
                    <p style="margin: 0; font-size: 15px; line-height: 1.65; color: #555555; ${BODY_FONT}">
                      Warm regards,<br>
                      <strong style="color: #1a1a1a;">The ${COMPANY_NAME} Team</strong>
                    </p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #fafafa; border-radius: 0 0 16px 16px; border-top: 1px solid #eeeeee;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td align="center" class="ep" style="padding: 28px 48px;">
                    <p style="margin: 0 0 6px; font-size: 12px; color: #aaaaaa; line-height: 1.5; ${BODY_FONT}">&copy; ${year} ${COMPANY_NAME}. All rights reserved.</p>
                    <p style="margin: 0; font-size: 12px; color: #aaaaaa; line-height: 1.5; ${BODY_FONT}">This email was sent because you submitted a project brief on our website.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>`;
}

/* ══════════════════════════════════════
   Internal notification email
   ══════════════════════════════════════ */

function buildInternalEmail(data: BriefPayload): string {
  const services = toArray(data.servicesNeeded);
  const year = new Date().getFullYear();
  const submittedAt = new Date().toLocaleString("en-ZA", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "Africa/Johannesburg",
  });

  const hasWebsite = services.includes("Website");
  const hasEcommerce = services.includes("E-Commerce Store");
  const hasApp = services.includes("Mobile or Web Application");
  const hasBranding = services.includes("Branding & Graphic Design");
  const hasSocialMedia = services.includes("Social Media Management");

  const phone =
    data.phone
      ? `${data.phoneCountryCode ? data.phoneCountryCode + " " : ""}${data.phone}`
      : "";

  const servicePills = services
    .map(
      (s) =>
        `<tr><td style="padding: 5px 0;"><span style="display: inline-block; background-color: #f5f2fa; color: ${ACCENT}; border-radius: 6px; padding: 6px 14px; font-size: 13px; font-weight: 500; ${BODY_FONT}">${esc(s)}</span></td></tr>`
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="x-apple-disable-message-reformatting">
  <meta name="format-detection" content="telephone=no,address=no,email=no,date=no,url=no">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <title>New Project Brief — ${esc(data.businessName)}</title>
  <!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:AllowPNG/><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->
  <!--[if !mso]><!-->
  ${EMAIL_FONTS}
  <!--<![endif]-->
  <style>${BASE_CSS}</style>
</head>
<body style="margin: 0; padding: 0; background-color: #f5f5f5; ${BODY_FONT}">

  <div style="display: none; max-height: 0; overflow: hidden; mso-hide: all;">
    New brief from ${esc(data.fullName)} (${esc(data.businessName)}) — ${esc(services.join(", "))}
    &zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;
  </div>

  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f5f5f5;">
    <tr>
      <td align="center" style="padding: 32px 16px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="620" class="ec" style="max-width: 620px; width: 100%;">

          <!-- Header -->
          <tr>
            <td style="background-color: #1a1a1a; border-radius: 16px 16px 0 0;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td class="ep" style="padding: 26px 40px;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                      <tr>
                        <td style="${HEAD_FONT} font-size: 18px; font-weight: 700; letter-spacing: 0.04em; color: #ffffff;">${COMPANY_NAME}</td>
                        <td align="right" style="font-size: 12px; color: rgba(255,255,255,0.45); font-weight: 500; text-transform: uppercase; letter-spacing: 0.05em; ${BODY_FONT}">New Project Brief</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Alert banner -->
          <tr>
            <td style="background-color: ${ACCENT};">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td class="ep" style="padding: 16px 40px;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                      <tr>
                        <td style="font-size: 15px; font-weight: 600; color: #ffffff; ${BODY_FONT}">${esc(data.fullName)} — ${esc(data.businessName)}</td>
                        <td align="right" style="font-size: 13px; color: rgba(255,255,255,0.8); ${BODY_FONT}">${submittedAt}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background-color: #ffffff;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">

                <!-- Contact Details -->
                ${sectionHead("Contact Details")}
                  ${fieldPair("Full Name", data.fullName, "Email", data.email)}
                  ${phone ? fieldRow("Phone", phone) : ""}
                ${sectionClose()}

                <!-- Business Info -->
                ${sectionHead("Business Information")}
                  ${fieldPair("Business Name", data.businessName, "Industry", data.industry)}
                  ${fieldPair("Location", data.location, "Operating Time", fmt("operatingTime", data.operatingTime))}
                  ${fieldRow("Business Size", fmt("businessSize", data.businessSize))}
                  ${fieldRow("Business Description", data.businessDescription)}
                  ${fieldRow("Target Audience", data.targetAudience)}
                ${sectionClose()}

                <!-- Digital Presence -->
                ${sectionHead("Digital Presence")}
                  ${fieldPair("Existing Branding", fmt("existingBranding", data.existingBranding), "Has Website", fmt("hasWebsite", data.hasWebsite))}
                  ${data.websiteUrl ? linkRow("Current Website", data.websiteUrl) : ""}
                  ${fieldRow("Dislikes About Current Site", data.websiteDislikes)}
                  ${fieldPair("Active on Social Media", fmt("socialMediaActive", data.socialMediaActive), "Platforms", fmt("socialPlatforms", data.socialPlatforms))}
                  ${fieldRow("Google Business Profile", fmt("googleBusinessProfile", data.googleBusinessProfile))}
                ${sectionClose()}

                <!-- Services -->
                ${sectionHead("Services Requested")}
                  <tr><td colspan="2" style="padding: 0 0 4px;">${servicePills ? `<table role="presentation" cellpadding="0" cellspacing="0" border="0">${servicePills}</table>` : ""}</td></tr>
                ${sectionClose()}

                ${
                  hasWebsite
                    ? `${sectionHead("Website Details")}
                  ${fieldPair("Primary Goal", fmt("websiteGoal", data.websiteGoal), "Content Ready", fmt("contentReady", data.contentReady))}
                  ${data.websiteGoalOther ? fieldRow("Goal (Other)", data.websiteGoalOther) : ""}
                  ${fieldRow("Pages Needed", fmt("websitePages", data.websitePages))}
                  ${data.websitePagesOther ? fieldRow("Other Pages", data.websitePagesOther) : ""}
                  ${fieldPair("Needs CMS", fmt("needsCMS", data.needsCMS), "Multi-Language", fmt("multiLanguage", data.multiLanguage))}
                  ${fieldPair("Contact Form", fmt("needsContactForm", data.needsContactForm), "Booking Feature", fmt("needsBooking", data.needsBooking))}
                  ${data.existingBookingTool ? fieldRow("Existing Booking Tool", data.existingBookingTool) : ""}
                  ${data.referenceWebsiteUrls ? fieldRow("Reference Websites", data.referenceWebsiteUrls) : ""}
                ${sectionClose()}`
                    : ""
                }

                ${
                  hasEcommerce
                    ? `${sectionHead("E-Commerce Details")}
                  ${fieldPair("Selling Type", fmt("sellingType", data.sellingType), "Product Count", fmt("productCount", data.productCount))}
                  ${fieldPair("Existing Platform", fmt("hasEcommercePlatform", data.hasEcommercePlatform), "Platform Name", data.currentEcommercePlatform)}
                  ${fieldPair("Online Payments", fmt("needsOnlinePayments", data.needsOnlinePayments), "Store Integration", fmt("storeIntegration", data.storeIntegration))}
                  ${fieldPair("Inventory Management", fmt("needsInventory", data.needsInventory), "Order Tracking", fmt("needsOrderTracking", data.needsOrderTracking))}
                ${sectionClose()}`
                    : ""
                }

                ${
                  hasApp
                    ? `${sectionHead("App Development Details")}
                  ${fieldPair("App Type", fmt("appType", data.appType), "User Type", fmt("appUserType", data.appUserType))}
                  ${fieldRow("App Description", data.appDescription)}
                  ${fieldPair("User Accounts", fmt("needsUserAccounts", data.needsUserAccounts), "External Integrations", fmt("needsExternalIntegrations", data.needsExternalIntegrations))}
                  ${data.integrationDetails ? fieldRow("Integration Details", data.integrationDetails) : ""}
                  ${fieldPair("Has Wireframes", fmt("hasWireframes", data.hasWireframes), "", "")}
                  ${data.wireframeDetails ? fieldRow("Wireframe Details", data.wireframeDetails) : ""}
                ${sectionClose()}`
                    : ""
                }

                ${
                  hasBranding
                    ? `${sectionHead("Branding & Design Details")}
                  ${fieldRow("Deliverables Needed", fmt("brandingDeliverables", data.brandingDeliverables))}
                  ${data.brandingDeliverablesOther ? fieldRow("Other Deliverables", data.brandingDeliverablesOther) : ""}
                  ${fieldRow("Brand Personality", fmt("brandPersonality", data.brandPersonality))}
                  ${data.brandPersonalityOther ? fieldRow("Personality (Other)", data.brandPersonalityOther) : ""}
                  ${data.brandExamples ? fieldRow("Brand Examples", data.brandExamples) : ""}
                  ${data.avoidStyles ? fieldRow("Styles to Avoid", data.avoidStyles) : ""}
                ${sectionClose()}`
                    : ""
                }

                ${
                  hasSocialMedia
                    ? `${sectionHead("Social Media Management")}
                  ${fieldRow("Platforms to Manage", fmt("managedPlatforms", data.managedPlatforms))}
                  ${data.managedPlatformsOther ? fieldRow("Other Platforms", data.managedPlatformsOther) : ""}
                  ${fieldPair("Main Goal", fmt("socialMediaGoal", data.socialMediaGoal), "Content Creation", fmt("contentCreation", data.contentCreation))}
                  ${fieldPair("Current Posting", fmt("currentPostingFrequency", data.currentPostingFrequency), "Desired Frequency", fmt("desiredPostFrequency", data.desiredPostFrequency))}
                  ${data.paidAds ? fieldRow("Paid Advertising", fmt("paidAds", data.paidAds)) : ""}
                ${sectionClose()}`
                    : ""
                }

                <!-- Budget & Timeline -->
                <tr>
                  <td class="ep" style="padding: 28px 40px 0;">
                    <p style="margin: 0 0 16px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: ${ACCENT}; border-bottom: 2px solid ${ACCENT}; padding-bottom: 8px; ${BODY_FONT}">Budget &amp; Timeline</p>
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f5f2fa; border-radius: 10px;">
                      <tr>
                        <td width="33%" align="center" class="ms" style="padding: 18px 12px;">
                          <p style="margin: 0 0 4px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.04em; color: #7b5fbf; ${BODY_FONT}">Budget</p>
                          <p style="margin: 0; font-size: 15px; font-weight: 600; color: #1a1a1a; ${BODY_FONT}">${esc(fmt("budget", data.budget)) || "Not specified"}</p>
                        </td>
                        <td width="34%" align="center" class="ms" style="padding: 18px 12px; border-left: 1px solid rgba(152,126,210,0.25); border-right: 1px solid rgba(152,126,210,0.25);">
                          <p style="margin: 0 0 4px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.04em; color: #7b5fbf; ${BODY_FONT}">Timeline</p>
                          <p style="margin: 0; font-size: 15px; font-weight: 600; color: #1a1a1a; ${BODY_FONT}">${esc(fmt("timeline", data.timeline)) || "Not specified"}</p>
                        </td>
                        <td width="33%" align="center" class="ms" style="padding: 18px 12px;">
                          <p style="margin: 0 0 4px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.04em; color: #7b5fbf; ${BODY_FONT}">Flexible</p>
                          <p style="margin: 0; font-size: 15px; font-weight: 600; color: #1a1a1a; ${BODY_FONT}">${esc(fmt("deadlineFlexible", data.deadlineFlexible)) || "—"}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Final Details -->
                ${
                  data.decisionMaker || data.howHeardAboutUs || data.additionalNotes
                    ? `${sectionHead("Final Details")}
                  ${fieldPair("Decision Maker", fmt("decisionMaker", data.decisionMaker), "DM Details", data.decisionMakerDetails)}
                  ${fieldPair("How They Found Us", fmt("howHeardAboutUs", data.howHeardAboutUs), "Details", data.howHeardDetails)}
                  ${data.additionalNotes ? fieldRow("Additional Notes", data.additionalNotes) : ""}
                ${sectionClose()}`
                    : ""
                }

                <tr><td style="padding: 28px 0 0;">&nbsp;</td></tr>

              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #fafafa; border-radius: 0 0 16px 16px; border-top: 1px solid #eeeeee;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td align="center" class="ep" style="padding: 22px 40px;">
                    <p style="margin: 0; font-size: 12px; color: #aaaaaa; line-height: 1.5; ${BODY_FONT}">Submitted ${submittedAt} &middot; &copy; ${year} ${COMPANY_NAME}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>`;
}

/* ══════════════════════════════════════
   Route handler
   ══════════════════════════════════════ */

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
// ── (1) Origin / CSRF check ─────────────────────────────────────────
  // Dynamically compare origin hostname to the request host — works on any
  // deployment (local, Vercel preview, custom domain) without env vars.
  const origin = request.headers.get("origin");
  if (origin) {
    const requestHost =
      (request.headers.get("x-forwarded-host") || request.headers.get("host") || "")
        .split(":")[0]; // strip port
    let originHost = "";
    try { originHost = new URL(origin).hostname; } catch { /* malformed origin → block */ }
    if (!originHost || originHost !== requestHost) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  // ── (2) Rate limiting ────────────────────────────────────────────────
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";
  const now = Date.now();
  const entry = rateMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
  } else {
    entry.count += 1;
    if (entry.count > RATE_LIMIT) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }
  }

  // ── (3) Content-Type check ──────────────────────────────────────
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.includes("multipart/form-data") && !contentType.includes("application/json")) {
    return NextResponse.json({ error: "Unsupported Media Type" }, { status: 415 });
  }

  // Body size guard (55 MB for multipart with files, 64 KB for JSON)
  const contentLength = request.headers.get("content-length");
  const maxBodyBytes = contentType.includes("multipart/form-data") ? 55 * 1024 * 1024 : 64 * 1024;
  if (contentLength && parseInt(contentLength, 10) > maxBodyBytes) {
    return NextResponse.json({ error: "Payload too large" }, { status: 413 });
  }

  // Parse body — FormData (with optional file attachments) or JSON
  let raw: BriefPayload;
  const attachments: Array<{ filename: string; content: Buffer }> = [];
  if (contentType.includes("multipart/form-data")) {
    let fd: FormData;
    try { fd = await request.formData(); } catch {
      return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
    }
    const briefStr = fd.get("brief");
    if (!briefStr || typeof briefStr !== "string") {
      return NextResponse.json({ error: "Missing brief" }, { status: 400 });
    }
    try { raw = JSON.parse(briefStr); } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }
    for (const entry of fd.getAll("file")) {
      if (entry instanceof File && entry.size > 0 && entry.size <= MAX_ATTACHMENT_SIZE) {
        attachments.push({ filename: entry.name, content: Buffer.from(await entry.arrayBuffer()) });
      }
    }
  } else {
    try { raw = await request.json(); } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }
  }

  // ── (3) Honeypot check ───────────────────────────────────────────────
  if (raw._hp) {
    // Bot filled the hidden field — silently succeed without sending emails
    return NextResponse.json({ success: true });
  }

  // ── (4) Sanitize: length-limit free-text, whitelist enums ───────────
  const sanitizeArr = (field: string, val: unknown, itemMax: number, arrMax = 15): string[] => {
    const a = Array.isArray(val) ? val : typeof val === "string" ? [val] : [];
    const allowlist = ARRAY_FIELD_ALLOWLISTS[field];
    return a.slice(0, arrMax).map(v => sanitizeStr(v, itemMax)).filter(v => !allowlist || allowlist.has(v));
  };

  const data: BriefPayload = {
    // Free-text fields (capped)
    fullName:                 sanitizeStr(raw.fullName, FIELD_MAX_LENGTHS.fullName),
    email:                    sanitizeStr(raw.email, FIELD_MAX_LENGTHS.email),
    phone:                    sanitizeStr(raw.phone, FIELD_MAX_LENGTHS.phone),
    phoneCountryCode:         sanitizeStr(raw.phoneCountryCode, FIELD_MAX_LENGTHS.phoneCountryCode),
    businessName:             sanitizeStr(raw.businessName, FIELD_MAX_LENGTHS.businessName),
    industry:                 sanitizeStr(raw.industry, FIELD_MAX_LENGTHS.industry),
    location:                 sanitizeStr(raw.location, FIELD_MAX_LENGTHS.location),
    businessDescription:      sanitizeStr(raw.businessDescription, FIELD_MAX_LENGTHS.businessDescription),
    targetAudience:           sanitizeStr(raw.targetAudience, FIELD_MAX_LENGTHS.targetAudience),
    websiteUrl:               sanitizeStr(raw.websiteUrl, FIELD_MAX_LENGTHS.websiteUrl),
    websiteDislikes:          sanitizeStr(raw.websiteDislikes, FIELD_MAX_LENGTHS.websiteDislikes),
    websiteGoalOther:         sanitizeStr(raw.websiteGoalOther, FIELD_MAX_LENGTHS.websiteGoalOther),
    websitePagesOther:        sanitizeStr(raw.websitePagesOther, FIELD_MAX_LENGTHS.websitePagesOther),
    referenceWebsiteUrls:     sanitizeStr(raw.referenceWebsiteUrls, FIELD_MAX_LENGTHS.referenceWebsiteUrls),
    existingBookingTool:      sanitizeStr(raw.existingBookingTool, FIELD_MAX_LENGTHS.existingBookingTool),
    currentEcommercePlatform: sanitizeStr(raw.currentEcommercePlatform, FIELD_MAX_LENGTHS.currentEcommercePlatform),
    appDescription:           sanitizeStr(raw.appDescription, FIELD_MAX_LENGTHS.appDescription),
    integrationDetails:       sanitizeStr(raw.integrationDetails, FIELD_MAX_LENGTHS.integrationDetails),
    wireframeDetails:         sanitizeStr(raw.wireframeDetails, FIELD_MAX_LENGTHS.wireframeDetails),
    brandingDeliverablesOther:sanitizeStr(raw.brandingDeliverablesOther, FIELD_MAX_LENGTHS.brandingDeliverablesOther),
    brandPersonalityOther:    sanitizeStr(raw.brandPersonalityOther, FIELD_MAX_LENGTHS.brandPersonalityOther),
    brandExamples:            sanitizeStr(raw.brandExamples, FIELD_MAX_LENGTHS.brandExamples),
    avoidStyles:              sanitizeStr(raw.avoidStyles, FIELD_MAX_LENGTHS.avoidStyles),
    managedPlatformsOther:    sanitizeStr(raw.managedPlatformsOther, FIELD_MAX_LENGTHS.managedPlatformsOther),
    decisionMakerDetails:     sanitizeStr(raw.decisionMakerDetails, FIELD_MAX_LENGTHS.decisionMakerDetails),
    howHeardDetails:          sanitizeStr(raw.howHeardDetails, FIELD_MAX_LENGTHS.howHeardDetails),
    additionalNotes:          sanitizeStr(raw.additionalNotes, FIELD_MAX_LENGTHS.additionalNotes),
    // Enum fields (whitelisted against known LABELS values)
    operatingTime:            sanitizeEnum("operatingTime", raw.operatingTime),
    businessSize:             sanitizeEnum("businessSize", raw.businessSize),
    existingBranding:         sanitizeEnum("existingBranding", raw.existingBranding),
    hasWebsite:               sanitizeEnum("hasWebsite", raw.hasWebsite),
    socialMediaActive:        sanitizeEnum("socialMediaActive", raw.socialMediaActive),
    googleBusinessProfile:    sanitizeEnum("googleBusinessProfile", raw.googleBusinessProfile),
    websiteGoal:              sanitizeEnum("websiteGoal", raw.websiteGoal),
    contentReady:             sanitizeEnum("contentReady", raw.contentReady),
    hasReferenceWebsites:     sanitizeEnum("hasReferenceWebsites", raw.hasReferenceWebsites),
    multiLanguage:            sanitizeEnum("multiLanguage", raw.multiLanguage),
    needsCMS:                 sanitizeEnum("needsCMS", raw.needsCMS),
    needsContactForm:         sanitizeEnum("needsContactForm", raw.needsContactForm),
    needsBooking:             sanitizeEnum("needsBooking", raw.needsBooking),
    sellingType:              sanitizeEnum("sellingType", raw.sellingType),
    productCount:             sanitizeEnum("productCount", raw.productCount),
    hasEcommercePlatform:     sanitizeEnum("hasEcommercePlatform", raw.hasEcommercePlatform),
    storeIntegration:         sanitizeEnum("storeIntegration", raw.storeIntegration),
    needsInventory:           sanitizeEnum("needsInventory", raw.needsInventory),
    needsOnlinePayments:      sanitizeEnum("needsOnlinePayments", raw.needsOnlinePayments),
    needsOrderTracking:       sanitizeEnum("needsOrderTracking", raw.needsOrderTracking),
    appType:                  sanitizeEnum("appType", raw.appType),
    appUserType:              sanitizeEnum("appUserType", raw.appUserType),
    needsUserAccounts:        sanitizeEnum("needsUserAccounts", raw.needsUserAccounts),
    needsExternalIntegrations:sanitizeEnum("needsExternalIntegrations", raw.needsExternalIntegrations),
    hasWireframes:            sanitizeEnum("hasWireframes", raw.hasWireframes),
    hasBrandExamples:         sanitizeEnum("hasBrandExamples", raw.hasBrandExamples),
    currentPostingFrequency:  sanitizeEnum("currentPostingFrequency", raw.currentPostingFrequency),
    socialMediaGoal:          sanitizeEnum("socialMediaGoal", raw.socialMediaGoal),
    desiredPostFrequency:     sanitizeEnum("desiredPostFrequency", raw.desiredPostFrequency),
    contentCreation:          sanitizeEnum("contentCreation", raw.contentCreation),
    paidAds:                  sanitizeEnum("paidAds", raw.paidAds),
    budget:                   sanitizeEnum("budget", raw.budget),
    timeline:                 sanitizeEnum("timeline", raw.timeline),
    deadlineFlexible:         sanitizeEnum("deadlineFlexible", raw.deadlineFlexible),
    decisionMaker:            sanitizeEnum("decisionMaker", raw.decisionMaker),
    howHeardAboutUs:          sanitizeEnum("howHeardAboutUs", raw.howHeardAboutUs),
    // Array fields (items capped and whitelisted against known option sets)
    servicesNeeded:           sanitizeArr("servicesNeeded", raw.servicesNeeded, 100, 10),
    socialPlatforms:          sanitizeArr("socialPlatforms", raw.socialPlatforms, 50, 10),
    websitePages:             sanitizeArr("websitePages", raw.websitePages, 100, 15),
    brandingDeliverables:     sanitizeArr("brandingDeliverables", raw.brandingDeliverables, 100, 15),
    brandPersonality:         sanitizeArr("brandPersonality", raw.brandPersonality, 100, 10),
    managedPlatforms:         sanitizeArr("managedPlatforms", raw.managedPlatforms, 50, 10),
  };

  // Basic validation
  const email = data.email!.trim();
  const fullName = data.fullName!.trim();
  if (!email || !fullName || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const clientHtml = buildClientEmail(data);
  const internalHtml = buildInternalEmail(data);

  // ── (5) Subject line sanitisation ────────────────────────────────────
  const [clientResult, internalResult] = await Promise.allSettled([
    resend.emails.send({
      from: FROM_ADDRESS,
      to: email,
      subject: `We've received your project brief — ${COMPANY_NAME}`,
      html: clientHtml,
    }),
    resend.emails.send({
      from: FROM_ADDRESS,
      to: INTERNAL_EMAIL,
      subject: `New Brief: ${sanitizeHeader(data.businessName) || "Unknown"} — ${Array.isArray(data.servicesNeeded) ? data.servicesNeeded.join(", ").slice(0, 200) : "—"}`,
      html: internalHtml,
      ...(attachments.length > 0 && { attachments }),
    }),
  ]);

  const clientOk = clientResult.status === "fulfilled" && !clientResult.value.error;
  const internalOk = internalResult.status === "fulfilled" && !internalResult.value.error;

  if (!clientOk || !internalOk) {
    console.error("[send-brief] Client email:", clientResult);
    console.error("[send-brief] Internal email:", internalResult);
  }

  // If both sends failed, return 500 so the frontend shows the error modal.
  // If at least one succeeded we treat it as a success.
  if (!clientOk && !internalOk) {
    return NextResponse.json(
      { error: "Failed to send emails", clientSent: false, internalSent: false },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, clientSent: clientOk, internalSent: internalOk });
}
