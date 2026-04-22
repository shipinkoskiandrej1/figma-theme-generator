import { useState } from "react";
import { C } from "../utils/theme";
import { contrastRatio, findAccessibleColor } from "../utils/colorUtils";
import { WCAG_PAIRS } from "../utils/constants";

function Badge({ pass, label }) {
  return (
    <span style={{
      padding: '3px 7px', borderRadius: 3, fontSize: 9.5, fontWeight: 700, letterSpacing: '.06em',
      background: pass ? '#10B98116' : '#EF444416',
      color: pass ? '#10B981' : '#EF4444',
      border: `1px solid ${pass ? '#10B98130' : '#EF444430'}`,
      fontFamily: C.sans,
    }}>
      {label} {pass ? '✓' : '✗'}
    </span>
  );
}

function Skeleton({ h = 14, style }) {
  return <div style={{ height: h, borderRadius: 4, background: C.bg3, animation: 'pulse 1.4s ease-in-out infinite', ...style }} />;
}

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
        >{m}</button>
      ))}
    </div>
  );
}

function SuggestedFix({ alt, bgHex, onApply }) {
  const [hovered, setHovered] = useState(false);
  const [applied, setApplied] = useState(false);

  const newRatio = Math.round(contrastRatio(alt, bgHex) * 10) / 10;

  const handleClick = () => {
    onApply(alt);
    setApplied(true);
    setTimeout(() => setApplied(false), 2000);
  };

  return (
    <div
      onClick={handleClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: '10px 18px',
        background: applied ? '#F0FDF4' : hovered ? '#FEF9C3' : '#FFFBEB',
        borderTop: `1px solid ${applied ? '#BBF7D0' : '#FDE68A'}`,
        display: 'flex', alignItems: 'center', gap: 8,
        cursor: 'pointer',
        transition: 'background .15s, border-color .15s',
      }}
    >
      <span style={{ fontSize: 10, color: applied ? '#059669' : '#92400E', flex: 1, fontWeight: 500, fontFamily: C.sans }}>
        {applied ? '✓ Applied!' : '💡 Click to apply fix'}
      </span>
      <span style={{ fontFamily: C.mono, fontSize: 9.5, color: applied ? '#059669' : '#92400E', opacity: .75 }}>
        {newRatio}:1 AA ✓
      </span>
      <div style={{
        width: 14, height: 14, borderRadius: 2, background: alt,
        border: '1px solid rgba(0,0,0,.1)', flexShrink: 0,
        boxShadow: hovered ? '0 0 0 2px rgba(0,0,0,.15)' : 'none',
        transition: 'box-shadow .15s',
      }} />
      <span style={{ fontFamily: C.mono, fontSize: 10, color: applied ? '#059669' : '#92400E', fontWeight: 600 }}>
        {alt.toUpperCase()}
      </span>
    </div>
  );
}

