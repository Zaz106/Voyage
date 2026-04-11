"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, ChevronRight, Search, SquarePen, Plus, Sun, Moon, Sparkles, X, Copy, Trash2 } from "lucide-react";
import BuilderSecondarySidebar from "./BuilderSecondarySidebar";
import { useBuilder } from "../context/BuilderContext";
import StartSection from "../sidebar/panels/StartSection";
import SectionsSection from "../sidebar/panels/SectionsSection";
import GlobalStylesSection from "../sidebar/panels/GlobalStylesSection";
import ContentSection from "../sidebar/panels/ContentSection";
import { SectionItem, ToolSection } from "../sidebar/types";
import { getDesignsForSection } from "../sections/_shared";
import { invertForTheme } from "../sidebar/widgets/colorUtils";
import { PRESETS } from "../sections/_shared/presets";
import { newPageSections } from "../context/BuilderContext";
import "./BuilderSidebar.css";

// --- Shared Helpers ---
const sanitizeInput = (str: string) =>
  str.replace(/[^a-zA-Z0-9\s-_]/g, "").trim();

const SearchBar = ({
  value,
  onChange,
  onBlurRef,
}: {
  value: string;
  onChange: (val: string) => void;
  onBlurRef?: React.RefObject<HTMLInputElement | null>;
}) => (
  <div className="search-container">
    <div className="search-wrapper">
      <Search size={14} color="#666" />
      <input
        ref={onBlurRef}
        placeholder="Search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="search-input"
      />
    </div>
  </div>
);

const Accordion = ({
  id,
  label,
  isOpen,
  onToggle,
  children,
  extraAction,
}: {
  id: ToolSection;
  label: string;
  isOpen: boolean;
  onToggle: (id: ToolSection) => void;
  children: React.ReactNode;
  extraAction?: React.ReactNode;
}) => (
  <div className="accordion-item">
    <div className="accordion-header" onClick={() => onToggle(id)}>
      <div className="accordion-title-wrapper">
        <span
          className="accordion-title"
          style={{
            color: isOpen ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.7)",
          }}
        >
          {label}
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        {extraAction && (
          <div onClick={(e) => e.stopPropagation()}>{extraAction}</div>
        )}
        {!isOpen && <ChevronRight size={14} color="#666" />}
      </div>
    </div>
    <div
      className="accordion-content-wrapper"
      style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
    >
      <div className="accordion-content-inner">
        <div className="accordion-content" style={{ opacity: isOpen ? 1 : 0 }}>
          {children}
        </div>
      </div>
    </div>
  </div>
);

// --- Main Component ---
interface BuilderSidebarProps {
  forceExpandSection?: ToolSection | null;
}

