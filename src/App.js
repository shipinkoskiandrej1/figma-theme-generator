import { useState } from "react";
import Header from "./components/Header";
import InputStrip from "./components/InputStrip";
import ProportionBar from "./components/ProportionBar";
import VariableTable from "./components/VariableTable";
import WcagChecker from "./components/WcagChecker";
import AccessibilityTab from "./components/AccessibilityTab";
import LivePreview from "./components/LivePreview";
import FigmaExport from "./components/FigmaExport";
import SaveModal from "./components/SaveModal";
import Dashboard from "./components/Dashboard";
import { isValidHex } from "./utils/colorUtils";
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
            background: activeMode === m ? C.accent : 'transparent',
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
  const [companyName, setCompanyName]     = useState("");
  const [companyLogo, setCompanyLogo]     = useState("");
  const [collectionName, setCollectionName] = useState("Semantic");

  // Output  — theme = { primitives, light, dark }
  const [loading, setLoading]   = useState(false);
  const [theme, setTheme]       = useState(null);
  const [error, setError]       = useState(null);
  const [aiStatus, setAiStatus] = useState(null);

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

    // Semantic JSON template (same keys for light and dark)
    const SEM = `"color/bg/base":"#hex","color/bg/surface":"#hex","color/bg/elevated":"#hex","color/bg/overlay":"#hex","color/bg/inverse":"#hex","color/text/primary":"#hex","color/text/secondary":"#hex","color/text/muted":"#hex","color/text/disabled":"#hex","color/text/on-brand":"#hex","color/text/accent":"#hex","color/border/default":"#hex","color/border/subtle":"#hex","color/border/strong":"#hex","color/border/focus":"#hex","color/action/primary/bg":"#hex","color/action/primary/bg-hover":"#hex","color/action/primary/bg-subtle":"#hex","color/action/primary/text":"#hex","color/action/secondary/bg":"#hex","color/action/secondary/bg-hover":"#hex","color/action/secondary/bg-subtle":"#hex","color/action/secondary/text":"#hex","color/link/default":"#hex","color/link/hover":"#hex","font/family/display":"Font Name","font/family/body":"Font Name"`;

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

