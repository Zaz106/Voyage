"use client";

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import { SectionItem } from "../sidebar/types";
import { GOOGLE_FONTS_URL } from "../sections/_shared/contentSchemas";

// --- Global Styles ---
export type PaletteColors = {
  primary: string;
  secondary: string;
  paragraph: string;
  accent: string;
};

export type BorderRadius = "sharp" | "soft" | "rounded";
export type ButtonStyle = "filled" | "outlined";
export type GlobalTheme = "light" | "dark";

export type FontConfig = {
  heading: string;
  body: string;
};

export type GlobalStyles = {
  colors: PaletteColors;
  borderRadius: BorderRadius;
  buttonStyle: ButtonStyle;
  theme: GlobalTheme;
  fonts: FontConfig;
  showBadge: boolean;
  /** Name of the last applied style preset — used to re-palette on theme change */
  activePresetName?: string;
};

// --- Per-page section mapping ---
export type PageSections = Record<number, SectionItem[]>;

// --- Section content ---
export type SectionContent = Record<string, Record<string, string>>;

// --- History snapshot ---
type Snapshot = {
  globalStyles: GlobalStyles;
  pageSections: PageSections;
  sectionContent: SectionContent;
};

// --- Context value ---
type BuilderContextValue = {
  globalStyles: GlobalStyles;
  setGlobalStyles: React.Dispatch<React.SetStateAction<GlobalStyles>>;
  pageSections: PageSections;
  setPageSections: React.Dispatch<React.SetStateAction<PageSections>>;
  sectionContent: SectionContent;
  setSectionContent: React.Dispatch<React.SetStateAction<SectionContent>>;
  activePage: number;
  setActivePage: (page: number) => void;
  activeConfigId: string | null;
  setActiveConfigId: (id: string | null) => void;
  scrollToSectionId: string | null;
  setScrollToSectionId: (id: string | null) => void;
  isAiGenerating: boolean;
  setIsAiGenerating: (v: boolean) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  pushHistory: () => void;
};

const BuilderContext = createContext<BuilderContextValue | null>(null);

export const useBuilder = () => {
  const ctx = useContext(BuilderContext);
  if (!ctx) throw new Error("useBuilder must be used within BuilderProvider");
  return ctx;
};

const LS_KEY = "luxe-builder-state";

// --- Default SaaS sections for page 1 ---
export const defaultSections: SectionItem[] = [
  { id: "nav",           title: "Navigation",      isVisible: true,  isLocked: true,  designVariant: "nav-a" },
  { id: "hero",          title: "Hero Section",     isVisible: true,  isLocked: true,  designVariant: "hero-a" },
  { id: "logobanner",    title: "Logo Banner",      isVisible: false,                  designVariant: "logobanner-a" },
  { id: "features",      title: "Feature Section 1",isVisible: true,                   designVariant: "features-a" },
  { id: "stats",         title: "Stats",            isVisible: false,                  designVariant: "stats-a" },
  { id: "testimonials",  title: "Testimonials",     isVisible: true,                   designVariant: "testimonials-a" },
  { id: "pricing",       title: "Pricing",          isVisible: true,                   designVariant: "pricing-a" },
  { id: "faq",           title: "FAQ",              isVisible: true,                   designVariant: "faq-a" },
  { id: "cta",           title: "CTA",              isVisible: true,                   designVariant: "cta-centered" },
  { id: "gallery",       title: "Gallery",          isVisible: false,                  designVariant: "gallery-a" },
  { id: "footer",        title: "Footer",           isVisible: true,  isLocked: true,  designVariant: "footer-classic" },
];

