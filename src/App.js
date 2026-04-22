import { useState } from "react";
import { ChevronDown } from "lucide-react";
import Sidebar from "./components/Sidebar";
import ProportionBar from "./components/ProportionBar";
import VariableTable from "./components/VariableTable";
import WcagChecker from "./components/WcagChecker";
import AccessibilityTab from "./components/AccessibilityTab";
import LivePreview from "./components/LivePreview";
import FigmaExport from "./components/FigmaExport";
import SaveModal from "./components/SaveModal";
import Dashboard from "./components/Dashboard";
import { isValidHex, generateNeutralScale } from "./utils/colorUtils";
import { FIXED_COLORS } from "./utils/constants";
import { supabase } from "./lib/supabase";
import { C } from "./utils/theme";

const DEFAULT_COLORS = {
  primary:   { hex: "#6366F1", input: "#6366F1" },
  secondary: { hex: "#1E1B4B", input: "#1E1B4B" },
  tertiary:  { hex: "#A5B4FC", input: "#A5B4FC" },
};

// ─── Mode Toggle ──────────────────────────────────────────────────────────────
function ModeToggle({ activeMode, onModeChange }) {
  return (
    <div style={{ display: 'inline-flex', background: C.bg2, border: `1px solid ${C.b2}`, borderRadius: 5, padding: 3 }}>
      {['light', 'dark'].map(m => (
        <button
          key={m}
          onClick={() => onModeChange(m)}
          style={{
            padding: '5px 18px', border: 'none', borderRadius: 3,
            background: activeMode === m ? C.t1 : 'transparent',
            color: activeMode === m ? '#fff' : C.t3,
            fontSize: 12, fontWeight: 500, fontFamily: C.sans,
            transition: 'all .12s', cursor: 'pointer', textTransform: 'capitalize',
          }}
        >{m === 'light' ? '☀ Light' : '◑ Dark'}</button>
      ))}
    </div>
  );
}

