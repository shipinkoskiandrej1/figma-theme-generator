import { C } from "../utils/theme";
import { contrastRatio, wcagLevel } from "../utils/colorUtils";
import { WCAG_PAIRS } from "../utils/constants";

function darken(hex, amt) {
  const r = Math.max(0, parseInt(hex.slice(1,3),16) - amt);
  const g = Math.max(0, parseInt(hex.slice(3,5),16) - amt);
  const b = Math.max(0, parseInt(hex.slice(5,7),16) - amt);
  return '#' + [r,g,b].map(v => v.toString(16).padStart(2,'0')).join('');
}

function Badge({ pass, label }) {
  return (
    <span style={{
      padding: '2px 6px', borderRadius: 3, fontSize: 9.5, fontWeight: 700, letterSpacing: '.06em',
      background: pass ? '#10B98116' : '#EF444416',
      color: pass ? '#10B981' : '#EF4444',
      border: `1px solid ${pass ? '#10B98130' : '#EF444430'}`,
      fontFamily: C.sans,
    }}>
      {label} {pass ? '✓' : '✗'}
    </span>
  );
}

export default function WcagChecker({ theme }) {
  const pairs = WCAG_PAIRS.filter(p => theme[p.fg] && theme[p.bg]).map(p => {
    const ratio = contrastRatio(theme[p.fg], theme[p.bg]);
    const ratioRounded = Math.round(ratio * 10) / 10;
    const aa = ratio >= 4.5;
    const aaa = ratio >= 7;
    const alt = !aa ? darken(theme[p.fg], 40) : null;
    return { ...p, fgHex: theme[p.fg], bgHex: theme[p.bg], ratio: ratioRounded, aa, aaa, alt };
  });

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
      {pairs.map(({ label, fgHex, bgHex, ratio, aa, aaa, alt }) => (
        <div key={label} style={{
          border: `1px solid ${C.b2}`, borderRadius: 5, background: C.bg1,
          overflow: 'hidden', display: 'flex', flexDirection: 'column',
        }}>
          {/* Live text preview */}
          <div style={{ padding: '11px 12px', background: bgHex, borderBottom: `1px solid ${C.b2}`, minHeight: 48, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 15, fontWeight: 600, color: fgHex }}>Aa</span>
            <span style={{ fontSize: 11, color: fgHex, opacity: .75 }}>Sample text</span>
          </div>

          {/* Color pair labels */}
          <div style={{ padding: '10px 14px', borderBottom: `1px solid ${C.b2}`, display: 'flex', gap: 12 }}>
            {[['Text', fgHex], ['Background', bgHex]].map(([lbl, hex]) => (
              <div key={lbl} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <div style={{ width: 10, height: 10, borderRadius: 2, background: hex, border: '1px solid rgba(0,0,0,.08)', flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: 8.5, color: C.t4, fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase', fontFamily: C.sans }}>{lbl}</div>
                  <div style={{ fontFamily: C.mono, fontSize: 9.5, color: C.t2 }}>{hex.toUpperCase()}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Ratio + badges */}
          <div style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 9, color: C.t4, fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 4, fontFamily: C.sans }}>{label}</div>
              <div style={{ fontFamily: C.mono, fontSize: 18, fontWeight: 700, color: C.t1, lineHeight: 1 }}>{ratio}:1</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-end' }}>
              <Badge pass={aa} label="AA" />
              <Badge pass={aaa} label="AAA" />
            </div>
          </div>

          {/* Fix suggestion */}
          {alt && (
            <div style={{ padding: '8px 14px', background: '#FEF9EC', borderTop: '1px solid #FDE68A', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 10, color: '#92400E', flex: 1, fontFamily: C.sans }}>💡 Try</span>
              <div style={{ width: 14, height: 14, borderRadius: 2, background: alt, border: '1px solid rgba(0,0,0,.1)', flexShrink: 0 }} />
              <span style={{ fontFamily: C.mono, fontSize: 9.5, color: '#92400E' }}>{alt}</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
