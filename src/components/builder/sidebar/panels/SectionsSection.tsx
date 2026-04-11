"use client";

import React, { useState, useRef, useEffect } from "react";
import { GripVertical, Pin, Trash2, Copy } from "lucide-react";
import { SectionItem } from "../types";
import { useBuilder } from "../../context/BuilderContext";
import "./SectionsSection.css";

interface SectionsSectionProps {
  sections: SectionItem[];
  setSections: React.Dispatch<React.SetStateAction<SectionItem[]>>;
  activeConfigId: string | null;
  setActiveConfigId: (id: string | null) => void;
  searchQuery?: string;
}

const SectionsSection: React.FC<SectionsSectionProps> = ({
  sections,
  setSections,
  activeConfigId,
  setActiveConfigId,
  searchQuery = "",
}) => {
  const { setScrollToSectionId } = useBuilder();
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  const [dropIndicatorIndex, setDropIndicatorIndex] = useState<number | null>(null);
  const [originalSections, setOriginalSections] = useState<SectionItem[] | null>(null);

  const toggleVisibility = (id: string) => {
    setSections((prev) =>
      prev.map((s) =>
        s.id === id && !s.isLocked ? { ...s, isVisible: !s.isVisible } : s,
      ),
    );
  };

  const duplicateSection = (section: SectionItem) => {
    const newId = section.id.startsWith("features")
      ? `features-${Date.now()}`
      : `${section.id}-${Date.now()}`;
    const copy: SectionItem = {
      ...section,
      id: newId,
      title: `${section.title} (Copy)`,
      isLocked: false,
    };
    setSections((prev) => {
      const idx = prev.findIndex((s) => s.id === section.id);
      const next = [...prev];
      next.splice(idx + 1, 0, copy);
      return next;
    });
  };

  const handleSectionClick = (e: React.MouseEvent, section: SectionItem) => {
    e.stopPropagation();
    if (!section.isVisible) return;
    const newId = activeConfigId === section.id ? null : section.id;
    setActiveConfigId(newId);
    if (newId) setScrollToSectionId(newId);
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    const section = sections.find((s) => s.id === id);
    if (!section || section.isLocked) {
      e.preventDefault();
      return;
    }
    setDraggedItemId(id);
    setOriginalSections([...sections]);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleContainerDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (!draggedItemId) return;

    const container = e.currentTarget as HTMLDivElement;
    let finalIndex = 0;
    const allItems = Array.from(container.children).filter(
      (child) =>
        child instanceof HTMLElement && child.hasAttribute("data-drag-id"),
    ) as HTMLElement[];

    for (let i = 0; i < allItems.length; i++) {
      const rect = allItems[i].getBoundingClientRect();
      const midY = rect.top + rect.height / 2;
      if (e.clientY < midY) { finalIndex = i; break; }
      if (i === allItems.length - 1) finalIndex = i + 1;
    }

    const visibleList = sections.filter((s) => s.isVisible);
    const prev = finalIndex > 0 ? visibleList[finalIndex - 1] : null;
    const next = finalIndex < visibleList.length ? visibleList[finalIndex] : null;
    const effectivePrev =
      prev && prev.id === draggedItemId
        ? finalIndex > 1 ? visibleList[finalIndex - 2] : null
        : prev;
    const effectiveNext =
      next && next.id === draggedItemId
        ? finalIndex < visibleList.length - 1 ? visibleList[finalIndex + 1] : null
        : next;

    if (effectivePrev?.isLocked && effectiveNext?.isLocked) { setDropIndicatorIndex(null); return; }
    if (!effectivePrev && effectiveNext?.isLocked) { setDropIndicatorIndex(null); return; }
    if (effectivePrev?.isLocked && !effectiveNext) { setDropIndicatorIndex(null); return; }

    setDropIndicatorIndex(finalIndex);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!draggedItemId || dropIndicatorIndex === null) {
      setDraggedItemId(null);
      setDropIndicatorIndex(null);
      return;
    }

    const visibleSections = sections.filter((s) => s.isVisible);
    const currentIndex = visibleSections.findIndex((s) => s.id === draggedItemId);
    const newVisibleSections = [...visibleSections];
    const [movedItem] = newVisibleSections.splice(currentIndex, 1);
    let adjustedInsertIndex = dropIndicatorIndex;
    if (currentIndex < dropIndicatorIndex) adjustedInsertIndex--;
    newVisibleSections.splice(adjustedInsertIndex, 0, movedItem);

    const hiddenSections = sections.filter((s) => !s.isVisible);
    setSections([...newVisibleSections, ...hiddenSections]);
    setOriginalSections(null);
    setDraggedItemId(null);
    setDropIndicatorIndex(null);
  };

  const handleDragEnd = () => {
    if (originalSections) setSections(originalSections);
    setDraggedItemId(null);
    setDropIndicatorIndex(null);
    setOriginalSections(null);
  };

  const visibleSections = sections.filter((s) => s.isVisible);
  const filteredSections = searchQuery.trim()
    ? visibleSections.filter((s) =>
        s.title.toLowerCase().includes(searchQuery.trim().toLowerCase()),
      )
    : visibleSections;

  return (
    <div
      className={`section-list ${draggedItemId ? "dragging" : ""}`}
        onDragOver={(e: React.DragEvent<HTMLDivElement>) => {
          e.preventDefault();
          e.stopPropagation();
          try { e.dataTransfer.dropEffect = "move"; } catch (_) { /* noop */ }
          handleContainerDragOver(e);
        }}
        onDrop={(e: React.DragEvent<HTMLDivElement>) => {
          e.preventDefault();
          e.stopPropagation();
          handleDrop(e);
        }}
      >
        {filteredSections.map((section, index) => (
          <React.Fragment key={section.id}>
            {dropIndicatorIndex === index && draggedItemId && (
              <div className="drop-indicator" />
            )}
            <div
              data-id={section.id}
              data-drag-id={section.id}
              draggable={!section.isLocked}
              onDragStart={(e) => handleDragStart(e, section.id)}
              onDragEnd={handleDragEnd}
              onClick={(e) => handleSectionClick(e, section)}
              data-prevent-outside-close="true"
              className={`section-item${activeConfigId === section.id ? " active" : ""}`}
              style={{
                opacity: draggedItemId === section.id ? 0 : 1,
                cursor: section.isLocked
                  ? "default"
                  : draggedItemId === section.id
                    ? "grabbing"
                    : "pointer",
              }}
            >
              {section.isLocked ? (
                <Pin size={12} className="section-lock" />
              ) : (
                <GripVertical size={12} className="section-grip" />
              )}
              <span className="section-title">{section.title}</span>
              {!section.isLocked && (
                <div className="section-actions">
                  <div
                    className="section-copy"
                    title="Duplicate section"
                    onClick={(e) => { e.stopPropagation(); duplicateSection(section); }}
                  >
                    <Copy size={12} />
                  </div>
                  <div
                    className="section-delete"
                    onClick={(e) => { e.stopPropagation(); toggleVisibility(section.id); }}
                  >
                    <Trash2 size={13} />
                  </div>
                </div>
              )}
            </div>
          </React.Fragment>
        ))}

        {dropIndicatorIndex === visibleSections.length && draggedItemId && (
          <div className="drop-indicator" style={{ marginTop: "-2px" }} />
        )}
      </div>
  );
};

export default SectionsSection;
