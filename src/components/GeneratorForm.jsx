import { RefreshCw, Zap } from "lucide-react";
import ColorInputRow from "./ColorInputRow";

export default function GeneratorForm({
  colors, onColorChange,
  pageStyle, onPageStyleChange,
  mood, onMoodChange,
  companyName, onCompanyNameChange,
  companyLogo, onCompanyLogoChange,
  collectionName, onCollectionNameChange,
  loading, onGenerate,
}) {
  const inputCls =
    "w-full h-9 px-3 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 outline-none focus:border-gray-400 dark:focus:border-gray-500 transition-colors";

  return (
    <div className="space-y-3">
      {/* Company */}
      <section className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 space-y-3">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">
          Company
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">Name</label>
            <input
              type="text"
              value={companyName}
              onChange={e => onCompanyNameChange(e.target.value)}
              placeholder="Acme Inc."
              className={inputCls}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">Logo URL</label>
            <input
              type="text"
              value={companyLogo}
              onChange={e => onCompanyLogoChange(e.target.value)}
              placeholder="https://…/logo.png"
              className={`${inputCls} font-mono text-xs`}
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Figma collection name
          </label>
          <input
            type="text"
            value={collectionName}
            onChange={e => onCollectionNameChange(e.target.value)}
            placeholder="Theme"
            className={`${inputCls} font-mono`}
          />
        </div>
      </section>

      {/* Colors — 60/30/10 */}
      <section className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 space-y-3">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">
          Colors — 60 / 30 / 10
        </p>
        <ColorInputRow
          label="Primary"
          sublabel="60% — backgrounds"
          color={colors.primary.hex}
          input={colors.primary.input}
          onColorChange={v => onColorChange("primary", v, true)}
          onInputChange={v => onColorChange("primary", v, false)}
        />
        <ColorInputRow
          label="Secondary"
          sublabel="30% — supporting elements"
          color={colors.secondary.hex}
          input={colors.secondary.input}
          onColorChange={v => onColorChange("secondary", v, true)}
          onInputChange={v => onColorChange("secondary", v, false)}
        />
        <ColorInputRow
          label="Accent"
          sublabel="10% — CTAs & highlights"
          color={colors.tertiary.hex}
          input={colors.tertiary.input}
          onColorChange={v => onColorChange("tertiary", v, true)}
          onInputChange={v => onColorChange("tertiary", v, false)}
        />
      </section>

      {/* Style & mood */}
      <section className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 space-y-3">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">
          Style
        </p>
        <div className="flex gap-2">
          {["light", "dark"].map(s => (
            <button
              key={s}
              onClick={() => onPageStyleChange(s)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors capitalize ${
                pageStyle === s
                  ? "bg-gray-900 dark:bg-gray-50 text-white dark:text-gray-900 border-transparent"
                  : "text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        <input
          type="text"
          value={mood}
          onChange={e => onMoodChange(e.target.value)}
          placeholder="Brand mood / industry — e.g. luxury fashion, fintech, health & wellness"
          className={inputCls}
        />
      </section>

      <button
        onClick={onGenerate}
        disabled={loading}
        className={`w-full h-10 flex items-center justify-center gap-2 rounded-xl text-sm font-medium transition-colors ${
          loading
            ? "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed"
            : "bg-gray-900 dark:bg-gray-50 text-white dark:text-gray-900 hover:bg-gray-700 dark:hover:bg-gray-200 cursor-pointer"
        }`}
      >
        {loading ? (
          <><RefreshCw size={14} className="animate-spin" /> Generating theme…</>
        ) : (
          <><Zap size={14} /> Generate Theme</>
        )}
      </button>
    </div>
  );
}
