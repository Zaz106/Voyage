import { NextRequest, NextResponse } from "next/server";
import JSZip from "jszip";
import fs from "fs/promises";
import path from "path";

/* ------------------------------------------------------------------ */
/*  Types (mirror the builder context)                                */
/* ------------------------------------------------------------------ */

interface SectionItem {
  id: string;
  title: string;
  isVisible: boolean;
  isLocked?: boolean;
  designVariant?: string;
}

interface GlobalStyles {
  colors: { primary: string; secondary: string; paragraph: string; accent: string };
  borderRadius: "sharp" | "soft" | "rounded";
  buttonStyle: "filled" | "outlined";
  theme: "light" | "dark";
  fonts: { heading: string; body: string };
  showBadge: boolean;
}

type SectionContent = Record<string, Record<string, string>>;

/* ------------------------------------------------------------------ */
/*  Variant ➜ source-file mapping                                     */
/* ------------------------------------------------------------------ */

const VARIANT_FILES: Record<string, { tsx: string; css?: string }> = {
  "nav-a":     { tsx: "nav/NavA.tsx", css: "nav/NavA.module.css" },
  "nav-b":     { tsx: "nav/NavB.tsx", css: "nav/NavB.module.css" },
  "hero-a":    { tsx: "hero/HeroA.tsx", css: "hero/HeroA.module.css" },
  "hero-b":    { tsx: "hero/HeroB.tsx", css: "hero/HeroB.module.css" },
  "hero-c":    { tsx: "hero/HeroC.tsx", css: "hero/HeroC.module.css" },

  "features-a": { tsx: "features/FeatureA.tsx", css: "features/FeatureA.module.css" },
  "features-b": { tsx: "features/FeatureB.tsx", css: "features/FeatureB.module.css" },
  "features-c": { tsx: "features/FeatureC.tsx", css: "features/FeatureC.module.css" },
  "features-d": { tsx: "features/FeatureD.tsx", css: "features/FeatureD.module.css" },
  "features-e": { tsx: "features/FeatureE.tsx", css: "features/FeatureE.module.css" },

  "testimonials-a": { tsx: "testimonials/TestimonialsA.tsx", css: "testimonials/TestimonialsA.module.css" },
  "testimonials-b": { tsx: "testimonials/TestimonialsB.tsx", css: "testimonials/TestimonialsB.module.css" },
  "testimonials-c": { tsx: "testimonials/TestimonialsC.tsx", css: "testimonials/TestimonialsC.module.css" },

  "gallery-a":  { tsx: "gallery/GalleryA.tsx", css: "gallery/GalleryA.module.css" },
  "gallery-b":  { tsx: "gallery/GalleryB.tsx", css: "gallery/GalleryB.module.css" },

  "pricing-a":  { tsx: "pricing/PricingA.tsx", css: "pricing/PricingA.module.css" },
  "pricing-b":  { tsx: "pricing/PricingB.tsx", css: "pricing/PricingB.module.css" },
  "pricing-c":  { tsx: "pricing/PricingC.tsx", css: "pricing/PricingC.module.css" },

  "faq-a":      { tsx: "faq/FAQA.tsx", css: "faq/FAQA.module.css" },
  "faq-b":      { tsx: "faq/FAQB.tsx", css: "faq/FAQB.module.css" },
  "faq-c":      { tsx: "faq/FAQC.tsx", css: "faq/FAQC.module.css" },

  "cta-bold":           { tsx: "cta/BoldCTA.tsx",          css: "cta/BoldCTA.module.css" },
  "cta-centered":       { tsx: "cta/CenteredCTA.tsx",      css: "cta/CenteredCTA.module.css" },
  "cta-flat":           { tsx: "cta/FlatCTA.tsx",           css: "cta/FlatCTA.module.css" },
  "cta-split":          { tsx: "cta/SplitCTA.tsx",          css: "cta/SplitCTA.module.css" },
  "cta-split-flipped":  { tsx: "cta/SplitCTAFlipped.tsx",   css: "cta/SplitCTAFlipped.module.css" },
  "cta-gradient":       { tsx: "cta/GradientCTA.tsx",       css: "cta/GradientCTA.module.css" },
  "cta-dark-banner":    { tsx: "cta/DarkBannerCTA.tsx",     css: "cta/DarkBannerCTA.module.css" },
  "cta-immersive":      { tsx: "cta/ImmersiveCTA.tsx",      css: "cta/ImmersiveCTA.module.css" },

  "footer-classic":     { tsx: "footer/FooterClassic.tsx",   css: "footer/FooterClassic.module.css" },
  "footer-spinny":      { tsx: "footer/SpinnyFooter.tsx",    css: "footer/SpinnyFooter.module.css" },
  "footer-bigname":     { tsx: "footer/BigNameFooter.tsx",   css: "footer/BigNameFooter.module.css" },
  "footer-immersive":   { tsx: "footer/ImmersiveFooter.tsx", css: "footer/ImmersiveFooter.module.css" },
  "footer-minimal":     { tsx: "footer/MinimalFooter.tsx",   css: "footer/MinimalFooter.module.css" },
  "footer-corporate":   { tsx: "footer/CorporateFooter.tsx", css: "footer/CorporateFooter.module.css" },

  "stats-a":         { tsx: "stats/StatsA.tsx",         css: "stats/StatsA.module.css" },
  "logobanner-a":    { tsx: "logobanner/LogoBannerA.tsx", css: "logobanner/LogoBannerA.module.css" },
};

