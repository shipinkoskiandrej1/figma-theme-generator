import { C } from "../utils/theme";
import { contrastRatio } from "../utils/colorUtils";
import { WCAG_PAIRS } from "../utils/constants";

export default function WcagChecker({ theme, onViewFull }) {
  const pairs = WCAG_PAIRS.filter(p => theme[p.fg] && theme[p.bg]).map(p => {
    const ratio = contrastRatio(theme[p.fg], theme[p.bg]);
    return { aa: ratio >= 4.5, aaa: ratio >= 7 };
  });

  const total  = pairs.length;
  const passAA  = pairs.filter(p => p.aa).length;
  const passAAA = pairs.filter(p => p.aaa).length;

  const scoreColor = (pass, tot) => pass === tot ? '#059669' : pass >= tot * 0.7 ? '#D97706' : '#DC2626';

  return (
    <div style={{
      background: C.bg1, border: `1px solid ${C.b2}`, borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        padding: '20px 24px', borderBottom: `1px solid ${C.b2}`,
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <div style={{ width: 3, height: 14, background: C.t1, borderRadius: 2, flexShrink: 0 }} />
        <span style={{ fontSize: 10, fontWeight: 700, color: C.t3, letterSpacing: '.1em', textTransform: 'uppercase', fontFamily: C.sans }}>
          WCAG Summary
        </span>
      </div>

      {/* Score cards */}
      <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* AA */}
        <div style={{
          padding: '20px 24px', borderRadius: 6,
          background: '#F0FDF4', border: '1px solid #BBF7D0',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: '#15803D', fontFamily: C.sans }}>AA Compliance</span>
          <span style={{ fontSize: 24, fontWeight: 700, color: scoreColor(passAA, total), fontFamily: C.mono }}>
            {passAA}/{total}
          </span>
        </div>

        {/* AAA */}
        <div style={{
          padding: '20px 24px', borderRadius: 6,
          background: '#F5F3FF', border: '1px solid #DDD6FE',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: '#6D28D9', fontFamily: C.sans }}>AAA Compliance</span>
          <span style={{ fontSize: 24, fontWeight: 700, color: '#7C3AED', fontFamily: C.mono }}>
            {passAAA}/{total}
          </span>
        </div>

        {/* View full button */}
        <button
          onClick={onViewFull}
          style={{
            marginTop: 6, width: '100%', padding: '14px 0',
            background: 'transparent', border: `1px solid ${C.b3}`,
            borderRadius: 6, fontSize: 12, fontWeight: 500, fontFamily: C.sans,
            color: C.t3, cursor: 'pointer', transition: 'all .15s',
            letterSpacing: '.01em',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = C.t2; e.currentTarget.style.color = C.t1; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = C.b3; e.currentTarget.style.color = C.t3; }}
        >
          View Full Analysis →
        </button>
      </div>
    </div>
  );
}
