export const GROUPS = [
  {
    name: "Brand",
    vars: [
      { key: "color/brand/primary",          type: "color", desc: "Primary CTA, buttons, links" },
      { key: "color/brand/primary-hover",    type: "color", desc: "Hover & active states" },
      { key: "color/brand/primary-subtle",   type: "color", desc: "Tag fills, tinted backgrounds" },
      { key: "color/brand/secondary",        type: "color", desc: "Secondary accent" },
      { key: "color/brand/secondary-hover",  type: "color", desc: "Secondary hover state" },
      { key: "color/brand/tertiary",         type: "color", desc: "Tertiary brand tone" },
    ],
  },
  {
    name: "Background",
    vars: [
      { key: "color/bg/base",     type: "color", desc: "Main page background" },
      { key: "color/bg/surface",  type: "color", desc: "Cards & panels" },
      { key: "color/bg/elevated", type: "color", desc: "Elevated surfaces, dropdowns" },
      { key: "color/bg/overlay",  type: "color", desc: "Modals & popover overlays" },
    ],
  },
  {
    name: "Text",
    vars: [
      { key: "color/text/primary",   type: "color", desc: "Headings & body copy" },
      { key: "color/text/secondary", type: "color", desc: "Muted labels & captions" },
      { key: "color/text/muted",     type: "color", desc: "Placeholder, metadata" },
      { key: "color/text/disabled",  type: "color", desc: "Disabled state text" },
      { key: "color/text/on-brand",  type: "color", desc: "Text on brand-colored bg" },
    ],
  },
  {
    name: "Border",
    vars: [
      { key: "color/border/default", type: "color", desc: "Dividers & card outlines" },
      { key: "color/border/subtle",  type: "color", desc: "Very subtle separators" },
      { key: "color/border/focus",   type: "color", desc: "Focus ring" },
    ],
  },
  {
    name: "Typography",
    vars: [
      { key: "color/link/default",   type: "color", desc: "Link text color" },
      { key: "color/link/hover",     type: "color", desc: "Link hover color" },
      { key: "color/text/accent",    type: "color", desc: "Accent text highlights" },
      { key: "font/family/display",  type: "font",  desc: "Display & heading font" },
      { key: "font/family/body",     type: "font",  desc: "Body & UI font" },
    ],
  },
];

export const WCAG_PAIRS = [
  { label: "Body text / Base",      fg: "color/text/primary",   bg: "color/bg/base",          required: "AAA" },
  { label: "Secondary text / Base", fg: "color/text/secondary", bg: "color/bg/base",          required: "AA"  },
  { label: "Muted text / Base",     fg: "color/text/muted",     bg: "color/bg/base",          required: "AA"  },
  { label: "Body text / Surface",   fg: "color/text/primary",   bg: "color/bg/surface",       required: "AA"  },
  { label: "Body text / Elevated",  fg: "color/text/primary",   bg: "color/bg/elevated",      required: "AA"  },
  { label: "On-brand / Primary",    fg: "color/text/on-brand",  bg: "color/brand/primary",    required: "AA"  },
  { label: "Link / Base",           fg: "color/link/default",   bg: "color/bg/base",          required: "AA"  },
];