const DEFAULT_VARIANTS: Record<string, string> = {
  nav: "nav-a", hero: "hero-a", features: "features-a",
  testimonials: "testimonials-a", gallery: "gallery-a",
  pricing: "pricing-a", faq: "faq-a", cta: "cta-centered", footer: "footer-classic",
  stats: "stats-a", logobanner: "logobanner-a",
};

const GOOGLE_FONTS = new Set([
  "Inter", "Plus Jakarta Sans", "Poppins", "DM Sans", "Space Grotesk",
  "Montserrat", "Raleway", "Open Sans", "Playfair Display", "Lora", "Merriweather",
]);

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function normalizeSectionType(id: string): string {
  for (const t of Object.keys(DEFAULT_VARIANTS)) {
    if (id === t || id.startsWith(t + "-")) return t;
  }
  return id;
}

function componentName(filePath: string): string {
  return path.basename(filePath, ".tsx");
}

/** Rewrite builder-specific imports so the component works as a standalone. */
function transformSource(source: string): string {
  // BuilderContext ➜ siteConfig
  source = source.replace(
    /import\s*\{([^}]+)\}\s*from\s*["'][^"']*BuilderContext["'];?/g,
    (_match, imports: string) => {
      const items = imports
        .split(",")
        .map((s: string) => s.trim())
        .filter(Boolean)
        .map((s: string) => (s === "useBuilder" ? "useSite" : s));
      return `import { ${items.join(", ")} } from "@/config/siteConfig";`;
    },
  );

  // colorUtils ➜ @/utils/colorUtils
  source = source.replace(
    /import\s*\{([^}]+)\}\s*from\s*["'][^"']*colorUtils["'];?/g,
    (_match, imports: string) =>
      `import { ${imports.trim()} } from "@/utils/colorUtils";`,
  );

  // _shared/styles ➜ @/utils/styles
  source = source.replace(
    /import\s*\{([^}]+)\}\s*from\s*["'][^"']*_shared\/styles["'];?/g,
    (_match, imports: string) =>
      `import { ${imports.trim()} } from "@/utils/styles";`,
  );

  // _shared/layout.module.css ➜ ./layout.module.css (flattened in export)
  source = source.replace(
    /import\s+layout\s+from\s*["'][^"']*_shared\/layout\.module\.css["'];?/g,
    `import layout from "./layout.module.css";`,
  );

  // CSS module imports: adjust relative path to same directory
  source = source.replace(
    /import\s+styles\s+from\s*["']\.\/([^"']+)["'];?/g,
    (_match, file: string) =>
      `import styles from "./${file}";`,
  );

  // useBuilder() ➜ useSite()
  source = source.replace(/useBuilder\(\)/g, "useSite()");

  // Builder-only CSS variable
  source = source.replace(/var\(--preview-vh,\s*100vh\)/g, "100vh");

  return source;
}

