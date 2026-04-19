import { useState, useEffect } from "react";
import Header from "./components/Header";
import GeneratorForm from "./components/GeneratorForm";
import SwatchStrip from "./components/SwatchStrip";
import WcagChecker from "./components/WcagChecker";
import VariableTable from "./components/VariableTable";
import LivePreview from "./components/LivePreview";
import FigmaExport from "./components/FigmaExport";
import SaveModal from "./components/SaveModal";
import Dashboard from "./components/Dashboard";
import { isValidHex } from "./utils/colorUtils";
import { supabase } from "./lib/supabase";
import { BookmarkPlus, Sparkles } from "lucide-react";

const DEFAULT_COLORS = {
  primary:   { hex: "#6366F1", input: "#6366F1" },
  secondary: { hex: "#1E1B4B", input: "#1E1B4B" },
  tertiary:  { hex: "#A5B4FC", input: "#A5B4FC" },
};

export default function App() {
  const [dark, setDark] = useState(() => localStorage.getItem("fg-dark") === "true");
  const [view, setView] = useState("generator");

  const [colors, setColors] = useState(DEFAULT_COLORS);
  const [pageStyle, setPageStyle] = useState("light");
  const [mood, setMood] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [companyLogo, setCompanyLogo] = useState("");
  const [collectionName, setCollectionName] = useState("Theme");

  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState(null);
  const [error, setError] = useState(null);

  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  const apiKey = process.env.REACT_APP_OPENAI_API_KEY || "";

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("fg-dark", dark);
  }, [dark]);

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

  const generate = async () => {
    if (!apiKey) { setError("REACT_APP_OPENAI_API_KEY is not set in .env."); return; }
    if (!isValidHex(colors.primary.hex)) { setError("Please enter a valid primary hex color."); return; }

    setLoading(true); setError(null); setTheme(null);

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
      setTheme(JSON.parse(text.replace(/```json|```/g, "").trim()));
    } catch (e) {
      setError(e.message || "Generation failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
      <Header
        dark={dark}
        onToggle={() => setDark(d => !d)}
        companyName={companyName}
        companyLogo={companyLogo}
        view={view}
        onViewChange={setView}
      />

      {view === "dashboard" ? (
        <Dashboard onLoadTheme={handleLoadTheme} />
      ) : (
        <div className="pt-12 max-w-6xl mx-auto px-6 py-6 flex gap-5 items-start">

          {/* ── Left: Generator form (sticky) ── */}
          <div className="w-72 flex-shrink-0 sticky top-12 max-h-[calc(100vh-3rem)] overflow-y-auto pb-6 space-y-3">
            <GeneratorForm
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
              collectionName={collectionName}
              onCollectionNameChange={setCollectionName}
              loading={loading}
              onGenerate={generate}
            />
            {error && (
              <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3">
                {error}
              </div>
            )}
          </div>

          {/* ── Right: Generated theme ── */}
          <div className="flex-1 min-w-0 space-y-3 pb-6">
            {theme ? (
              <>
                <SwatchStrip theme={theme} onEdit={updateThemeToken} />

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => { setSaveError(null); setShowSaveModal(true); }}
                    className="flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-white dark:hover:bg-gray-900 transition-colors"
                  >
                    <BookmarkPlus size={13} />
                    Save to Dashboard
                  </button>
                  {saveError && (
                    <span className="text-xs text-red-500 dark:text-red-400">{saveError}</span>
                  )}
                </div>

                <WcagChecker theme={theme} />
                <VariableTable theme={theme} onEdit={updateThemeToken} />
                <LivePreview theme={theme} companyName={companyName} companyLogo={companyLogo} />
                <FigmaExport theme={theme} collectionName={collectionName} />
              </>
            ) : (
              /* Empty state */
              <div className="flex flex-col items-center justify-center h-96 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-800 text-center px-8">
                <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-3">
                  <Sparkles size={18} className="text-gray-400 dark:text-gray-500" />
                </div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  No theme generated yet
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  Configure your colors on the left and hit Generate.
                </p>
              </div>
            )}
          </div>

        </div>
      )}

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
