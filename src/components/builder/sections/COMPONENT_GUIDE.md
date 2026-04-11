# Builder Component Guide

How to structure a responsive section component for the web builder.

---

## File Structure

Each section variant consists of two files in its section folder:

```
sections/
  <sectionType>/
    <VariantName>.tsx          # React component
    <VariantName>.module.css   # CSS Module styles
```

---

## TSX Template

```tsx
"use client";

import React from "react";
import { useBuilder } from "../../context/BuilderContext";
import { themeBorder, contrastText, RADIUS_CARD } from "../_shared/styles";
import styles from "./MyComponent.module.css";
import layout from "../_shared/layout.module.css";

const MyComponent: React.FC<{ sectionId: string }> = ({ sectionId }) => {
  const { globalStyles, sectionContent } = useBuilder();
  const { colors, borderRadius, buttonStyle, theme, fonts } = globalStyles;
  const ct = sectionContent[sectionId] ?? {};

  // Pull editable content with fallback defaults
  const heading = ct.heading ?? "Default Heading";
  const subtitle = ct.subtitle ?? "Default subtitle text.";

  // Theme-aware colors
  const bg = theme === "dark" ? "#111" : "#f5f5f5";
  const border = themeBorder(theme);

  return (
    <div className={styles.section} style={{ background: bg }}>
      <div className={layout.inner}>
        {/* Section content here */}
        <h2 style={{ color: colors.primary, fontFamily: fonts.heading }}>
          {heading}
        </h2>
        <p style={{ color: colors.paragraph, fontFamily: fonts.body }}>
          {subtitle}
        </p>
      </div>
    </div>
  );
};

export default MyComponent;
```

### Key Patterns

| Concept | Usage |
|---|---|
| `useBuilder()` | Access `globalStyles` and `sectionContent` |
| `sectionContent[sectionId]` | Get user-edited values for this section instance |
| `colors.primary` | Main heading/text color |
| `colors.paragraph` | Body/muted text color |
| `colors.accent` | Buttons, highlights, decorative elements |
| `fonts.heading` | Heading font family |
| `fonts.body` | Body text font family |
| `theme` | `"dark"` or `"light"` — derive background colors from this |
| `borderRadius` | `"sharp"` / `"soft"` / `"rounded"` — use `RADIUS_CARD[borderRadius]` |
| `buttonStyle` | `"filled"` / `"outlined"` — controls button appearance |
| `themeBorder(theme)` | Returns a subtle border color for the current theme |
| `contrastText(bgColor)` | Returns black or white text for readability on a given background |

### Layout Wrapper

Wrap section content with `layout.inner` to constrain width and add responsive padding:

```tsx
import layout from "../_shared/layout.module.css";

<div className={styles.section}>
  <div className={layout.inner}>
    {/* content */}
  </div>
</div>
```

- The section root (`.section`) keeps its full-width background.
- `.inner` constrains content to a max-width with responsive inline padding.
- **Do not** add horizontal padding to the `.section` class itself.

For **footer** sections, use `layout.footerInner` instead (percentage-based widths: 90% desktop, 100% tablet + padding, 100% mobile + padding).

---

## CSS Module Template

```css
/* ComponentName — Brief description */

.section {
  padding: 80px 0;
}

/* ... your classes ... */

@container (max-width: 1024px) {
  /* Tablet adjustments */
}

@container (max-width: 640px) {
  .section {
    padding: 56px 0;
  }
  /* Mobile adjustments */
}
```

### Responsive Rules

1. **Use `@container` queries**, not `@media` queries. The builder canvas uses `container-type: inline-size` on the preview wrapper, so `@container` responds to the canvas width rather than the browser window.

2. **Standard breakpoints:**
   - `1024px` — Tablet / narrow desktop
   - `640px` — Mobile
   - `430px` — Small mobile [optional, for fine-tuning (recommended for complex components)]

3. **No horizontal padding on the section root.** The `layout.inner` wrapper handles all horizontal spacing.

4. **Vertical padding only** on the section root: `padding: 80px 0` desktop, `56px 0` mobile.

5. **Use `cqi` units** for font sizes that should scale with the container width (e.g. giant display text: `font-size: clamp(48px, 14cqi, 220px)`). For regular content text, use fixed `px` or `rem` values.

6. **Flexible grids:** Use `flex-wrap: wrap` with `flex: 1 1 <min-width>` or CSS grid with `repeat(auto-fit, minmax(...))` so card layouts reflow naturally.

---

## Registration

After creating the component files, register in three places:

### 1. `_shared/index.ts` — Variant Registry

```ts
import MyComponent from "../sectionType/MyComponent";

// Add to the sectionDesigns map:
sectionType: [
  // ...existing variants
  { id: "sectionType-x", name: "Display Name", component: MyComponent },
],
```

### 2. `_shared/contentSchemas.ts` — Editable Fields

```ts
"sectionType-x": [
  { key: "heading", label: "Heading", type: "text", defaultValue: "Default" },
  { key: "subtitle", label: "Subtitle", type: "textarea", defaultValue: "..." },
  { key: "features", label: "Features", type: "list", defaultValue: "Item 1, Item 2, Item 3" },
],
```

Field types: `"text"` (single line), `"textarea"` (multi-line), `"list"` (comma-separated).

### 3. `api/export/route.ts` — Export Mapping

```ts
"sectionType-x": { tsx: "sectionType/MyComponent.tsx", css: "sectionType/MyComponent.module.css" },
```

---

## Checklist

- [ ] TSX uses `useBuilder()` for all dynamic values
- [ ] All text colors come from `colors.*` or theme-derived values
- [ ] All font families come from `fonts.heading` / `fonts.body`
- [ ] Section root has no horizontal padding
- [ ] Content wrapped in `layout.inner` (or `layout.footerInner` for footers)
- [ ] CSS uses `@container` queries at `1024px` and `640px` 
- [ ] Registered in `index.ts`, `contentSchemas.ts`, and `route.ts`
- [ ] Build passes with no errors