// New page gets a lean SaaS skeleton (others remain hidden/addable)
export const newPageSections = (): SectionItem[] => [
  { id: "nav",           title: "Navigation",      isVisible: true,  isLocked: true,  designVariant: "nav-a" },
  { id: "hero",          title: "Hero Section",     isVisible: true,  isLocked: true,  designVariant: "hero-a" },
  { id: "logobanner",    title: "Logo Banner",      isVisible: false,                  designVariant: "logobanner-a" },
  { id: "features",      title: "Feature Section 1",isVisible: true,                   designVariant: "features-a" },
  { id: "stats",         title: "Stats",            isVisible: false,                  designVariant: "stats-a" },
  { id: "testimonials",  title: "Testimonials",     isVisible: false,                  designVariant: "testimonials-a" },
  { id: "pricing",       title: "Pricing",          isVisible: false,                  designVariant: "pricing-a" },
  { id: "faq",           title: "FAQ",              isVisible: false,                  designVariant: "faq-a" },
  { id: "cta",           title: "CTA",              isVisible: true,                   designVariant: "cta-centered" },
  { id: "gallery",       title: "Gallery",          isVisible: false,                  designVariant: "gallery-a" },
  { id: "footer",        title: "Footer",           isVisible: true,  isLocked: true,  designVariant: "footer-classic" },
];

const defaultGlobalStyles: GlobalStyles = {
  colors: { primary: "#111111", secondary: "#555555", paragraph: "#666666", accent: "#6c5ce7" },
  borderRadius: "rounded",
  buttonStyle: "outlined",
  theme: "light",
  fonts: { heading: "Satoshi", body: "Satoshi" },
  showBadge: true,
};

