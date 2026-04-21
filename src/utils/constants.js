export const PRIMITIVE_GROUPS = [
  {
    name: "Brand Primitives",
    vars: [
      { key: "color/palette/brand/primary",          type: "color", desc: "Primary brand base" },
      { key: "color/palette/brand/primary-hover",    type: "color", desc: "Primary hover" },
      { key: "color/palette/brand/primary-subtle",   type: "color", desc: "Primary light tint" },
      { key: "color/palette/brand/secondary",        type: "color", desc: "Secondary brand base" },
      { key: "color/palette/brand/secondary-hover",  type: "color", desc: "Secondary hover" },
      { key: "color/palette/brand/secondary-subtle", type: "color", desc: "Secondary light tint" },
      { key: "color/palette/brand/tertiary",         type: "color", desc: "Tertiary brand base" },
      { key: "color/palette/brand/tertiary-hover",   type: "color", desc: "Tertiary hover" },
      { key: "color/palette/brand/tertiary-subtle",  type: "color", desc: "Tertiary light tint" },
    ],
  },
  {
    name: "Neutral Scale",
    vars: [
      { key: "color/palette/neutral/0",   type: "color", desc: "Lightest" },
      { key: "color/palette/neutral/50",  type: "color", desc: "" },
      { key: "color/palette/neutral/100", type: "color", desc: "" },
      { key: "color/palette/neutral/200", type: "color", desc: "" },
      { key: "color/palette/neutral/300", type: "color", desc: "" },
      { key: "color/palette/neutral/400", type: "color", desc: "" },
      { key: "color/palette/neutral/500", type: "color", desc: "Mid" },
      { key: "color/palette/neutral/600", type: "color", desc: "" },
      { key: "color/palette/neutral/700", type: "color", desc: "" },
      { key: "color/palette/neutral/800", type: "color", desc: "" },
      { key: "color/palette/neutral/900", type: "color", desc: "" },
      { key: "color/palette/neutral/950", type: "color", desc: "Darkest" },
    ],
  },
];

export const SEMANTIC_GROUPS = [
  {
    name: "Background",
    vars: [
      { key: "color/bg/base",     type: "color", desc: "Page background" },
      { key: "color/bg/surface",  type: "color", desc: "Cards & panels" },
      { key: "color/bg/elevated", type: "color", desc: "Elevated elements" },
      { key: "color/bg/overlay",  type: "color", desc: "Modals & popovers" },
      { key: "color/bg/inverse",  type: "color", desc: "Inverse contrast" },
    ],
  },
  {
    name: "Text",
    vars: [
      { key: "color/text/primary",   type: "color", desc: "Headings & body" },
      { key: "color/text/secondary", type: "color", desc: "Muted labels" },
      { key: "color/text/muted",     type: "color", desc: "Placeholder" },
      { key: "color/text/disabled",  type: "color", desc: "Disabled state" },
      { key: "color/text/on-brand",  type: "color", desc: "Text on brand bg" },
      { key: "color/text/accent",    type: "color", desc: "Accent highlights" },
    ],
  },
  {
    name: "Border",
    vars: [
      { key: "color/border/default", type: "color", desc: "Card outlines" },
      { key: "color/border/subtle",  type: "color", desc: "Very subtle" },
      { key: "color/border/strong",  type: "color", desc: "Emphatic" },
      { key: "color/border/focus",   type: "color", desc: "Focus ring" },
    ],
  },
  {
    name: "Action / Primary",
    vars: [
      { key: "color/action/primary/bg",        type: "color", desc: "Button bg" },
      { key: "color/action/primary/bg-hover",  type: "color", desc: "Button hover" },
      { key: "color/action/primary/bg-subtle", type: "color", desc: "Button subtle" },
      { key: "color/action/primary/text",      type: "color", desc: "Button text" },
    ],
  },
  {
    name: "Action / Secondary",
    vars: [
      { key: "color/action/secondary/bg",        type: "color", desc: "Secondary btn bg" },
      { key: "color/action/secondary/bg-hover",  type: "color", desc: "Secondary hover" },
      { key: "color/action/secondary/bg-subtle", type: "color", desc: "Secondary subtle" },
      { key: "color/action/secondary/text",      type: "color", desc: "Secondary text" },
    ],
  },
  {
    name: "Link",
    vars: [
      { key: "color/link/default", type: "color", desc: "Link text" },
      { key: "color/link/hover",   type: "color", desc: "Link hover" },
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

// All groups for export utilities
export const ALL_GROUPS = [...PRIMITIVE_GROUPS, ...SEMANTIC_GROUPS];

export const WCAG_PAIRS = [
  { label: "Body text / Base",    fg: "color/text/primary",   bg: "color/bg/base",           required: "AAA" },
  { label: "Secondary / Base",    fg: "color/text/secondary", bg: "color/bg/base",           required: "AA"  },
  { label: "Muted / Base",        fg: "color/text/muted",     bg: "color/bg/base",           required: "AA"  },
  { label: "Body / Surface",      fg: "color/text/primary",   bg: "color/bg/surface",        required: "AA"  },
  { label: "On-brand / Action",   fg: "color/text/on-brand",  bg: "color/action/primary/bg", required: "AA"  },
  { label: "Link / Base",         fg: "color/link/default",   bg: "color/bg/base",           required: "AA"  },
];
