import { C } from "../utils/theme";

export function PanelHeader({ title, badge }) {
  return (
    <div style={{
      padding: '11px 16px', borderBottom: `1px solid ${C.b2}`,
      background: C.bg2, display: 'flex', alignItems: 'center', gap: 8,
    }}>
      <div style={{ width: 2, height: 11, background: C.accent, borderRadius: 2, flexShrink: 0 }} />
      <span style={{ fontSize: 10, fontWeight: 600, color: C.t4, letterSpacing: '.1em', textTransform: 'uppercase', flex: 1, fontFamily: C.sans }}>
        {title}
      </span>
      {badge && (
        <span style={{ fontSize: 9, padding: '2px 6px', background: C.accentBg, color: C.accentText, border: `1px solid ${C.accentBorder}`, borderRadius: 3, fontWeight: 600, letterSpacing: '.06em', fontFamily: C.sans }}>
          {badge}
        </span>
      )}
    </div>
  );
}

export default function Panel({ title, badge, children, style }) {
  return (
    <div style={{ border: `1px solid ${C.b2}`, borderRadius: 4, background: C.bg1, ...style }}>
      <PanelHeader title={title} badge={badge} />
      <div style={{ padding: 20, overflow: 'auto', borderRadius: '0 0 4px 4px' }}>
        {children}
      </div>
    </div>
  );
}
