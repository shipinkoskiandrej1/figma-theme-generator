import { RefreshCw } from "lucide-react";
import { C } from "../utils/theme";
import { isValidHex } from "../utils/colorUtils";

function ColorPicker({ label, required, color, input, onColorChange, onInputChange }) {
  const invalid = input.length > 1 && !isValidHex(input);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <div style={{ fontSize: 10, fontWeight: 600, color: C.t4, letterSpacing: '.08em', textTransform: 'uppercase', fontFamily: C.sans }}>
        {label}{required && <span style={{ color: C.accent }}> *</span>}
      </div>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 0,
        background: C.bg3, border: `1px solid ${invalid ? '#EF4444' : C.b3}`,
        borderRadius: 4, overflow: 'hidden', height: 34,
      }}>
        <div style={{ position: 'relative', width: 34, height: 34, background: color, flexShrink: 0, borderRight: `1px solid ${C.b3}` }}>
          <input type="color" value={color} onChange={e => onColorChange(e.target.value)} />
        </div>
        <input
          value={input}
          onChange={e => {
            const raw = e.target.value;
            const norm = raw.startsWith('#') ? raw : raw ? `#${raw}` : raw;
            onInputChange(norm);
          }}
          onBlur={() => { if (!isValidHex(input)) onInputChange(color); }}
          style={{
            flex: 1, background: 'none', border: 'none', padding: '0 10px',
            fontFamily: C.mono, fontSize: 11, color: C.t1, letterSpacing: '.06em',
            textTransform: 'uppercase', minWidth: 0, width: 90,
          }}
        />
      </div>
    </div>
  );
}

function ModeToggle({ value, onChange }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <div style={{ fontSize: 10, fontWeight: 600, color: C.t4, letterSpacing: '.08em', textTransform: 'uppercase', fontFamily: C.sans }}>Mode</div>
      <div style={{ display: 'inline-flex', background: C.bg2, border: `1px solid ${C.b2}`, borderRadius: 4, padding: 2, height: 34, alignItems: 'center' }}>
        {['Light', 'Dark'].map(m => (
          <button
            key={m}
            onClick={() => onChange(m)}
            style={{
              padding: '0 16px', height: 26, border: 'none', borderRadius: 3,
              background: value === m ? C.accent : 'transparent',
              color: value === m ? '#FFFFFF' : C.t3,
              fontSize: 12, fontWeight: 500, transition: 'all .12s', lineHeight: 1,
              fontFamily: C.sans,
            }}
          >{m}</button>
        ))}
      </div>
    </div>
  );
}

export default function InputStrip({
  colors, onColorChange,
  pageStyle, onPageStyleChange,
  mood, onMoodChange,
  companyName, onCompanyNameChange,
  companyLogo, onCompanyLogoChange,
  loading, onGenerate, aiStatus,
}) {
  const inputBase = {
    padding: '0 10px', height: 34, background: C.bg3, border: `1px solid ${C.b3}`,
    borderRadius: 4, color: C.t1, fontSize: 12, fontFamily: C.sans,
  };

  return (
    <div style={{ borderBottom: `1px solid ${C.b2}`, background: C.bg1, flexShrink: 0 }}>
      <div style={{ padding: '14px 20px', display: 'flex', gap: 16, alignItems: 'flex-end', flexWrap: 'wrap' }}>

        {/* Color pickers */}
        <div style={{ display: 'flex', gap: 10 }}>
          <ColorPicker label="Primary" required color={colors.primary.hex} input={colors.primary.input}
            onColorChange={v => onColorChange('primary', v, true)} onInputChange={v => onColorChange('primary', v, false)} />
          <ColorPicker label="Secondary" color={colors.secondary.hex} input={colors.secondary.input}
            onColorChange={v => onColorChange('secondary', v, true)} onInputChange={v => onColorChange('secondary', v, false)} />
          <ColorPicker label="Tertiary" color={colors.tertiary.hex} input={colors.tertiary.input}
            onColorChange={v => onColorChange('tertiary', v, true)} onInputChange={v => onColorChange('tertiary', v, false)} />
        </div>

        <div style={{ width: 1, height: 46, background: C.b3, flexShrink: 0 }} />

        <ModeToggle value={pageStyle === 'dark' ? 'Dark' : 'Light'} onChange={v => onPageStyleChange(v.toLowerCase())} />

        {/* Mood input */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: C.t4, letterSpacing: '.08em', textTransform: 'uppercase', fontFamily: C.sans }}>
            Brand Mood / Industry
          </div>
          <input
            value={mood}
            onChange={e => onMoodChange(e.target.value)}
            placeholder="e.g. SaaS / Finance"
            style={{ ...inputBase, width: 180 }}
          />
        </div>

        <div style={{ width: 1, height: 46, background: C.b3, flexShrink: 0 }} />

        {/* Company name + logo */}
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: C.t4, letterSpacing: '.08em', textTransform: 'uppercase', fontFamily: C.sans }}>Company</div>
            <input value={companyName} onChange={e => onCompanyNameChange(e.target.value)} placeholder="Acme Inc."
              style={{ ...inputBase, width: 120 }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: C.t4, letterSpacing: '.08em', textTransform: 'uppercase', fontFamily: C.sans }}>Logo URL</div>
            <input value={companyLogo} onChange={e => onCompanyLogoChange(e.target.value)} placeholder="https://…"
              style={{ ...inputBase, width: 120, fontFamily: C.mono, fontSize: 10 }} />
          </div>
        </div>

        {/* Generate CTA */}
        <div style={{ marginLeft: 'auto', display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-end' }}>
          <button
            onClick={onGenerate}
            disabled={loading}
            style={{
              padding: '0 22px', height: 34, background: C.accent, color: '#fff', border: 'none',
              borderRadius: 4, fontSize: 13, fontWeight: 600, letterSpacing: '.01em',
              display: 'flex', alignItems: 'center', gap: 8, fontFamily: C.sans,
              opacity: loading ? .7 : 1, transition: 'opacity .2s',
              cursor: loading ? 'default' : 'pointer',
            }}
          >
            {loading
              ? <><RefreshCw size={13} style={{ animation: 'spin .7s linear infinite' }} /> Generating…</>
              : <><span style={{ fontSize: 14 }}>⟡</span> Generate Theme</>
            }
          </button>
        </div>
      </div>
    </div>
  );
}
