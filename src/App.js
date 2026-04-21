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

export default function App() {
  // Layout state
  const [view, setView]           = useState("generator"); // 'generator' | 'dashboard'
  const [activeTab, setActiveTab] = useState("Variables");

  // Generator inputs
  const [colors, setColors]               = useState(DEFAULT_COLORS);
  const [pageStyle, setPageStyle]         = useState("light");
  const [mood, setMood]                   = useState("");
  const [companyName, setCompanyName]     = useState("");
  const [companyLogo, setCompanyLogo]     = useState("");
  const [collectionName, setCollectionName] = useState("Theme");

  // Output state
  const [loading, setLoading] = useState(false);
  const [theme, setTheme]     = useState(null);
  const [error, setError]     = useState(null);
  const [aiStatus, setAiStatus] = useState(null);

  // Save state
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saving, setSaving]               = useState(false);
  const [saveError, setSaveError]         = useState(null);

  const apiKey = process.env.REACT_APP_OPENAI_API_KEY || "";

  // ── Color update helpers ──────────────────────────────────────────────────
  const updateColor = (key, value, fromPicker) => {
    setColors(prev => {
      if (fromPicker) {
        return { ...prev, [key]: { hex: value, input: value } };
      }
      const normalized = value.startsWith("#") ? value : value ? `#${value}` : value;
      return {
        ...prev,
        [key]: {
          input: normalized,
          hex: isValidHex(normalized) ? normalized : prev[key].hex,
        },
      };
    });
  };

  const updateThemeToken = (key, value) => {
    setTheme(t => ({ ...t, [key]: value }));
  };

  // ── Generate ─────────────────────────────────────────────────────────────
  const generate = async () => {
    if (!apiKey) { setError("REACT_APP_OPENAI_API_KEY is not set in .env."); return; }
    if (!isValidHex(colors.primary.hex)) { setError("Please enter a valid primary hex color."); return; }

    setLoading(true);
    setError(null);
    setTheme(null);
    setAiStatus("Generating theme…");

    const { primary, secondary, tertiary } = colors;
    const hasSecondary = isValidHex(secondary.hex);
    const hasTertiary  = isValidHex(tertiary.hex);

    const prompt = `INPUT:
- Primary color (60% — large surfaces, backgrounds): ${primary.hex}${
      hasSecondary ? `\n- Secondary color (30% — supporting elements, text, borders): ${secondary.hex}` : ""
    }${
      hasTertiary ? `\n- Accent color (10% — CTAs, interactive highlights): ${tertiary.hex}` : ""
    }
- Page style: ${pageStyle}${mood ? `\n- Brand mood / industry: ${mood}` : ""}

Apply the 60/30/10 composition rule strictly:
- 60%: color/bg/page and color/bg/surface must anchor to or harmonize with the primary color
- 30%: color/text/primary, color/text/secondary, color/border/default, color/brand/subtle derived from${hasSecondary ? " the secondary color" : " a complementary secondary palette"}
- 10%: color/brand/default, color/brand/hover use${hasTertiary ? " the accent color" : " a derived accent from the primary"}

RULES:
- color/brand/default may be adjusted slightly from the ${hasTertiary ? "accent" : "primary"} for readability
- color/brand/hover must be noticeably darker than brand/default
- color/brand/subtle: very ${pageStyle === "dark" ? "dark muted" : "light airy"} tint of the brand
- color/bg/page: ${pageStyle === "dark" ? "dark rich (not pure black)" : "very light near-white"}
- color/bg/surface: ${pageStyle === "dark" ? "slightly lighter than page" : "slightly darker/warmer than page"}
- color/bg/inverse: ${pageStyle === "dark" ? "light near-white" : "dark rich tone"}
- color/text/primary MUST achieve ≥ 7:1 contrast against color/bg/page (WCAG AAA)
- color/text/secondary MUST achieve ≥ 4.5:1 contrast against color/bg/page (WCAG AA)
- color/text/on-brand must be readable (≥ 4.5:1) on color/brand/default
- color/border/default: subtle, low-contrast separator tone
- Font families must be real Google Fonts. Avoid Inter, Roboto, Arial, Open Sans.

Return ONLY valid JSON, no markdown, no comments:
{"color/brand/default":"#hex","color/brand/hover":"#hex","color/brand/subtle":"#hex","color/bg/page":"#hex","color/bg/surface":"#hex","color/bg/inverse":"#hex","color/text/primary":"#hex","color/text/secondary":"#hex","color/text/on-brand":"#hex","color/border/default":"#hex","font/family/display":"Font Name","font/family/body":"Font Name"}`;

    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o",
          max_tokens: 1000,
          messages: [
            { role: "system", content: "You are a senior product designer and color systems expert. Return only valid JSON — no markdown, no comments." },
            { role: "user", content: prompt },
          ],
        }),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error.message);
      const text = data.choices[0].message.content;
      const parsed = JSON.parse(text.replace(/```json|```/g, "").trim());
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
    setSaving(true);
    setSaveError(null);
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
    setTheme(client.theme);
    setView("generator");
    setActiveTab("Variables");
    setAiStatus(`✓ Loaded: ${client.client_name}`);
    setTimeout(() => setAiStatus(null), 3000);
  };

  // ── Tab content ───────────────────────────────────────────────────────────
  const renderTab = () => {
    if (!theme) return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        flex: 1, gap: 10, color: C.t4, userSelect: 'none',
      }}>
        <div style={{
          width: 40, height: 40, borderRadius: 8, background: C.bg3,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 18,
        }}>⟡</div>
        <div style={{ fontSize: 12, fontWeight: 500, color: C.t3, fontFamily: C.sans }}>No theme generated yet</div>
        <div style={{ fontSize: 11, color: C.t5, fontFamily: C.sans }}>Enter colors above and click Generate</div>
      </div>
    );

    if (activeTab === "Variables") return (
      <div style={{ display: 'flex', gap: 16, padding: '20px 20px 80px', alignItems: 'flex-start' }}>
        {/* Left: token table */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {saveError && (
            <span style={{ fontSize: 11, color: '#EF4444', fontFamily: C.sans }}>{saveError}</span>
          )}
          <VariableTable theme={theme} onEdit={updateThemeToken} />
        </div>

        {/* Right: wcag */}
        <div style={{ width: 300, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ background: C.bg1, border: `1px solid ${C.b2}`, borderRadius: 4, overflow: 'hidden' }}>
            <div style={{
              padding: '9px 14px', borderBottom: `1px solid ${C.b2}`,
              fontSize: 10, fontWeight: 600, color: C.t4, letterSpacing: '.1em',
              textTransform: 'uppercase', fontFamily: C.sans,
              borderTop: `2px solid ${C.accent}`,
            }}>
              Contrast Check
            </div>
            <div style={{ padding: 14 }}>
              <WcagChecker theme={theme} />
            </div>
          </div>
        </div>
      </div>
    );

    if (activeTab === "Accessibility") return (
      <AccessibilityTab theme={theme} loading={loading} />
    );

    if (activeTab === "Preview") return (
      <div style={{ padding: '20px 20px 80px' }}>
        <LivePreview
          theme={theme}
          companyName={companyName}
          companyLogo={companyLogo}
          pageStyle={pageStyle}
        />
      </div>
    );

    if (activeTab === "Export") return (
      <div style={{ padding: '20px 20px 80px', maxWidth: 720 }}>
        <FigmaExport
          theme={theme}
          collectionName={collectionName}
          onCollectionNameChange={setCollectionName}
        />
      </div>
    );

    return null;
  };

  // ── Error banner ──────────────────────────────────────────────────────────
  const errorBanner = error && (
    <div style={{
      padding: '8px 16px', background: '#FEF2F2', borderBottom: '1px solid #FCA5A5',
      fontSize: 11, color: '#DC2626', fontFamily: C.sans, flexShrink: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    }}>
      <span>{error}</span>
      <button onClick={() => setError(null)} style={{ background: 'none', border: 'none', color: '#DC2626', cursor: 'pointer', fontSize: 14, lineHeight: 1 }}>×</button>
    </div>
  );

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100vh',
      overflow: 'hidden', background: C.bg0, fontFamily: C.sans,
    }}>
      {/* Fixed header */}
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

      {/* Input strip (always visible) */}
      <InputStrip
        colors={colors}
        onColorChange={updateColor}
        pageStyle={pageStyle}
        onPageStyleChange={setPageStyle}
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

      {/* 60/30/10 proportion bar — full width, shown when theme exists */}
      {theme && (
        <div style={{ borderBottom: `1px solid ${C.b2}`, background: C.bg1, flexShrink: 0, padding: '12px 20px' }}>
          <ProportionBar
            primary={colors.primary.hex}
            secondary={colors.secondary.hex}
            tertiary={colors.tertiary.hex}
          />
        </div>
      )}

      {/* Error banner */}
      {errorBanner}

      {/* Scrollable content */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        {view === "dashboard"
          ? <Dashboard onLoadTheme={handleLoadTheme} />
          : renderTab()
        }
      </div>

      {/* Save modal */}
      {showSaveModal && (
        <SaveModal
          onSave={handleSave}
          onCancel={() => setShowSaveModal(false)}
          saving={saving}
        />
      )}
    </div>
  );
}
