import { C } from "../utils/theme";

export default function ProportionBar({ primary, secondary, tertiary }) {
  const segments = [[primary, 60], [secondary, 30], [tertiary, 10]];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Visual bar */}
      <div style={{ height: 36, display: 'flex', borderRadius: 3, overflow: 'hidden', border: `1px solid ${C.b2}` }}>
        {segments.map(([color, pct]) => (
          <div key={color + pct} style={{
            width: `${pct}%`, background: color,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 10.5, fontWeight: 600, color: 'rgba(255,255,255,.85)',
            letterSpacing: '.03em', transition: 'background .3s',
            fontFamily: C.sans,
          }}>
            {pct >= 20 ? `${pct}%` : ''}
          </div>
        ))}
      </div>

      {/* Stat cells */}
      <div style={{ display: 'flex', gap: 0, border: `1px solid ${C.b2}`, borderRadius: 3, overflow: 'hidden' }}>
        {[['Primary', '60%', primary], ['Secondary', '30%', secondary], ['Tertiary', '10%', tertiary]].map(([label, pct, color], i) => (
          <div key={label} style={{
            flex: 1, padding: '10px 12px',
            borderRight: i < 2 ? `1px solid ${C.b2}` : 'none',
            background: C.bg2,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <div style={{ width: 8, height: 8, borderRadius: 2, background: color, transition: 'background .3s' }} />
              <span style={{ fontSize: 10, fontWeight: 600, color: C.t4, letterSpacing: '.06em', textTransform: 'uppercase', fontFamily: C.sans }}>{label}</span>
            </div>
            <div style={{ fontFamily: C.mono, fontSize: 12, color: C.t1 }}>{pct}</div>
            <div style={{ fontFamily: C.mono, fontSize: 9.5, color: C.t4, marginTop: 2, textTransform: 'uppercase' }}>{color}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
