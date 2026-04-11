"use client";

import React from "react";
import { ChevronRight } from "lucide-react";
import { SectionItem } from "../types";
import "./ContentSection.css";

interface ContentSectionProps {
  sections: SectionItem[];
  activeConfigId: string | null;
  setActiveConfigId: (id: string | null) => void;
}

const ContentSection: React.FC<ContentSectionProps> = ({
  sections,
  activeConfigId,
  setActiveConfigId,
}) => {
  return (
    <div className="content-list">
      {sections
        .filter((s) => s.isVisible)
        .map((section) => (
          <div
            key={section.id}
            className={`content-item${activeConfigId === `content:${section.id}` ? " active" : ""}`}
            data-prevent-outside-close="true"
            onClick={() =>
              setActiveConfigId(
                activeConfigId === `content:${section.id}` ? null : `content:${section.id}`,
              )
            }
          >
            <span className="content-item-title">{section.title}</span>
            <ChevronRight
              size={13}
              style={{
                color:
                  activeConfigId === `content:${section.id}`
                    ? "rgba(255,255,255,0.5)"
                    : "#444",
                flexShrink: 0,
                transition: "color 0.15s ease",
              }}
            />
          </div>
        ))}
    </div>
  );
};

export default ContentSection;