const BuilderSidebar: React.FC<BuilderSidebarProps> = ({ forceExpandSection }) => {
  const { pageSections, setPageSections, sectionContent, setSectionContent, activeConfigId, setActiveConfigId: setActiveConfigIdCtx, globalStyles, setGlobalStyles, activePage, setActivePage, setIsAiGenerating } = useBuilder();
  const sections = pageSections[activePage] ?? [];
  const setSections = (updater: SectionItem[] | ((prev: SectionItem[]) => SectionItem[])) => {
    setPageSections((prev) => ({
      ...prev,
      [activePage]:
        typeof updater === "function" ? updater(prev[activePage] ?? []) : updater,
    }));
  };

  // Derive pages list from pageSections keys
  const pages = React.useMemo(() => Object.keys(pageSections).map(Number).sort((a, b) => a - b), [pageSections]);

  const [projectTitle, setProjectTitle] = useState("Title");
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isPageDropdownOpen, setIsPageDropdownOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<ToolSection[]>(["start"]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddSectionDropdownOpen, setIsAddSectionDropdownOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  // Honeypot field — never rendered visibly; bots may fill it
  const [aiHoneypot, setAiHoneypot] = useState("");

  // Auto-expand the section selected from the bottom bar
  useEffect(() => {
    if (forceExpandSection) {
      setExpandedSections([forceExpandSection]);
    }
  }, [forceExpandSection]);

  // Auto-expand Sections accordion when a section is clicked on canvas
  useEffect(() => {
    if (activeConfigId && !expandedSections.includes("sections")) {
      setExpandedSections((prev) => [...prev, "sections"]);
    }
  }, [activeConfigId]);

  const setActiveConfigId = (id: string | null) => {
    setActiveConfigIdCtx(id);
    if (id !== null) {
      setIsPageDropdownOpen(false);
      setIsAddSectionDropdownOpen(false);
    }
  };

  const sidebarRef = useRef<HTMLElement>(null);
  const secondarySidebarWrapperRef = useRef<HTMLDivElement>(null);
  const addSectionDropdownRef = useRef<HTMLDivElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.isConnected) return;
      const isTrigger = target.closest("[data-prevent-outside-close]");

      if (headerRef.current && !headerRef.current.contains(target)) {
        setIsEditingTitle(false);
        setIsPageDropdownOpen(false);
      }
      if (searchInputRef.current && !searchInputRef.current.contains(target)) {
        searchInputRef.current.blur();
      }
      if (
        isAddSectionDropdownOpen &&
        addSectionDropdownRef.current &&
        !addSectionDropdownRef.current.contains(target) &&
        !isTrigger
      ) {
        setIsAddSectionDropdownOpen(false);
      }
      if (
        activeConfigId &&
        secondarySidebarWrapperRef.current &&
        !secondarySidebarWrapperRef.current.contains(target) &&
        !isTrigger
      ) {
        setActiveConfigId(null);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [activeConfigId, isAddSectionDropdownOpen]);

  const toggleSection = (section: ToolSection) => {
    setExpandedSections((prev) =>
      prev.includes(section)
        ? prev.filter((s) => s !== section)
        : [...prev, section],
    );
  };

  const handleTitleDoubleClick = () => {
    setIsEditingTitle(true);
    setTimeout(() => titleInputRef.current?.focus(), 0);
  };

  const onTitleBlur = () => {
    setProjectTitle((prev) => sanitizeInput(prev) || "Untitled");
    setIsEditingTitle(false);
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      setProjectTitle((prev) => sanitizeInput(prev) || "Untitled");
      setIsEditingTitle(false);
    }
  };

  const handleAddPage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (pages.length >= 5) return;
    const newPage = Math.max(...pages) + 1;
    setPageSections((prev) => ({
      ...prev,
      [newPage]: newPageSections(),
    }));
    setActivePage(newPage);
    setIsPageDropdownOpen(false);
  };

  const handleDeletePage = (e: React.MouseEvent, pageNum: number) => {
    e.stopPropagation();
    if (pages.length <= 1) return;
    setPageSections((prev) => {
      const next = { ...prev };
      delete next[pageNum];
      return next;
    });
    if (activePage === pageNum) {
      const remaining = pages.filter((p) => p !== pageNum);
      setActivePage(remaining[remaining.length - 1]);
    }
    setIsPageDropdownOpen(false);
  };

  const handleCopyPage = (e: React.MouseEvent, pageNum: number) => {
    e.stopPropagation();
    if (pages.length >= 5) return;
    const newPage = Math.max(...pages) + 1;
    const sourceSections = (pageSections[pageNum] ?? []).map((s) => ({
      ...s,
      id: s.id.startsWith("features-") ? `features-${Date.now()}-${Math.random().toString(36).slice(2, 7)}` : s.id,
    }));
    setPageSections((prev) => ({ ...prev, [newPage]: sourceSections }));
    setActivePage(newPage);
    setIsPageDropdownOpen(false);
  };

  const handleAiGenerate = async () => {
    if (!aiPrompt.trim() || isAiLoading) return;
    setIsAiLoading(true);
    setIsAiGenerating(true);
    setAiError(null);
    setIsAiModalOpen(false); // close immediately so canvas animation is visible

    // Build the sections payload — only id, title, variantId.
    // Field resolution happens server-side from the trusted schema.
    const { variantContentSchemas } = await import("../sections/_shared/contentSchemas");
    const sectionSpecs = sections
      .filter((s) => s.isVisible && s.designVariant && variantContentSchemas[s.designVariant])
      .map((s) => ({
        id: s.id,
        title: s.title,
        variantId: s.designVariant!,
      }));

    if (sectionSpecs.length === 0) {
      setAiError("No editable sections found. Add some sections first.");
      setIsAiLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/ai-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: aiPrompt.trim(),
          sections: sectionSpecs,
          hp: aiHoneypot, // honeypot — always empty for real users
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setAiError(data.error ?? "Failed to generate content. Please try again.");
        setIsAiModalOpen(true); // re-open modal to show error
        return;
      }

      // Merge AI-generated content into sectionContent
      const incoming: Record<string, Record<string, string>> = data.content ?? {};
      setSectionContent((prev) => {
        const next = { ...prev };
        for (const [sectionId, fields] of Object.entries(incoming)) {
          next[sectionId] = { ...(next[sectionId] ?? {}), ...fields };
        }
        return next;
      });

      setAiPrompt("");
      setAiHoneypot("");
    } catch {
      setAiError("Network error. Please check your connection and try again.");
      setIsAiModalOpen(true); // re-open modal to show error
    } finally {
      setIsAiLoading(false);
      setIsAiGenerating(false);
    }
  };

  const handleAddSection = (sectionIdOrType: string) => {
    const existingHidden = sections.find(
      (s) => s.id === sectionIdOrType && !s.isVisible,
    );
    if (existingHidden) {
      setSections((prev) =>
        prev.map((s) =>
          s.id === existingHidden.id ? { ...s, isVisible: true } : s,
        ),
      );
      setIsAddSectionDropdownOpen(false);
      return;
    }
    if (sectionIdOrType.startsWith("Feature Section")) {
      const featureSections = sections.filter((s) =>
        s.title.startsWith("Feature Section"),
      );
      const usedNumbers = featureSections.map((s) => {
        const match = s.title.match(/Feature Section (\d+)/);
        return match ? parseInt(match[1]) : 0;
      });
      const matchNum = sectionIdOrType.match(/Feature Section (\d+)/);
      let targetNum = matchNum ? parseInt(matchNum[1]) : 0;
      if (targetNum === 0 || usedNumbers.includes(targetNum)) {
        let nextNum = 1;
        while (usedNumbers.includes(nextNum)) nextNum++;
        targetNum = nextNum;
      }
      const newSection: SectionItem = {
        id: `features-${Date.now()}`,
        title: `Feature Section ${targetNum}`,
        isVisible: true,
      };
      let insertIndex = -1;
      for (let i = sections.length - 1; i >= 0; i--) {
        if (sections[i].isVisible && sections[i].id.startsWith("features")) {
          insertIndex = i + 1;
          break;
        }
      }
      if (insertIndex === -1) {
        const heroIndex = sections.findIndex((s) => s.id === "hero");
        insertIndex = heroIndex !== -1 ? heroIndex + 1 : sections.length - 1;
      }
      const newSections = [...sections];
      newSections.splice(insertIndex, 0, newSection);
      setSections(newSections);
      setIsAddSectionDropdownOpen(false);
    }
  };

  return (
    <>
      <div style={{ display: "flex", height: "100%", minHeight: 0, position: "relative" }}>
        <aside ref={sidebarRef} className="builder-sidebar">
          <div ref={headerRef} className="sidebar-header">
            <div className="sidebar-header-content">
              <div className="title-container">
                {isEditingTitle ? (
                  <input
                    ref={titleInputRef}
                    value={projectTitle}
                    onChange={(e) => setProjectTitle(e.target.value)}
                    onBlur={onTitleBlur}
                    onKeyDown={handleTitleKeyDown}
                    className="title-input"
                  />
                ) : (
                  <div
                    onClick={handleTitleDoubleClick}
                    className="title-display"
                    title="Click to edit"
                  >
                    {projectTitle}
                    <SquarePen
                      size={13}
                      color="#666"
                      style={{ cursor: "pointer", flexShrink: 0 }}
                    />
                  </div>
                )}
              </div>

              <div className="page-selector">
                <div
                  onClick={() => {
                    setIsPageDropdownOpen(!isPageDropdownOpen);
                    setIsAddSectionDropdownOpen(false);
                  }}
                  className="page-selector-button"
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background =
                      "rgba(255,255,255,0.08)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background =
                      "rgba(255,255,255,0.05)")
                  }
                >
                  Page {activePage}
                  <ChevronDown
                    size={12}
                    style={{
                      transform: isPageDropdownOpen
                        ? "rotate(180deg)"
                        : "rotate(0deg)",
                      transition: "transform 0.2s ease",
                    }}
                  />
                </div>

                {isPageDropdownOpen && (
                  <div className="page-selector-dropdown">
                    {pages.map((page) => (
                      <div
                        key={page}
                        onClick={() => {
                          setActivePage(page);
                          setIsPageDropdownOpen(false);
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background =
                            "rgba(255,255,255,0.08)";
                          e.currentTarget.style.color = "white";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background =
                            page === activePage
                              ? "rgba(255,255,255,0.05)"
                              : "transparent";
                          e.currentTarget.style.color =
                            page === activePage ? "white" : "#888";
                        }}
                        className="page-item"
                        style={{
                          background:
                            page === activePage
                              ? "rgba(255,255,255,0.05)"
                              : "transparent",
                          color: page === activePage ? "white" : "#888",
                        }}
                      >
                        <span>Page {page}</span>
                        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          {page === activePage && (
                            <div
                              style={{
                                width: 4,
                                height: 4,
                                borderRadius: "50%",
                                background: "#987ed2",
                              }}
                            />
                          )}
                          {pages.length < 5 && (
                            <div
                              title="Duplicate page"
                              onClick={(e) => handleCopyPage(e, page)}
                              style={{ display: "flex", alignItems: "center", padding: "2px 2px", borderRadius: 4, opacity: 0.5 }}
                              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.opacity = "1"; e.stopPropagation(); }}
                              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.opacity = "0.5"; }}
                            >
                              <Copy size={11} />
                            </div>
                          )}
                          {page !== activePage && pages.length > 1 && (
                            <div
                              title="Delete page"
                              onClick={(e) => handleDeletePage(e, page)}
                              style={{ display: "flex", alignItems: "center", padding: "2px 2px", borderRadius: 4, opacity: 0.5  }}
                              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.opacity = "1"; e.stopPropagation(); }}
                              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.opacity = "0.5"; }}
                            >
                              <Trash2 size={11} />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    {pages.length < 5 && (
                      <div
                        onClick={handleAddPage}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.background =
                            "rgba(255,255,255,0.08)")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.background = "transparent")
                        }
                        className="add-page-button"
                      >
                        <Plus size={12} /> Add Page
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            onBlurRef={searchInputRef}
          />

          <Accordion
            id="start"
            label="1. Start"
            isOpen={expandedSections.includes("start")}
            onToggle={toggleSection}
            extraAction={
              expandedSections.includes("start") ? (
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    setGlobalStyles((prev) => {
                      const newTheme = prev.theme === "dark" ? "light" : "dark";
                      return {
                        ...prev,
                        theme: newTheme,
                        colors: {
                          primary: invertForTheme(prev.colors.primary),
                          secondary: invertForTheme(prev.colors.secondary),
                          paragraph: invertForTheme(prev.colors.paragraph),
                          accent: prev.colors.accent, // accent stays the same
                        },
                      };
                    });
                  }}
                  style={{
                    cursor: "pointer",
                    borderRadius: "4px",
                    opacity: 0.7,
                    transition: "all 0.2s ease",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "rgba(255,255,255,0.05)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                  title={globalStyles.theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
                >
                  {globalStyles.theme === "dark" ? (
                    <Moon size={15} color="#aaa" />
                  ) : (
                    <Sun size={15} color="#aaa" />
                  )}
                </div>
              ) : null
            }
          >
            <StartSection
              onRandomize={() => {
                setSections((prev) =>
                  prev.map((s) => {
                    const designs = getDesignsForSection(s.id);
                    if (!designs || designs.length <= 1) return s;
                    const randomVariant =
                      designs[Math.floor(Math.random() * designs.length)].id;
                    return { ...s, designVariant: randomVariant };
                  }),
                );
              }}
            />
          </Accordion>

          <Accordion
            id="sections"
            label="2. Sections"
            isOpen={expandedSections.includes("sections")}
            onToggle={toggleSection}
            extraAction={
              expandedSections.includes("sections") ? (
                <div style={{ position: "relative" }}>
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsAddSectionDropdownOpen(!isAddSectionDropdownOpen);
                      setIsPageDropdownOpen(false);
                    }}
                    data-prevent-outside-close="true"
                    style={{
                      cursor: "pointer",
                      borderRadius: "4px",
                      opacity: 0.7,
                      transition: "all 0.2s ease",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "rgba(255,255,255,0.05)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "transparent")
                    }
                  >
                    <Plus size={16} color="#aaa" />
                  </div>

                  {isAddSectionDropdownOpen && (
                    <div
                      ref={addSectionDropdownRef}
                      className="add-section-dropdown"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="add-section-header">Add Section</div>

                      {sections
                        .filter((s) => !s.isVisible)
                        .map((s) => (
                          <div
                            key={s.id}
                            onClick={(e) => { e.stopPropagation(); handleAddSection(s.id); }}
                            className="add-section-item"
                          >
                            <Plus size={12} /> {s.title}
                          </div>
                        ))}

                      {[1, 2, 3].map((num) => {
                        const title = `Feature Section ${num}`;
                        const exists = sections.some((s) => s.title === title);
                        if (!exists) {
                          return (
                            <div
                              key={title}
                              onClick={(e) => { e.stopPropagation(); handleAddSection(title); }}
                              className="add-section-item"
                            >
                              <Plus size={12} /> {title}
                            </div>
                          );
                        }
                        return null;
                      })}
                    </div>
                  )}
                </div>
              ) : null
            }
          >
            <SectionsSection
              sections={sections}
              setSections={setSections}
              activeConfigId={activeConfigId}
              setActiveConfigId={setActiveConfigId}
              searchQuery={searchQuery}
            />
          </Accordion>

          <Accordion
            id="global"
            label="3. Global Style"
            isOpen={expandedSections.includes("global")}
            onToggle={toggleSection}
          >
            <GlobalStylesSection
              activeConfigId={activeConfigId}
              setActiveConfigId={setActiveConfigId}
            />
          </Accordion>

          <Accordion
            id="content"
            label="4. Content"
            isOpen={expandedSections.includes("content")}
            onToggle={toggleSection}
            extraAction={
              expandedSections.includes("content") ? (
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsAiModalOpen(true);
                  }}
                  style={{
                    cursor: "pointer",
                    borderRadius: "4px",
                    opacity: 0.7,
                    transition: "all 0.2s ease",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "4px 6px",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "rgba(255,255,255,0.05)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                  title="AI Content Fill"
                >
                  <Sparkles size={15} color="#aaa" />
                </div>
              ) : null
            }
          >
            <ContentSection
              sections={sections}
              activeConfigId={activeConfigId}
              setActiveConfigId={setActiveConfigId}
            />
          </Accordion>
          <div style={{ height: 80, flexShrink: 0 }} />
        </aside>

        <div ref={secondarySidebarWrapperRef}>
          <BuilderSecondarySidebar
            activeConfigId={activeConfigId}
            setActiveConfigId={setActiveConfigId}
          />
        </div>
      </div>

      {/* AI Content Modal */}
      {isAiModalOpen && (
        <div
          className="ai-modal-overlay"
          onClick={() => !isAiLoading && setIsAiModalOpen(false)}
        >
          <div
            className="ai-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="ai-modal-header">
              <div className="ai-modal-header-left">
                <Sparkles size={16} color="#987ed2" />
                <span className="ai-modal-title">AI Content Fill</span>
              </div>
              <button
                className="ai-modal-close"
                onClick={() => !isAiLoading && setIsAiModalOpen(false)}
                disabled={isAiLoading}
              >
                <X size={16} />
              </button>
            </div>

            <p className="ai-modal-description">
              Describe your business or project and AI will populate all visible section content for you.
            </p>

            {/* Honeypot — hidden from real users, bots will fill it */}
            <input
              type="text"
              value={aiHoneypot}
              onChange={(e) => setAiHoneypot(e.target.value)}
              tabIndex={-1}
              aria-hidden="true"
              style={{ position: "absolute", left: "-9999px", opacity: 0, pointerEvents: "none" }}
              autoComplete="off"
            />

            <textarea
              className="ai-modal-textarea"
              placeholder="e.g. A modern fintech startup that helps freelancers manage invoices and payments…"
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              disabled={isAiLoading}
              maxLength={800}
            />

            {aiError && (
              <p className="ai-modal-error">{aiError}</p>
            )}

            <button
              className="ai-modal-submit"
              disabled={!aiPrompt.trim() || isAiLoading}
              onClick={handleAiGenerate}
            >
              {isAiLoading ? (
                <>
                  <span style={{ width: 14, height: 14, border: "2px solid rgba(255,255,255,0.15)", borderTopColor: "rgba(255,255,255,0.7)", borderRadius: "50%", display: "inline-block", animation: "spin 0.7s linear infinite" }} />
                  Generating…
                </>
              ) : (
                <>
                  <Sparkles size={14} />
                  Generate Content
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default BuilderSidebar;
