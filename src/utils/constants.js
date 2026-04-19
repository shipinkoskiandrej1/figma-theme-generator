export const GROUPS = [
  {
    name: "Brand",
    vars: [
      { key: "color/brand/default", type: "color", desc: "Buttons, links, primary CTA" },
      { key: "color/brand/hover",   type: "color", desc: "Hover & active states" },
      { key: "color/brand/subtle",  type: "color", desc: "Tag fills, tinted backgrounds" },
    ],
  },
  {
    name: "Background",
    vars: [
      { key: "color/bg/page",    type: "color", desc: "Main page background" },
      { key: "color/bg/surface", type: "color", desc: "Cards & elevated panels" },
      { key: "color/bg/inverse", type: "color", desc: "Contrast sections" },
    ],
  },
  {
    name: "Text",
    vars: [
      { key: "color/text/primary",   type: "color", desc: "Headings & body copy" },
      { key: "color/text/secondary", type: "color", desc: "Muted labels & captions" },
      { key: "color/text/on-brand",  type: "color", desc: "Text on brand-colored bg" },
    ],
  },
  {
    name: "Border",
    vars: [
      { key: "color/border/default", type: "color", desc: "Dividers & card outlines" },
    ],
  },
  {
    name: "Typography",
    vars: [
      { key: "font/family/display", type: "font", desc: "Display & heading font" },
      { key: "font/family/body",    type: "font", desc: "Body & UI font" },
    ],
  },
];

export const WCAG_PAIRS = [
  { label: "Body text / Page",    fg: "color/text/primary",   bg: "color/bg/page",       required: "AAA" },
  { label: "Muted text / Page",   fg: "color/text/secondary", bg: "color/bg/page",       required: "AA"  },
  { label: "Body text / Surface", fg: "color/text/primary",   bg: "color/bg/surface",    required: "AA"  },
  { label: "On-brand / Brand",    fg: "color/text/on-brand",  bg: "color/brand/default", required: "AA"  },
  { label: "Body text / Inverse", fg: "color/text/primary",   bg: "color/bg/inverse",    required: "AA"  },
];