/* ------------------------------------------------------------------ */
/*  File generators                                                    */
/* ------------------------------------------------------------------ */

function generateGlobalsCss(gs: GlobalStyles): string {
  const bg = gs.theme === "dark" ? "#0a0a0a" : "#ffffff";
  const fg = gs.theme === "dark" ? "#ffffff" : "#111111";

  let css = `/* Generated by Luxe Web Builder */

:root {
  --background: ${bg};
  --foreground: ${fg};
}

* {
  box-sizing: border-box;
  padding: 0;
  margin: 0;
}

html {
  scroll-behavior: smooth;
  font-size: 100%;
}

body {
  color: var(--foreground);
  background: var(--background);
  font-family: "${gs.fonts.body}", sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  overflow-x: hidden;
}

h1, h2, h3, h4, h5, h6 {
  font-family: "${gs.fonts.heading}", sans-serif;
  line-height: 1.1;
}

a {
  color: inherit;
  text-decoration: none;
}

main {
  container-type: inline-size;
}

::-webkit-scrollbar { width: 10px; }
::-webkit-scrollbar-track { background: #0a0a0a; }
::-webkit-scrollbar-thumb { background: #333; border-radius: 5px; border: 2px solid #0a0a0a; }
::-webkit-scrollbar-thumb:hover { background: #555; }
`;

  if (gs.fonts.heading === "Satoshi" || gs.fonts.body === "Satoshi") {
    const weights = [
      { file: "Satoshi-Light.otf",   weight: 300 },
      { file: "Satoshi-Regular.otf", weight: 400 },
      { file: "Satoshi-Medium.otf",  weight: 500 },
      { file: "Satoshi-Bold.otf",    weight: 700 },
      { file: "Satoshi-Black.otf",   weight: 900 },
    ];
    for (const w of weights) {
      css += `
@font-face {
  font-family: "Satoshi";
  src: url("/fonts/${w.file}") format("opentype");
  font-weight: ${w.weight};
  font-style: normal;
  font-display: swap;
}
`;
    }
  }

  return css;
}

function generateLayoutTsx(gs: GlobalStyles): string {
  const used = new Set<string>();
  if (GOOGLE_FONTS.has(gs.fonts.heading)) used.add(gs.fonts.heading);
  if (GOOGLE_FONTS.has(gs.fonts.body)) used.add(gs.fonts.body);

  let linkTag = "";
  if (used.size > 0) {
    const families = [...used]
      .map((f) => `family=${f.replace(/ /g, "+")}:wght@400;500;600;700`)
      .join("&");
    const href = `https://fonts.googleapis.com/css2?${families}&display=swap`;
    linkTag = `\n        <link href="${href}" rel="stylesheet" />`;
  }

  return `import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "My Website",
  description: "Built with Luxe Web Builder",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>${linkTag}
      </head>
      <body>{children}</body>
    </html>
  );
}
`;
}

function generateSiteConfig(
  gs: GlobalStyles,
  content: SectionContent,
): string {
  return `export type PaletteColors = {
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
};

export type SectionContent = Record<string, Record<string, string>>;

const globalStyles: GlobalStyles = ${JSON.stringify(gs, null, 2)};

const sectionContent: SectionContent = ${JSON.stringify(content, null, 2)};

export function useSite() {
  return { globalStyles, sectionContent };
}
`;
}

function generatePageTsx(sections: SectionItem[]): string {
  const visible = sections.filter((s) => s.isVisible);

  // Deduplicate imports by component name
  const importMap = new Map<string, string>();
  const ordered: { comp: string; sectionId: string }[] = [];

  for (const section of visible) {
    const variant =
      section.designVariant ||
      DEFAULT_VARIANTS[normalizeSectionType(section.id)];
    if (!variant || !VARIANT_FILES[variant]) continue;
    const comp = componentName(VARIANT_FILES[variant].tsx);
    if (!importMap.has(comp)) {
      importMap.set(comp, `@/components/sections/${comp}`);
    }
    ordered.push({ comp, sectionId: section.id });
  }

  const imports = [...importMap.entries()]
    .map(([name, p]) => `import ${name} from "${p}";`)
    .join("\n");

  const jsx = ordered
    .map(({ comp, sectionId }) => `      <${comp} sectionId="${sectionId}" />`)
    .join("\n");

  return `${imports}

export default function Home() {
  return (
    <main>
${jsx}
    </main>
  );
}
`;
}