export default function App() {
  // Layout
  const [view, setView]           = useState("generator");
  const [activeTab, setActiveTab] = useState("Variables");
  const [activeMode, setActiveMode] = useState("light");

  // Inputs
  const [colors, setColors]               = useState(DEFAULT_COLORS);
  const [mood, setMood]                   = useState("");
  const [fonts, setFonts]                 = useState({ display: "", body: "" });
  const [collectionName, setCollectionName] = useState("Semantic");

  // Output  — theme = { primitives, light, dark }
  const [loading, setLoading]   = useState(false);
  const [theme, setTheme]       = useState(null);
  const [error, setError]       = useState(null);
  const [aiStatus, setAiStatus] = useState(null);

  // UI toggles
  const [showPropBar, setShowPropBar] = useState(true);

  // Save
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saving, setSaving]               = useState(false);
  const [saveError, setSaveError]         = useState(null);

  const apiKey = process.env.REACT_APP_OPENAI_API_KEY || "";

  // ── Computed flat theme for a given mode ─────────────────────────────────
  const flatTheme = (mode) =>
    theme ? { ...theme.primitives, ...(theme[mode] || {}) } : null;
  const activeFlatTheme = flatTheme(activeMode);

  // ── Color updates ─────────────────────────────────────────────────────────
  const updateColor = (key, value, fromPicker) => {
    setColors(prev => {
      if (fromPicker) return { ...prev, [key]: { hex: value, input: value } };
      const normalized = value.startsWith("#") ? value : value ? `#${value}` : value;
      return { ...prev, [key]: { input: normalized, hex: isValidHex(normalized) ? normalized : prev[key].hex } };
    });
  };

  const updateThemeToken = (key, value) => {
    setTheme(t => {
      if (!t) return t;
      if (key.startsWith("color/palette/")) {
        return { ...t, primitives: { ...t.primitives, [key]: value } };
      }
      return { ...t, [activeMode]: { ...t[activeMode], [key]: value } };
    });
  };

  // ── Generate ──────────────────────────────────────────────────────────────
  const generate = async () => {
    if (!apiKey) { setError("REACT_APP_OPENAI_API_KEY is not set in .env."); return; }
    if (!isValidHex(colors.primary.hex))   { setError("Primary color is invalid."); return; }
    if (!isValidHex(colors.secondary.hex)) { setError("Secondary color is invalid."); return; }
    if (!isValidHex(colors.tertiary.hex))  { setError("Tertiary color is invalid."); return; }

    setLoading(true); setError(null); setTheme(null); setAiStatus("Generating theme…");

    const { primary, secondary, tertiary } = colors;

    // Pre-compute the brand-tinted neutral scale algorithmically (8% saturation toward brand hue)
    const neutralScale = generateNeutralScale(primary.hex);
    const neutralLines = Object.entries(neutralScale)
      .map(([step, hex]) => `  color/palette/neutral/${step}: ${hex}`)
      .join("\n");

    // Semantic JSON template (same keys for light and dark)
    const SEM = `"color/bg/base":"#hex","color/bg/surface":"#hex","color/bg/elevated":"#hex","color/bg/overlay":"#hex","color/bg/inverse":"#hex","color/text/primary":"#hex","color/text/secondary":"#hex","color/text/muted":"#hex","color/text/disabled":"#hex","color/text/on-brand":"#hex","color/text/accent":"#hex","color/border/default":"#hex","color/border/subtle":"#hex","color/border/strong":"#hex","color/border/focus":"#hex","color/action/primary/bg":"#hex","color/action/primary/bg-hover":"#hex","color/action/primary/bg-subtle":"#hex","color/action/primary/text":"#hex","color/action/secondary/bg":"#hex","color/action/secondary/bg-hover":"#hex","color/action/secondary/bg-subtle":"#hex","color/action/secondary/text":"#hex","color/link/default":"#hex","color/link/hover":"#hex","font/family/display":"Font Name","font/family/body":"Font Name"`;

    // Inject pre-computed neutrals into the JSON template (replace #hex for neutral keys)
    const neutralJsonEntries = Object.entries(neutralScale)
      .map(([step, hex]) => `"color/palette/neutral/${step}":"${hex}"`)
      .join(",");

    const prompt = `You are a senior design systems expert. Generate a complete two-layer design token system.

INPUT COLORS (use EXACT hex values for the primitive base tokens):
- Primary brand: ${primary.hex}
- Secondary brand: ${secondary.hex}
- Tertiary brand: ${tertiary.hex}${mood ? `\n- Brand mood/industry: ${mood}` : ""}

LAYER 1 — PRIMITIVE TOKENS:
Brand scale rules:
- primary/secondary/tertiary: use the EXACT input hex values
- hover variants: ~15% darker than base
- subtle variants: very light tint (~8-12% opacity blended onto white)

Neutral scale — PRE-COMPUTED, use these EXACT values (do NOT change them):
${neutralLines}
These neutrals are algorithmically generated with 8% saturation toward the brand hue.
Use them exactly as-is in the primitives section and base all semantic neutral decisions on these steps.

LAYER 2 — SEMANTIC TOKENS (generate BOTH Light AND Dark modes):

LIGHT MODE rules:
- bg/base: lightest bg — use neutral/50 range
- bg/surface: slightly off-white card bg — neutral/100 range
- bg/elevated: neutral/100-150 range
- bg/overlay: very subtle overlay bg
- bg/inverse: dark bg for contrast sections — neutral/900-950
- text/primary: MUST be ≥7:1 contrast on bg/base (WCAG AAA) — very dark
- text/secondary: ≥4.5:1 on bg/base (WCAG AA)
- text/muted: ≥3:1 on bg/base
- text/disabled: low contrast, dimmed
- text/on-brand: readable on action/primary/bg (≥4.5:1) — usually white
- text/accent: brand-tinted accent text color
- border/default: neutral/200 range — subtle separator
- border/subtle: neutral/100-150 — very faint
- border/strong: neutral/300 — emphatic separator
- border/focus: = brand primary
- action/primary/bg: = brand primary (use exact input)
- action/primary/bg-hover: = brand primary-hover
- action/primary/bg-subtle: very light brand tint bg
- action/primary/text: = text/on-brand
- action/secondary/bg: = secondary brand color
- action/secondary/bg-hover: = secondary-hover
- action/secondary/bg-subtle: very light secondary tint
- action/secondary/text: readable on secondary bg
- link/default: ≥4.5:1 on bg/base — brand colored
- link/hover: slightly brighter than link/default
- font/family/display: real Google Font for headings (NOT Inter, Roboto, Arial, Open Sans)
- font/family/body: real Google Font for body text (NOT Inter, Roboto, Arial, Open Sans)

DARK MODE rules (same token names, inverted for dark backgrounds):
- bg/base: darkest bg — use neutral/950 range (with brand tint, NOT pure black)
- bg/surface: slightly lighter than base
- bg/elevated: slightly lighter than surface
- bg/overlay: slightly lighter than elevated (modals)
- bg/inverse: light bg for contrast — neutral/50-100
- text/primary: light text ≥7:1 on dark bg/base — near white
- text/secondary: ≥4.5:1 on bg/base
- text/muted: ≥3:1 on bg/base — dimmed
- text/disabled: very dimmed
- text/on-brand: readable on dark-mode action/primary/bg
- text/accent: lighter, vibrant brand accent for dark bg
- border/default: very dark subtle border (e.g. neutral/800)
- border/subtle: neutral/900 — barely visible
- border/strong: neutral/700
- border/focus: = brand primary
- action/* values: same as light but may be slightly adjusted for dark bg
- link/default: lighter/brighter for dark background, ≥4.5:1 on dark bg/base
- link/hover: brighter than dark link/default
- font families: SAME as light mode

ALIASES section — which primitive palette token each semantic token maps to:
Every alias value must be an EXACT key from the primitives object. Valid keys:
  Neutral: color/palette/neutral/0, /50, /100, /200, /300, /400, /500, /600, /700, /800, /900, /950
  Brand:   color/palette/brand/primary, /primary-hover, /primary-subtle, /secondary, /secondary-hover, /secondary-subtle, /tertiary, /tertiary-hover, /tertiary-subtle

Light mode alias guidance (neutral/0 = lightest, neutral/950 = darkest):
  bg/* → neutral/0–100 range  |  bg/inverse → neutral/900–950
  text/primary → neutral/900–950  |  text/secondary → neutral/600–700  |  text/muted → neutral/400–500  |  text/disabled → neutral/300
  text/on-brand → neutral/0  |  text/accent → a brand variant
  border/default → neutral/200  |  border/subtle → neutral/100  |  border/strong → neutral/300  |  border/focus → brand/primary
  action/primary/* → brand/primary, brand/primary-hover, brand/primary-subtle, neutral/0 (text)
  action/secondary/* → brand/secondary, brand/secondary-hover, brand/secondary-subtle, neutral/0 (text)
  link/* → a brand variant

Dark mode alias guidance (inverted — neutral/950 = darkest bg):
  bg/base → neutral/950  |  bg/surface → neutral/900  |  bg/elevated → neutral/800  |  bg/overlay → neutral/700  |  bg/inverse → neutral/0–50
  text/primary → neutral/0–50  |  text/secondary → neutral/300–400  |  text/muted → neutral/500  |  text/disabled → neutral/700
  text/on-brand → neutral/0  |  text/accent → a brand variant
  border/default → neutral/800  |  border/subtle → neutral/900  |  border/strong → neutral/700  |  border/focus → brand/primary
  action/* → same brand aliases as light mode (brand colors work on both bg)
  link/* → a brand variant

Return ONLY valid JSON. No markdown, no comments, no explanation. Every color value must be a valid 6-digit hex (#RRGGBB). Every alias value must be an exact primitive key:
{"primitives":{"color/palette/brand/primary":"${primary.hex}","color/palette/brand/primary-hover":"#hex","color/palette/brand/primary-subtle":"#hex","color/palette/brand/secondary":"${secondary.hex}","color/palette/brand/secondary-hover":"#hex","color/palette/brand/secondary-subtle":"#hex","color/palette/brand/tertiary":"${tertiary.hex}","color/palette/brand/tertiary-hover":"#hex","color/palette/brand/tertiary-subtle":"#hex",${neutralJsonEntries}},"light":{${SEM}},"dark":{${SEM}},"aliases":{"light":{"color/bg/base":"PRIM","color/bg/surface":"PRIM","color/bg/elevated":"PRIM","color/bg/overlay":"PRIM","color/bg/inverse":"PRIM","color/text/primary":"PRIM","color/text/secondary":"PRIM","color/text/muted":"PRIM","color/text/disabled":"PRIM","color/text/on-brand":"PRIM","color/text/accent":"PRIM","color/border/default":"PRIM","color/border/subtle":"PRIM","color/border/strong":"PRIM","color/border/focus":"color/palette/brand/primary","color/action/primary/bg":"color/palette/brand/primary","color/action/primary/bg-hover":"color/palette/brand/primary-hover","color/action/primary/bg-subtle":"color/palette/brand/primary-subtle","color/action/primary/text":"PRIM","color/action/secondary/bg":"color/palette/brand/secondary","color/action/secondary/bg-hover":"color/palette/brand/secondary-hover","color/action/secondary/bg-subtle":"color/palette/brand/secondary-subtle","color/action/secondary/text":"PRIM","color/link/default":"PRIM","color/link/hover":"PRIM"},"dark":{"color/bg/base":"PRIM","color/bg/surface":"PRIM","color/bg/elevated":"PRIM","color/bg/overlay":"PRIM","color/bg/inverse":"PRIM","color/text/primary":"PRIM","color/text/secondary":"PRIM","color/text/muted":"PRIM","color/text/disabled":"PRIM","color/text/on-brand":"PRIM","color/text/accent":"PRIM","color/border/default":"PRIM","color/border/subtle":"PRIM","color/border/strong":"PRIM","color/border/focus":"color/palette/brand/primary","color/action/primary/bg":"color/palette/brand/primary","color/action/primary/bg-hover":"color/palette/brand/primary-hover","color/action/primary/bg-subtle":"color/palette/brand/primary-subtle","color/action/primary/text":"PRIM","color/action/secondary/bg":"color/palette/brand/secondary","color/action/secondary/bg-hover":"color/palette/brand/secondary-hover","color/action/secondary/bg-subtle":"color/palette/brand/secondary-subtle","color/action/secondary/text":"PRIM","color/link/default":"PRIM","color/link/hover":"PRIM"}}}
Replace every "PRIM" with an exact primitive key from the valid keys list above.`;

    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
        body: JSON.stringify({
          model: "gpt-4o",
          max_tokens: 3000,
          messages: [
            { role: "system", content: "You are a design systems expert. Output only valid JSON. Color values must be 6-digit hex. Alias values must be exact primitive token keys. No markdown, no comments." },
            { role: "user", content: prompt },
          ],
        }),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error.message);
      const text = data.choices[0].message.content;
      const parsed = JSON.parse(text.replace(/```json|```/g, "").trim());

      if (!parsed.primitives || !parsed.light || !parsed.dark) throw new Error("Unexpected response structure from AI.");

      // Always enforce the algorithmically-generated neutral scale (AI may drift)
      Object.entries(neutralScale).forEach(([step, hex]) => {
        parsed.primitives[`color/palette/neutral/${step}`] = hex;
      });

      // Always enforce fixed colors — these never change
      Object.assign(parsed.primitives, FIXED_COLORS);

      // Override AI fonts with manually specified ones if provided
      if (fonts.display.trim()) {
        parsed.light["font/family/display"] = fonts.display.trim();
        parsed.dark["font/family/display"]  = fonts.display.trim();
      }
      if (fonts.body.trim()) {
        parsed.light["font/family/body"] = fonts.body.trim();
        parsed.dark["font/family/body"]  = fonts.body.trim();
      }

      setTheme(parsed);
      setAiStatus("✓ Theme generated");
      setActiveTab("Variables");
      setView("generator");
      setTimeout(() => setAiStatus(null), 3000);
    } catch (e) {
      setError(e.message || "Generation failed. Please try again.");
      setAiStatus(null);
    } finally {
      setLoading(false);
    }
  };

  // ── Save / Load ───────────────────────────────────────────────────────────
  const handleSave = async (clientName) => {
    setSaving(true); setSaveError(null);
    const { error } = await supabase.from("clients").insert({
      client_name: clientName,
      created_at: new Date().toISOString(),
      theme,
    });
    setSaving(false);
    if (error) setSaveError(error.message);
    else setShowSaveModal(false);
  };

  const handleLoadTheme = (client) => {
    const loaded = client.theme;
    if (loaded?.primitives) {
      // Always re-enforce fixed colors even on loaded themes
      Object.assign(loaded.primitives, FIXED_COLORS);
      setTheme(loaded);
    } else {
      // Legacy flat format — wrap so UI doesn't break
      setTheme({ primitives: { ...FIXED_COLORS }, light: loaded || {}, dark: loaded || {} });
    }
    setView("generator");
    setActiveTab("Variables");
    setAiStatus(`✓ Loaded: ${client.client_name}`);
    setTimeout(() => setAiStatus(null), 3000);
  };

  // ── Tab content ───────────────────────────────────────────────────────────
  const renderTab = () => {
    if (!theme) return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, gap: 16, padding: 48 }}>
        <div style={{ width: 56, height: 56, borderRadius: 14, background: C.bg1, border: `1px solid ${C.b2}`, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26 }}>⟡</div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: C.t1, fontFamily: C.sans, marginBottom: 6 }}>No theme generated yet</div>
          <div style={{ fontSize: 12, color: C.t4, fontFamily: C.sans, lineHeight: 1.6 }}>Configure your brand colors in the sidebar<br/>and click Generate Theme to get started.</div>
        </div>
      </div>
    );

    if (activeTab === "Variables") return (
      <div style={{ display: 'flex', gap: 28, padding: '32px 36px 80px', alignItems: 'flex-start' }}>
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 20 }}>
          {saveError && <span style={{ fontSize: 11, color: '#EF4444', fontFamily: C.sans }}>{saveError}</span>}
          <VariableTable theme={activeFlatTheme} activeMode={activeMode} onEdit={updateThemeToken} />
        </div>
        <div style={{ width: 320, flexShrink: 0 }}>
          <WcagChecker theme={activeFlatTheme} onViewFull={() => setActiveTab('Accessibility')} />
        </div>
      </div>
    );

    if (activeTab === "Accessibility") return (
      <AccessibilityTab
        theme={activeFlatTheme}
        loading={loading}
        activeMode={activeMode}
        onModeChange={setActiveMode}
        onApplyFix={updateThemeToken}
      />
    );

    if (activeTab === "Preview") return (
      <div style={{ padding: '32px 36px 80px' }}>
        <LivePreview theme={activeFlatTheme} />
      </div>
    );

    if (activeTab === "Export") return (
      <div style={{ padding: '32px 36px 80px', maxWidth: 800 }}>
        <FigmaExport theme={theme} collectionName={collectionName} onCollectionNameChange={setCollectionName} />
      </div>
    );

    return null;
  };

  // ── Error banner ──────────────────────────────────────────────────────────
  const errorBanner = error && (
    <div style={{
      padding: '9px 20px', background: '#FEF2F2', borderBottom: '1px solid #FCA5A5',
      fontSize: 11, color: '#DC2626', fontFamily: C.sans, flexShrink: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    }}>
      <span>{error}</span>
      <button onClick={() => setError(null)} style={{ background: 'none', border: 'none', color: '#DC2626', cursor: 'pointer', fontSize: 16, lineHeight: 1 }}>×</button>
    </div>
  );

  // ── Page title for current view ───────────────────────────────────────────
  const pageTitle = view === 'dashboard' ? 'Dashboard' : (activeTab || 'Theme Generator');
  const showModeToggle = view === 'generator' && !!theme && ['Variables', 'Accessibility', 'Preview'].includes(activeTab);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: C.bg0, fontFamily: C.sans }}>

      {/* ── Sidebar ── */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        generated={!!theme}
        view={view}
        onViewChange={setView}
        colors={colors}
        onColorChange={updateColor}
        mood={mood}
        onMoodChange={setMood}
        fonts={fonts}
        onFontsChange={setFonts}
        loading={loading}
        onGenerate={generate}
        onSave={() => { setSaveError(null); setShowSaveModal(true); }}
        aiStatus={aiStatus}
      />

      {/* ── Main content ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Breadcrumb + page header */}
        <div style={{
          padding: '0 36px', borderBottom: `1px solid ${C.b2}`,
          background: C.bg1, flexShrink: 0,
        }}>
          {/* Breadcrumb row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, paddingTop: 18, paddingBottom: 6 }}>
            <span style={{ fontSize: 11, color: C.t5, fontFamily: C.sans }}>Theme Generator</span>
            <span style={{ fontSize: 11, color: C.t5, fontFamily: C.sans }}>/</span>
            <span style={{ fontSize: 11, color: C.t3, fontFamily: C.sans, fontWeight: 500 }}>{pageTitle}</span>
          </div>

          {/* Title + actions row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <h1 style={{ fontSize: 22, fontWeight: 700, color: C.t1, fontFamily: C.sans, margin: 0, lineHeight: 1 }}>
                {pageTitle}
              </h1>
              {theme && view === 'generator' && (
                <span style={{
                  padding: '3px 10px', background: C.bg3,
                  border: `1px solid ${C.b2}`, borderRadius: 99,
                  fontSize: 11, color: C.t4, fontFamily: C.sans,
                }}>
                  Generated
                </span>
              )}
            </div>
            {showModeToggle && (
              <ModeToggle activeMode={activeMode} onModeChange={setActiveMode} />
            )}
          </div>
        </div>

        {/* Proportion bar */}
        {theme && view === 'generator' && (
          <div style={{ borderBottom: `1px solid ${C.b2}`, background: C.bg1, flexShrink: 0 }}>
            {/* Toggle header */}
            <button
              onClick={() => setShowPropBar(v => !v)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 36px', background: 'none', border: 'none', cursor: 'pointer',
                borderBottom: showPropBar ? `1px solid ${C.b2}` : 'none',
              }}
              onMouseEnter={e => e.currentTarget.style.background = C.bg2}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}
            >
              <span style={{ fontSize: 10, fontWeight: 600, color: C.t4, letterSpacing: '.08em', textTransform: 'uppercase', fontFamily: C.sans }}>
                60 / 30 / 10 Rule
              </span>
              <ChevronDown
                size={13}
                strokeWidth={2}
                color={C.t4}
                style={{ transition: 'transform .2s', transform: showPropBar ? 'rotate(0deg)' : 'rotate(-90deg)' }}
              />
            </button>

            {/* Collapsible body */}
            {showPropBar && (
              <div style={{ padding: '16px 36px 18px' }}>
                <ProportionBar
                  primary={colors.primary.hex}
                  secondary={colors.secondary.hex}
                  tertiary={colors.tertiary.hex}
                />
              </div>
            )}
          </div>
        )}

        {errorBanner}

        {/* Scrollable content */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', background: C.bg0 }}>
          {view === 'dashboard'
            ? <Dashboard onLoadTheme={handleLoadTheme} />
            : renderTab()
          }
        </div>
      </div>

      {showSaveModal && (
        <SaveModal onSave={handleSave} onCancel={() => setShowSaveModal(false)} saving={saving} />
      )}
    </div>
  );
}
