"use client";

import React from "react";

// Nav Designs imports
import NavA from "../nav/NavA";
import NavB from "../nav/NavB";

// Hero Designs imports
import HeroA from "../hero/HeroA";
import HeroB from "../hero/HeroB";
import HeroC from "../hero/HeroC";

// Feature Designs imports
import FeatureA from "../features/FeatureA";
import FeatureB from "../features/FeatureB";
import FeatureC from "../features/FeatureC";
import FeatureD from "../features/FeatureD";
import FeatureE from "../features/FeatureE";

// Testimonials Designs imports
import TestimonialsA from "../testimonials/TestimonialsA";
import TestimonialsB from "../testimonials/TestimonialsB";
import TestimonialsC from "../testimonials/TestimonialsC";

// Gallery Designs imports
import GalleryA from "../gallery/GalleryA";
import GalleryB from "../gallery/GalleryB";

// Pricing Designs imports
import PricingA from "../pricing/PricingA";
import PricingB from "../pricing/PricingB";
import PricingC from "../pricing/PricingC";

// FAQ Designs imports
import FAQA from "../faq/FAQA";
import FAQB from "../faq/FAQB";
import FAQC from "../faq/FAQC";

// CTA Designs imports
import BoldCTA from "../cta/BoldCTA";
import SplitCTA from "../cta/SplitCTA";
import SplitCTAFlipped from "../cta/SplitCTAFlipped";
import GradientCTA from "../cta/GradientCTA";
import DarkBannerCTA from "../cta/DarkBannerCTA";
import CenteredCTA from "../cta/CenteredCTA";
import FlatCTA from "../cta/FlatCTA";
import ImmersiveCTA from "../cta/ImmersiveCTA";

// Footer Designs imports
import FooterClassic from "../footer/FooterClassic";
import MinimalFooter from "../footer/MinimalFooter";
import ImmersiveFooter from "../footer/ImmersiveFooter";
import CorporateFooter from "../footer/CorporateFooter";
import SpinnyFooter from "../footer/SpinnyFooter";
import BigNameFooter from "../footer/BigNameFooter";

// Stats Designs imports
import StatsA from "../stats/StatsA";

// Logo Banner Designs imports
import LogoBannerA from "../logobanner/LogoBannerA";

export type SectionComponentProps = { sectionId: string };
export type SectionComponent = React.FC<SectionComponentProps>;

export type DesignVariant = {
  id: string;
  name: string;
  component: SectionComponent;
};

// All available design variants per section type
export const sectionDesigns: Record<string, DesignVariant[]> = {
  nav: [
    { id: "nav-a", name: "Horizontal Bar", component: NavA },
    { id: "nav-b", name: "Centered Stack", component: NavB },
  ],
  hero: [
    { id: "hero-a", name: "Centered Fullwidth", component: HeroA },
    { id: "hero-b", name: "Split Layout", component: HeroB },
    { id: "hero-c", name: "Statement", component: HeroC },
  ],
  features: [
    { id: "features-a", name: "Card Grid", component: FeatureA },
    { id: "features-b", name: "Numbered List", component: FeatureB },
    { id: "features-c", name: "Values Grid", component: FeatureC },
    { id: "features-d", name: "Service List", component: FeatureD },
    { id: "features-e", name: "Split Image", component: FeatureE },
  ],
  testimonials: [
    { id: "testimonials-a", name: "Three Column", component: TestimonialsA },
    { id: "testimonials-b", name: "Single Column", component: TestimonialsB },
    { id: "testimonials-c", name: "Carousel", component: TestimonialsC },
  ],
  gallery: [
    { id: "gallery-a", name: "Grid Layout", component: GalleryA },
    { id: "gallery-b", name: "Masonry", component: GalleryB },
  ],
  pricing: [
    { id: "pricing-a", name: "Simple Cards", component: PricingA },
    { id: "pricing-b", name: "Featured Card", component: PricingB },
    { id: "pricing-c", name: "Feature Cards", component: PricingC },
  ],
  faq: [
    { id: "faq-a", name: "Stacked Cards", component: FAQA },
    { id: "faq-b", name: "Accordion", component: FAQB },
    { id: "faq-c", name: "Centered Accordion", component: FAQC },
  ],
  cta: [
    { id: "cta-bold",         name: "Bold Email",        component: BoldCTA },
    { id: "cta-centered",     name: "Centered Card",     component: CenteredCTA },
    { id: "cta-flat",         name: "Flat Centered",     component: FlatCTA },
    { id: "cta-split",        name: "Split Left",        component: SplitCTA },
    { id: "cta-split-flipped",name: "Split Right",       component: SplitCTAFlipped },
    { id: "cta-gradient",     name: "Scenic",            component: GradientCTA },
    { id: "cta-dark-banner",  name: "Dark Banner",       component: DarkBannerCTA },
    { id: "cta-immersive",    name: "Immersive",         component: ImmersiveCTA },
  ],
  footer: [
    { id: "footer-classic", name: "Classic", component: FooterClassic },
    { id: "footer-spinny", name: "Scrolling Banner", component: SpinnyFooter },
    { id: "footer-bigname", name: "Fading Brand", component: BigNameFooter },
    { id: "footer-immersive", name: "Immersive", component: ImmersiveFooter },
    { id: "footer-minimal", name: "Minimalist Grid", component: MinimalFooter },
    { id: "footer-corporate", name: "Corporate", component: CorporateFooter },
  ],
  stats: [
    { id: "stats-a", name: "Stat Strip", component: StatsA },
  ],
  logobanner: [
    { id: "logobanner-a", name: "Logo Trust Band", component: LogoBannerA },
  ],
};

/** Normalise section IDs like "features-12345" → "features",
 *  "stats-12345" → "stats", "logobanner-12345" → "logobanner" */
const normaliseSectionType = (sectionId: string): string => {
  if (sectionId.startsWith("features")) return "features";
  if (sectionId.startsWith("stats")) return "stats";
  if (sectionId.startsWith("logobanner")) return "logobanner";
  return sectionId;
};

/** Get the available designs for a section */
export const getDesignsForSection = (
  sectionId: string,
): DesignVariant[] | null => {
  return sectionDesigns[normaliseSectionType(sectionId)] ?? null;
};

/** Get a specific design component for a section given a variant ID */
export const getComponentForSectionVariant = (
  sectionId: string,
  variantId: string | undefined,
): SectionComponent | null => {
  const designs = getDesignsForSection(sectionId);
  if (!designs || designs.length === 0) return null;
  if (variantId) {
    const match = designs.find((d) => d.id === variantId);
    if (match) return match.component;
  }
  // Default to first design (Design A)
  return designs[0].component;
};

/** Get the default variant ID for a section (first available) */
export const getDefaultVariantId = (sectionId: string): string => {
  const designs = getDesignsForSection(sectionId);
  return designs?.[0]?.id ?? "";
};
