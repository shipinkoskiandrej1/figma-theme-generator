import { RefreshCw, BookmarkPlus, Layers, Eye, Monitor, FileCode, LayoutGrid, Type } from "lucide-react";
import { C } from "../utils/theme";
import { isValidHex } from "../utils/colorUtils";

const NAV_ITEMS = [
  { id: "Variables",     label: "Variables",     icon: Layers },
  { id: "Accessibility", label: "Accessibility", icon: Eye },
  { id: "Preview",       label: "Preview",       icon: Monitor },
  { id: "Export",        label: "Export",        icon: FileCode },
];

function SectionLabel({ children }) {
  return (
    <div style={{
      fontSize: 9, fontWeight: 700, color: C.t5,
      letterSpacing: '.12em', textTransform: 'uppercase',
      fontFamily: C.sans, padding: '0 10px', marginBottom: 4,
    }}>
      {children}
    </div>
  );
}

function ColorInput({ label, color, input, onColorChange, onInputChange }) {
  const invalid = input.length > 1 && !isValidHex(input);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <div style={{ fontSize: 9.5, fontWeight: 600, color: C.t4, letterSpacing: '.06em', textTransform: 'uppercase', fontFamily: C.sans }}>
        {label}
      </div>
      <div style={{
        display: 'flex', alignItems: 'center',
        background: C.bg2, border: `1px solid ${invalid ? '#EF4444' : C.b3}`,
        borderRadius: 7, overflow: 'hidden', height: 34,
      }}>
        <div style={{ position: 'relative', width: 34, height: 34, background: color, flexShrink: 0, borderRight: `1px solid ${C.b3}` }}>
          <input
            type="color"
            value={color}
            onChange={e => onColorChange(e.target.value)}
            style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%', height: '100%' }}
          />
        </div>
        <input
          value={input}
          onChange={e => {
            const raw = e.target.value;
            onInputChange(raw.startsWith('#') ? raw : raw ? `#${raw}` : raw);
          }}
          onBlur={() => { if (!isValidHex(input)) onInputChange(color); }}
          style={{
            flex: 1, background: 'none', border: 'none', padding: '0 10px',
            fontFamily: C.mono, fontSize: 10.5, color: C.t1,
            letterSpacing: '.06em', textTransform: 'uppercase', minWidth: 0,
          }}
        />
      </div>
    </div>
  );
}