/* ------------------------------------------------------------------ */
/*  POST handler                                                       */
/* ------------------------------------------------------------------ */

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { globalStyles, pageSections: rawPageSections, sectionContent } = body as {
      globalStyles: GlobalStyles;
      pageSections: Record<number, SectionItem[]>;
      sectionContent: SectionContent;
    };

    // Normalise page numbers (JSON keys are always strings)
    const pageSections: Record<number, SectionItem[]> = {};
    for (const [k, v] of Object.entries(rawPageSections)) {
      pageSections[Number(k)] = v as SectionItem[];
    }
    const pageNumbers = Object.keys(pageSections).map(Number).sort((a, b) => a - b);

    const zip = new JSZip();
    const proj = zip.folder("website")!;

    const sectionsDir = path.join(
      process.cwd(), "src", "components", "builder", "sections",
    );
    const fontsDir = path.join(process.cwd(), "public", "fonts");

    /* --- Collect all visible sections across all pages --- */
    const allVisible: SectionItem[] = [];
    for (const pageNum of pageNumbers) {
      for (const s of (pageSections[pageNum] ?? [])) {
        if (s.isVisible) allVisible.push(s);
      }
    }

    /* --- Determine which variants are needed --- */
    const needed = new Set<string>();
    for (const s of allVisible) {
      const v = s.designVariant || DEFAULT_VARIANTS[normalizeSectionType(s.id)];
      if (v) needed.add(v);
    }

    /* --- Copy & transform section components --- */
    for (const variant of needed) {
      const files = VARIANT_FILES[variant];
      if (!files) continue;

      // TSX
      const tsxPath = path.join(sectionsDir, files.tsx);
      let tsx = await fs.readFile(tsxPath, "utf-8");
      tsx = transformSource(tsx);
      const comp = componentName(files.tsx);
      proj.file(`src/components/sections/${comp}.tsx`, tsx);

      // CSS module (optional)
      if (files.css) {
        try {
          const cssPath = path.join(sectionsDir, files.css);
          const css = await fs.readFile(cssPath, "utf-8");
          proj.file(
            `src/components/sections/${path.basename(files.css)}`,
            css,
          );
        } catch { /* CSS not found – skip */ }
      }
    }

    /* --- Filter sectionContent to only visible sections cross all pages --- */
    const filteredContent: SectionContent = {};
    for (const s of allVisible) {
      if (sectionContent[s.id]) {
        filteredContent[s.id] = sectionContent[s.id];
      }
    }

    /* --- Static config (baked-in data) --- */
    proj.file(
      `src/config/siteConfig.ts`,
      generateSiteConfig(globalStyles, filteredContent),
    );

    /* --- Color utilities --- */
    const colorUtilsPath = path.join(
      process.cwd(), "src", "components", "builder", "sidebar", "widgets", "colorUtils.ts",
    );
    proj.file(
      `src/utils/colorUtils.ts`,
      await fs.readFile(colorUtilsPath, "utf-8"),
    );

    /* --- Shared section styles (RADIUS, themeBg, buttonStyles, etc.) --- */
    const sharedStylesPath = path.join(
      sectionsDir, "_shared", "styles.ts",
    );
    let sharedStyles = await fs.readFile(sharedStylesPath, "utf-8");
    // Rewrite imports: BuilderContext types ➜ siteConfig, colorUtils ➜ @/utils
    sharedStyles = sharedStyles.replace(
      /import\s*\{([^}]+)\}\s*from\s*["'][^"']*BuilderContext["'];?/g,
      (_match: string, imports: string) =>
        `import { ${imports.trim()} } from "@/config/siteConfig";`,
    );
    sharedStyles = sharedStyles.replace(
      /import\s*\{([^}]+)\}\s*from\s*["'][^"']*colorUtils["'];?/g,
      (_match: string, imports: string) =>
        `import { ${imports.trim()} } from "@/utils/colorUtils";`,
    );
    sharedStyles = sharedStyles.replace(
      /export\s*\{([^}]+)\}\s*from\s*["'][^"']*colorUtils["'];?/g,
      (_match: string, imports: string) =>
        `export { ${imports.trim()} } from "@/utils/colorUtils";`,
    );
    proj.file(`src/utils/styles.ts`, sharedStyles);

    /* --- Shared layout CSS module --- */
    const layoutCssPath = path.join(sectionsDir, "_shared", "layout.module.css");
    try {
      const layoutCss = await fs.readFile(layoutCssPath, "utf-8");
      proj.file(`src/components/sections/layout.module.css`, layoutCss);
    } catch { /* layout CSS not found – skip */ }

    /* --- App-level files --- */
    proj.file(`src/app/globals.css`, generateGlobalsCss(globalStyles));
    proj.file(`src/app/layout.tsx`, generateLayoutTsx(globalStyles));

    // Page 1 → src/app/page.tsx; pages 2+ → src/app/page-{n}/page.tsx
    for (const pageNum of pageNumbers) {
      const pageSecs = pageSections[pageNum] ?? [];
      if (pageNum === 1) {
        proj.file(`src/app/page.tsx`, generatePageTsx(pageSecs));
      } else {
        proj.file(`src/app/page-${pageNum}/page.tsx`, generatePageTsx(pageSecs));
      }
    }

    /* --- Project boilerplate --- */
    proj.file(
      `package.json`,
      JSON.stringify(
        {
          name: "my-website",
          version: "0.1.0",
          private: true,
          scripts: { dev: "next dev", build: "next build", start: "next start" },
          dependencies: {
            next: "16.1.6",
            react: "19.2.3",
            "react-dom": "19.2.3",
          },
          devDependencies: {
            "@types/node": "^20",
            "@types/react": "^19",
            "@types/react-dom": "^19",
            typescript: "^5",
          },
        },
        null,
        2,
      ),
    );

    proj.file(
      `next.config.ts`,
      `import type { NextConfig } from "next";\n\nconst nextConfig: NextConfig = {};\n\nexport default nextConfig;\n`,
    );

    proj.file(
      `tsconfig.json`,
      JSON.stringify(
        {
          compilerOptions: {
            target: "ES2017",
            lib: ["dom", "dom.iterable", "esnext"],
            allowJs: true,
            skipLibCheck: true,
            strict: true,
            noEmit: true,
            esModuleInterop: true,
            module: "esnext",
            moduleResolution: "bundler",
            resolveJsonModule: true,
            isolatedModules: true,
            jsx: "react-jsx",
            incremental: true,
            plugins: [{ name: "next" }],
            paths: { "@/*": ["./src/*"] },
          },
          include: [
            "next-env.d.ts",
            "**/*.ts",
            "**/*.tsx",
            ".next/types/**/*.ts",
          ],
          exclude: ["node_modules"],
        },
        null,
        2,
      ),
    );

    proj.file(
      `next-env.d.ts`,
      `/// <reference types="next" />\n/// <reference types="next/image-types/global" />\n`,
    );

    proj.file(
      `README.md`,
      `# My Website\n\nBuilt with Luxe Web Builder.\n\n## Getting Started\n\n\`\`\`bash\nnpm install\nnpm run dev\n\`\`\`\n\nOpen [http://localhost:3000](http://localhost:3000)\n`,
    );

    /* --- Font files (Satoshi) --- */
    const usesSatoshi =
      globalStyles.fonts.heading === "Satoshi" ||
      globalStyles.fonts.body === "Satoshi";
    if (usesSatoshi) {
      try {
        const files = await fs.readdir(fontsDir);
        for (const file of files) {
          if (file.endsWith(".otf")) {
            const data = await fs.readFile(path.join(fontsDir, file));
            proj.file(`public/fonts/${file}`, data);
          }
        }
      } catch { /* fonts dir missing – skip */ }
    }

    /* --- Empty placeholder dirs --- */
    proj.folder(`public/images`);

    /* --- Build & send --- */
    const buffer = await zip.generateAsync({ type: "arraybuffer" });

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": 'attachment; filename="website.zip"',
      },
    });
  } catch (err) {
    console.error("Export error:", err);
    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }
}