export default function AccessibilityTab({ theme, loading, activeMode, onModeChange, onApplyFix }) {
  if (!theme) return null;

  const pairs = WCAG_PAIRS.filter(p => theme[p.fg] && theme[p.bg]).map(p => {
    const ratio = contrastRatio(theme[p.fg], theme[p.bg]);
    const ratioRounded = Math.round(ratio * 10) / 10;
    const aa = ratio >= 4.5;
    const aaa = ratio >= 7;
    const alt = !aa ? findAccessibleColor(theme[p.fg], theme[p.bg], 4.5) : null;
    return { ...p, fgHex: theme[p.fg], bgHex: theme[p.bg], ratio: ratioRounded, aa, aaa, alt };
  });

  const passAA  = pairs.filter(p => p.aa).length;
  const passAAA = pairs.filter(p => p.aaa).length;
  const total   = pairs.length;

  return (
    <div style={{ padding: '36px 36px 80px', display: 'flex', flexDirection: 'column', gap: 36 }}>

      {/* Header + mode toggle */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: C.t1, fontFamily: C.sans }}>Accessibility Analysis</div>
          <div style={{ fontSize: 11, color: C.t4, fontFamily: C.sans, marginTop: 3 }}>
            WCAG contrast ratios for {activeMode === 'light' ? 'Light' : 'Dark'} Mode
          </div>
        </div>
        <ModeToggle activeMode={activeMode} onModeChange={onModeChange} />
      </div>

      {/* Summary stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        {[
          ['Total Pairs',  total,          C.t1,      C.bg1,     C.b2],
          ['AA Pass',      passAA,         '#059669', '#F0FDF4', '#BBF7D0'],
          ['AAA Pass',     passAAA,        '#7C3AED', '#F5F3FF', '#DDD6FE'],
          ['Needs Fix',    total - passAA, '#DC2626', '#FEF2F2', '#FCA5A5'],
        ].map(([label, val, textColor, bgColor, borderColor]) => (
          <div key={label} style={{
            padding: '24px 26px', background: bgColor,
            border: `1px solid ${borderColor}`, borderRadius: 8,
            display: 'flex', flexDirection: 'column', gap: 8,
          }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: textColor, lineHeight: 1, fontFamily: C.mono }}>{val}</div>
            <div style={{ fontSize: 11, fontWeight: 600, color: textColor, opacity: .7, letterSpacing: '.05em', textTransform: 'uppercase', fontFamily: C.sans }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Standard explainers */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {[
          ['AA — Minimum Standard', '4.5:1', 'Required for normal text. 3:1 for large text (18pt+ or 14pt bold). Required by most accessibility laws (ADA, AODA, EN 301 549).', '#059669'],
          ['AAA — Enhanced Standard', '7:1', 'Highest contrast level. Required for users with low vision. Recommended for body text in enterprise and government applications.', '#7C3AED'],
        ].map(([title, ratio, desc, color]) => (
          <div key={title} style={{ padding: '22px 24px', background: C.bg1, border: `1px solid ${C.b2}`, borderRadius: 8, display: 'flex', gap: 18, alignItems: 'flex-start' }}>
            <div style={{ width: 40, height: 40, borderRadius: 6, background: color + '18', border: `1px solid ${color}35`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ fontFamily: C.mono, fontSize: 10, fontWeight: 700, color }}>{ratio}</span>
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: C.t1, marginBottom: 5, fontFamily: C.sans }}>{title}</div>
              <div style={{ fontSize: 11, color: C.t3, lineHeight: 1.7, fontFamily: C.sans }}>{desc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Full pair grid */}
      <div>
        <div style={{ fontSize: 10, fontWeight: 600, color: C.t4, letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 20, fontFamily: C.sans }}>
          Color Pair Analysis
        </div>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }}>
            {[1,2,3,4,5,6].map(i => <Skeleton key={i} h={200} />)}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }}>
            {pairs.map(({ label, fg, fgHex, bgHex, ratio, aa, aaa, alt }) => (
              <div key={label} style={{ border: `1px solid ${C.b2}`, borderRadius: 6, background: C.bg1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                {/* Preview */}
                <div style={{ padding: '28px 24px 22px', background: bgHex, minHeight: 100, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <span style={{ fontSize: 22, fontWeight: 700, color: fgHex, lineHeight: 1, fontFamily: C.sans }}>Aa</span>
                  <span style={{ fontSize: 13, color: fgHex, opacity: .85, fontFamily: C.sans }}>The quick brown fox jumps</span>
                  <span style={{ fontSize: 11, color: fgHex, opacity: .65, fontFamily: C.sans }}>over the lazy dog 0123456</span>
                </div>
                {/* Pair + ratio */}
                <div style={{ padding: '16px 20px', borderBottom: `1px solid ${C.b2}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: C.t1, fontFamily: C.sans }}>{label}</div>
                  <div style={{ fontFamily: C.mono, fontSize: 20, fontWeight: 700, color: aa ? '#059669' : '#DC2626' }}>{ratio}:1</div>
                </div>
                {/* Colors */}
                <div style={{ padding: '12px 18px', borderBottom: `1px solid ${C.b2}`, display: 'flex', gap: 16 }}>
                  {[['Text', fgHex], ['Background', bgHex]].map(([lbl, hex]) => (
                    <div key={lbl} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                      <div style={{ width: 12, height: 12, borderRadius: 2, background: hex, border: '1px solid rgba(0,0,0,.1)', flexShrink: 0 }} />
                      <div>
                        <div style={{ fontSize: 9, color: C.t4, fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase', fontFamily: C.sans }}>{lbl}</div>
                        <div style={{ fontFamily: C.mono, fontSize: 10, color: C.t2 }}>{hex.toUpperCase()}</div>
                      </div>
                    </div>
                  ))}
                </div>
                {/* Badges */}
                <div style={{ padding: '14px 20px', display: 'flex', gap: 8 }}>
                  <Badge pass={aa}  label="AA" />
                  <Badge pass={aaa} label="AAA" />
                </div>
                {alt && onApplyFix && (
                  <SuggestedFix alt={alt} bgHex={bgHex} onApply={(hex) => onApplyFix(fg, hex)} />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