export default function Sidebar({
  activeTab, onTabChange,
  generated, view, onViewChange,
  colors, onColorChange,
  mood, onMoodChange,
  fonts, onFontsChange,
  loading, onGenerate, onSave,
  aiStatus,
  isMobile, onClose,
}) {
  const inputBase = {
    width: '100%', padding: '0 10px', height: 34,
    background: C.bg2, border: `1px solid ${C.b3}`,
    borderRadius: 7, color: C.t1, fontSize: 11.5,
    fontFamily: C.sans, boxSizing: 'border-box',
    outline: 'none',
  };

  return (
    <div style={{
      width: 252, flexShrink: 0,
      background: C.bg1, borderRight: `1px solid ${C.b2}`,
      display: 'flex', flexDirection: 'column',
      height: '100vh', overflow: 'hidden',
    }}>

      {/* ── Dark header with logo ── */}
      <div style={{
        padding: '24px 22px 22px',
        background: '#0C1221',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        flexShrink: 0,
        display: 'flex', flexDirection: 'column', gap: 18,
      }}>
        {/* Antibe logo */}
        <img
          src="/antibe-logo.png"
          alt="Antibe"
          style={{ width: '100%', maxWidth: 160, height: 'auto', display: 'block' }}
        />
        {/* Divider */}
        <div style={{ height: 1, background: 'rgba(255,255,255,0.1)' }} />
        {/* Tool label */}
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.45)', letterSpacing: '.1em', textTransform: 'uppercase', fontFamily: C.sans, marginBottom: 3 }}>
            Tool
          </div>
          <div style={{ fontSize: 14, color: '#fff', fontWeight: 600, fontFamily: C.sans, lineHeight: 1.2 }}>
            Theme Generator
          </div>
          <div style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.4)', fontFamily: C.sans, marginTop: 3 }}>
            Design System Builder
          </div>
        </div>
      </div>

      {/* ── Scrollable middle ── */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 0 }}>

        {/* Nav */}
        <div style={{ padding: '18px 12px 12px' }}>
          <SectionLabel>Results</SectionLabel>
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
            const active = activeTab === id && view === 'generator' && generated;
            const clickable = generated;
            return (
              <div
                key={id}
                onClick={() => {
                  if (!clickable) return;
                  onTabChange(id);
                  if (view !== 'generator') onViewChange('generator');
                  if (isMobile) onClose?.();
                }}
                onMouseEnter={e => { if (!active && clickable) e.currentTarget.style.background = C.bg3; }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '9px 10px', borderRadius: 7, marginBottom: 1,
                  background: active ? C.t1 : 'transparent',
                  color: active ? '#fff' : clickable ? C.t2 : C.t5,
                  cursor: clickable ? 'pointer' : 'default',
                  transition: 'background .12s, color .12s',
                  userSelect: 'none',
                }}
              >
                <Icon size={14} strokeWidth={1.75} style={{ flexShrink: 0 }} />
                <span style={{ fontSize: 13, fontWeight: active ? 600 : 400, fontFamily: C.sans }}>{label}</span>
              </div>
            );
          })}
        </div>

        <div style={{ height: 1, background: C.b2, margin: '0 12px' }} />

        {/* Configure */}
        <div style={{ padding: '18px 12px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          <SectionLabel>Configure</SectionLabel>

          {/* Colors */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '0 2px' }}>
            <ColorInput
              label="Primary *"
              color={colors.primary.hex} input={colors.primary.input}
              onColorChange={v => onColorChange('primary', v, true)}
              onInputChange={v => onColorChange('primary', v, false)}
            />
            <ColorInput
              label="Secondary *"
              color={colors.secondary.hex} input={colors.secondary.input}
              onColorChange={v => onColorChange('secondary', v, true)}
              onInputChange={v => onColorChange('secondary', v, false)}
            />
            <ColorInput
              label="Tertiary *"
              color={colors.tertiary.hex} input={colors.tertiary.input}
              onColorChange={v => onColorChange('tertiary', v, true)}
              onInputChange={v => onColorChange('tertiary', v, false)}
            />
          </div>

          {/* Mood */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: '0 2px' }}>
            <div style={{ fontSize: 9.5, fontWeight: 600, color: C.t4, letterSpacing: '.06em', textTransform: 'uppercase', fontFamily: C.sans }}>
              Brand Mood
            </div>
            <input
              value={mood}
              onChange={e => onMoodChange(e.target.value)}
              placeholder="e.g. SaaS / Finance"
              style={inputBase}
            />
          </div>

          {/* Fonts */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: '0 2px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 9.5, fontWeight: 600, color: C.t4, letterSpacing: '.06em', textTransform: 'uppercase', fontFamily: C.sans }}>
              <Type size={9} />
              Fonts
              <span style={{ color: C.t5, fontWeight: 400, textTransform: 'none', letterSpacing: 0, fontSize: 9 }}>(optional)</span>
            </div>
            <div style={{ position: 'relative' }}>
              <input
                value={fonts.display}
                onChange={e => onFontsChange(prev => ({ ...prev, display: e.target.value }))}
                placeholder="Display font…"
                style={{ ...inputBase, paddingRight: fonts.display ? 24 : 10 }}
              />
              {fonts.display && (
                <button
                  onClick={() => onFontsChange(prev => ({ ...prev, display: '' }))}
                  style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: C.t5, cursor: 'pointer', fontSize: 14, lineHeight: 1, padding: 0 }}
                >×</button>
              )}
            </div>
            <div style={{ position: 'relative' }}>
              <input
                value={fonts.body}
                onChange={e => onFontsChange(prev => ({ ...prev, body: e.target.value }))}
                placeholder="Body font…"
                style={{ ...inputBase, paddingRight: fonts.body ? 24 : 10 }}
              />
              {fonts.body && (
                <button
                  onClick={() => onFontsChange(prev => ({ ...prev, body: '' }))}
                  style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: C.t5, cursor: 'pointer', fontSize: 14, lineHeight: 1, padding: 0 }}
                >×</button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom actions ── */}
      <div style={{ padding: '14px 16px 20px', borderTop: `1px solid ${C.b2}`, display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0 }}>

        {aiStatus && (
          <div style={{ fontSize: 10, color: '#10B981', fontFamily: C.mono, letterSpacing: '.02em', lineHeight: 1.5, paddingBottom: 2 }}>
            {aiStatus}
          </div>
        )}

        {generated && (
          <button
            onClick={onSave}
            onMouseEnter={e => { e.currentTarget.style.borderColor = C.t2; e.currentTarget.style.color = C.t1; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = C.b3; e.currentTarget.style.color = C.t3; }}
            style={{
              width: '100%', padding: '9px 0',
              background: 'transparent', border: `1px solid ${C.b3}`,
              borderRadius: 7, fontSize: 12, fontWeight: 500,
              fontFamily: C.sans, color: C.t3, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              transition: 'all .15s',
            }}
          >
            <BookmarkPlus size={12} /> Save Theme
          </button>
        )}

        <button
          onClick={onGenerate}
          disabled={loading}
          style={{
            width: '100%', padding: '10px 0',
            background: C.t1, color: '#fff', border: 'none',
            borderRadius: 7, fontSize: 13, fontWeight: 600,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            fontFamily: C.sans, opacity: loading ? .65 : 1,
            cursor: loading ? 'default' : 'pointer', transition: 'opacity .2s',
          }}
        >
          {loading
            ? <><RefreshCw size={13} style={{ animation: 'spin .7s linear infinite' }} /> Generating…</>
            : <><span style={{ fontSize: 14 }}>⟡</span> Generate Theme</>
          }
        </button>

        <div style={{ height: 1, background: C.b2, margin: '2px 0' }} />

        {/* Dashboard nav */}
        <div
          onClick={() => { onViewChange(view === 'dashboard' ? 'generator' : 'dashboard'); if (isMobile) onClose?.(); }}
          onMouseEnter={e => { if (view !== 'dashboard') e.currentTarget.style.background = C.bg3; }}
          onMouseLeave={e => { if (view !== 'dashboard') e.currentTarget.style.background = 'transparent'; }}
          style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '8px 10px', borderRadius: 7, cursor: 'pointer',
            background: view === 'dashboard' ? C.bg3 : 'transparent',
            color: view === 'dashboard' ? C.t1 : C.t3,
            transition: 'background .12s, color .12s',
            userSelect: 'none',
          }}
        >
          <LayoutGrid size={14} strokeWidth={1.75} />
          <span style={{ fontSize: 13, fontFamily: C.sans }}>Dashboard</span>
        </div>
      </div>
    </div>
  );
}