function loadPersistedState(): { globalStyles: GlobalStyles; pageSections: PageSections; sectionContent: SectionContent; activePage: number } | null {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export const BuilderProvider: React.FC<{
  children: React.ReactNode;
  initialState?: {
    globalStyles: GlobalStyles;
    sections: SectionItem[];
    sectionContent: SectionContent;
  };
}> = ({ children, initialState }) => {
  // Always initialize with defaults to avoid SSR/client hydration mismatch.
  // localStorage is loaded after mount in a useEffect below.
  const [globalStyles, setGlobalStyles] = useState<GlobalStyles>(
    initialState?.globalStyles ?? defaultGlobalStyles,
  );
  const [pageSections, setPageSections] = useState<PageSections>(
    initialState ? { 1: initialState.sections } : { 1: defaultSections },
  );
  const [sectionContent, setSectionContent] = useState<SectionContent>(
    initialState?.sectionContent ?? {},
  );
  const [activePage, setActivePageState] = useState<number>(1);
  const [activeConfigId, setActiveConfigId] = useState<string | null>(null);
  const [scrollToSectionId, setScrollToSectionId] = useState<string | null>(null);
  const [isAiGenerating, setIsAiGenerating] = useState(false);

  // --- Undo / Redo ---
  const historyRef = useRef<Snapshot[]>([{ globalStyles, pageSections, sectionContent }]);
  const historyIndexRef = useRef<number>(0);
  const isUndoRedoRef = useRef(false);
  const isLoadingRef = useRef(false);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const pushHistory = useCallback(() => {
    if (isUndoRedoRef.current) return;
    // Read current state via refs to avoid stale closures in callbacks
    setGlobalStyles((gs) => {
      setPageSections((ps) => {
        setSectionContent((sc) => {
          const snap: Snapshot = { globalStyles: gs, pageSections: ps, sectionContent: sc };
          const newHistory = historyRef.current.slice(0, historyIndexRef.current + 1);
          newHistory.push(snap);
          historyRef.current = newHistory.slice(-50);
          historyIndexRef.current = historyRef.current.length - 1;
          setCanUndo(historyIndexRef.current > 0);
          setCanRedo(false);
          return sc;
        });
        return ps;
      });
      return gs;
    });
  }, []);

  const undo = useCallback(() => {
    if (historyIndexRef.current <= 0) return;
    isUndoRedoRef.current = true;
    historyIndexRef.current--;
    const snap = historyRef.current[historyIndexRef.current];
    setGlobalStyles(snap.globalStyles);
    setPageSections(snap.pageSections);
    setSectionContent(snap.sectionContent);
    setCanUndo(historyIndexRef.current > 0);
    setCanRedo(true);
    isUndoRedoRef.current = false;
  }, []);

  const redo = useCallback(() => {
    if (historyIndexRef.current >= historyRef.current.length - 1) return;
    isUndoRedoRef.current = true;
    historyIndexRef.current++;
    const snap = historyRef.current[historyIndexRef.current];
    setGlobalStyles(snap.globalStyles);
    setPageSections(snap.pageSections);
    setSectionContent(snap.sectionContent);
    setCanUndo(true);
    setCanRedo(historyIndexRef.current < historyRef.current.length - 1);
    isUndoRedoRef.current = false;
  }, []);

  // Push history on structural changes (not text edits) via a stable ref
  const globalStylesRef = useRef(globalStyles);
  const pageSectionsRef = useRef(pageSections);
  useEffect(() => { globalStylesRef.current = globalStyles; }, [globalStyles]);
  useEffect(() => { pageSectionsRef.current = pageSections; }, [pageSections]);

  // Auto-push history when globalStyles or pageSections change (discrete actions)
  const prevGsRef = useRef(globalStyles);
  const prevPsRef = useRef(pageSections);
  useEffect(() => {
    if (isUndoRedoRef.current || isLoadingRef.current) return;
    if (prevGsRef.current === globalStyles && prevPsRef.current === pageSections) return;
    prevGsRef.current = globalStyles;
    prevPsRef.current = pageSections;
    const snap: Snapshot = { globalStyles, pageSections, sectionContent };
    const newHistory = historyRef.current.slice(0, historyIndexRef.current + 1);
    newHistory.push(snap);
    historyRef.current = newHistory.slice(-50);
    historyIndexRef.current = historyRef.current.length - 1;
    setCanUndo(historyIndexRef.current > 0);
    setCanRedo(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [globalStyles, pageSections]);

  // --- Persistence: save to localStorage on state changes (debounced) ---
  const saveRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (initialState) return; // preview mode — don't persist
    if (saveRef.current) clearTimeout(saveRef.current);
    saveRef.current = setTimeout(() => {
      try {
        localStorage.setItem(LS_KEY, JSON.stringify({ globalStyles, pageSections, sectionContent, activePage }));
      } catch { /* quota exceeded or SSR — ignore */ }
    }, 800);
    return () => {
      if (saveRef.current) clearTimeout(saveRef.current);
    };
  }, [globalStyles, pageSections, sectionContent, activePage, initialState]);

  // Load persisted state after mount — deferred to avoid SSR/client hydration mismatch
  useEffect(() => {
    if (initialState) return; // preview mode
    const persisted = loadPersistedState();
    if (!persisted) return;
    isLoadingRef.current = true;
    setGlobalStyles(persisted.globalStyles);
    setPageSections(persisted.pageSections);
    setSectionContent(persisted.sectionContent);
    setActivePageState(persisted.activePage);
    // After React commits the new state, reset history baseline to the loaded snapshot
    setTimeout(() => {
      const snap: Snapshot = {
        globalStyles: persisted.globalStyles,
        pageSections: persisted.pageSections,
        sectionContent: persisted.sectionContent,
      };
      historyRef.current = [snap];
      historyIndexRef.current = 0;
      prevGsRef.current = persisted.globalStyles;
      prevPsRef.current = persisted.pageSections;
      setCanUndo(false);
      setCanRedo(false);
      isLoadingRef.current = false;
    }, 0);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setActivePage = useCallback((page: number) => {
    setActivePageState(page);
  }, []);

  // Load Google Fonts for the builder font picker
  useEffect(() => {
    const linkId = "builder-google-fonts";
    if (!document.getElementById(linkId)) {
      const link = document.createElement("link");
      link.id = linkId;
      link.rel = "stylesheet";
      link.href = GOOGLE_FONTS_URL;
      document.head.appendChild(link);
    }
  }, []);

  return (
    <BuilderContext.Provider
      value={{
        globalStyles,
        setGlobalStyles,
        pageSections,
        setPageSections,
        sectionContent,
        setSectionContent,
        activePage,
        setActivePage,
        activeConfigId,
        setActiveConfigId,
        scrollToSectionId,
        setScrollToSectionId,
        isAiGenerating,
        setIsAiGenerating,
        undo,
        redo,
        canUndo,
        canRedo,
        pushHistory,
      }}
    >
      {children}
    </BuilderContext.Provider>
  );
};