Neutral scale (0 → 950): 12 steps from near-white to near-black, slightly tinted toward the primary hue.
  0=#hex (near white, e.g. #FAFAFA or #FFFFFF)
  50, 100, 200, 300, 400 = progressively darker light grays
  500 = true mid-tone
  600, 700, 800, 900 = progressively darker
  950 = near-black (not pure black, e.g. #0C1221 or similar with brand tint)

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

Return ONLY valid JSON. No markdown, no comments, no explanation. Every color value must be a valid 6-digit hex (#RRGGBB):
{"primitives":{"color/palette/brand/primary":"${primary.hex}","color/palette/brand/primary-hover":"#hex","color/palette/brand/primary-subtle":"#hex","color/palette/brand/secondary":"${secondary.hex}","color/palette/brand/secondary-hover":"#hex","color/palette/brand/secondary-subtle":"#hex","color/palette/brand/tertiary":"${tertiary.hex}","color/palette/brand/tertiary-hover":"#hex","color/palette/brand/tertiary-subtle":"#hex","color/palette/neutral/0":"#hex","color/palette/neutral/50":"#hex","color/palette/neutral/100":"#hex","color/palette/neutral/200":"#hex","color/palette/neutral/300":"#hex","color/palette/neutral/400":"#hex","color/palette/neutral/500":"#hex","color/palette/neutral/600":"#hex","color/palette/neutral/700":"#hex","color/palette/neutral/800":"#hex","color/palette/neutral/900":"#hex","color/palette/neutral/950":"#hex"},"light":{${SEM}},"dark":{${SEM}}}`;

    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
        body: JSON.stringify({
          model: "gpt-4o",
          max_tokens: 2500,
          messages: [
            { role: "system", content: "You are a design systems expert. Output only valid JSON with 6-digit hex color values. No markdown, no comments." },
            { role: "user", content: prompt },
          ],
        }),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error.message);
      const text = data.choices[0].message.content;
      const parsed = JSON.parse(text.replace(/```json|```/g, "").trim());

      if (!parsed.primitives || !parsed.light || !parsed.dark) throw new Error("Unexpected response structure from AI.");

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
      setTheme(loaded);
    } else {
      // Legacy flat format — wrap so UI doesn't break
      setTheme({ primitives: {}, light: loaded || {}, dark: loaded || {} });
    }
    setView("generator");
    setActiveTab("Variables");
    setAiStatus(`✓ Loaded: ${client.client_name}`);
    setTimeout(() => setAiStatus(null), 3000);
  };

  // ── Tab content ───────────────────────────────────────────────────────────
  const renderTab = () => {
    if (!theme) return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, gap: 12, color: C.t4 }}>
        <div style={{ width: 44, height: 44, borderRadius: 10, background: C.bg3, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>⟡</div>
        <div style={{ fontSize: 13, fontWeight: 500, color: C.t3, fontFamily: C.sans }}>No theme generated yet</div>
        <div style={{ fontSize: 11, color: C.t5, fontFamily: C.sans }}>Enter your three brand colors above and click Generate</div>
      </div>
    );

    if (activeTab === "Variables") return (
      <div style={{ display: 'flex', gap: 20, padding: '28px 28px 80px', alignItems: 'flex-start' }}>
        {/* Left: variable table */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Mode toggle row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: 11, color: C.t4, fontFamily: C.sans }}>
              Editing semantic tokens for <strong style={{ color: C.t2 }}>{activeMode === 'light' ? 'Light' : 'Dark'} Mode</strong>
            </div>
            <ModeToggle activeMode={activeMode} onModeChange={setActiveMode} />
          </div>
          {saveError && <span style={{ fontSize: 11, color: '#EF4444', fontFamily: C.sans }}>{saveError}</span>}
          <VariableTable
            theme={activeFlatTheme}
            activeMode={activeMode}
            onEdit={updateThemeToken}
          />
        </div>

        {/* Right: WCAG summary */}
        <div style={{ width: 300, flexShrink: 0 }}>
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
      />
    );

    if (activeTab === "Preview") return (
      <div style={{ padding: '28px 28px 80px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: 11, color: C.t4, fontFamily: C.sans }}>
            Previewing <strong style={{ color: C.t2 }}>{activeMode === 'light' ? 'Light' : 'Dark'} Mode</strong>
          </div>
          <ModeToggle activeMode={activeMode} onModeChange={setActiveMode} />
        </div>
        <LivePreview theme={activeFlatTheme} companyName={companyName} companyLogo={companyLogo} />
      </div>
    );

    if (activeTab === "Export") return (
      <div style={{ padding: '28px 28px 80px', maxWidth: 760 }}>
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

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', background: C.bg0, fontFamily: C.sans }}>

      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        generated={!!theme}
        view={view}
        onViewChange={setView}
        companyName={companyName}
        companyLogo={companyLogo}
        aiStatus={aiStatus}
        loading={loading}
      />

      <InputStrip
        colors={colors}
        onColorChange={updateColor}
        mood={mood}
        onMoodChange={setMood}
        companyName={companyName}
        onCompanyNameChange={setCompanyName}
        companyLogo={companyLogo}
        onCompanyLogoChange={setCompanyLogo}
        loading={loading}
        onGenerate={generate}
        generated={!!theme}
        onSave={() => { setSaveError(null); setShowSaveModal(true); }}
      />

      {/* 60/30/10 proportion bar */}
      {theme && (
        <div style={{ borderBottom: `1px solid ${C.b2}`, background: C.bg1, flexShrink: 0, padding: '14px 24px' }}>
          <ProportionBar
            primary={colors.primary.hex}
            secondary={colors.secondary.hex}
            tertiary={colors.tertiary.hex}
          />
        </div>
      )}

      {errorBanner}

      {/* Scrollable content */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        {view === "dashboard"
          ? <Dashboard onLoadTheme={handleLoadTheme} />
          : renderTab()
        }
      </div>

      {showSaveModal && (
        <SaveModal onSave={handleSave} onCancel={() => setShowSaveModal(false)} saving={saving} />
      )}
    </div>
  );
}
