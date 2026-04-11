export type SectionItem = {
  id: string;
  title: string;
  isVisible: boolean;
  isLocked?: boolean;
  designVariant?: string;
};

export type ToolSection = "start" | "sections" | "global" | "content";
