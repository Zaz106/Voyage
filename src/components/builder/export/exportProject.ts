import type { GlobalStyles, SectionContent, PageSections } from "../context/BuilderContext";

export async function exportProject(
  globalStyles: GlobalStyles,
  pageSections: PageSections,
  sectionContent: SectionContent,
): Promise<void> {
  const res = await fetch("/api/export", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ globalStyles, pageSections, sectionContent }),
  });

  if (!res.ok) {
    const msg = await res.text().catch(() => "Unknown error");
    throw new Error(`Export failed: ${msg}`);
  }

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "website.zip";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
