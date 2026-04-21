import { LayoutGrid } from "lucide-react";
import { C } from "../utils/theme";

const TABS = ['Variables', 'Accessibility', 'Preview', 'Export'];

export default function Header({ activeTab, onTabChange, generated, view, onViewChange, companyName, companyLogo, aiStatus, loading }) {
  return (
    <header style={{
      height: 56, borderBottom: `1px solid ${C.b2}`, background: C.bg1,
      display: 'flex', alignItems: 'center', padding: '0 18px', gap: 12,
      flexShrink: 0, zIndex: 50, position: 'relative',
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
        {companyLogo
          ? <img src={companyLogo} alt="" style={{ height: 22, width: 'auto', display: 'block' }} />
          : <div style={{ width: 22, height: 22, borderRadius: 5, background: C.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ color: '#fff', fontSize: 11, fontWeight: 700 }}>FT</span>
            </div>
        }
        <div style={{ width: 1, height: 16, background: C.b3 }} />
        <span style={{ fontSize: 11, color: C.t2, letterSpacing: '.04em', fontWeight: 500, fontFamily: C.sans }}>
          {companyName || 'Theme Generator'}
        </span>
      </div>

      <div style={{ width: 1, height: 16, background: C.b3, marginLeft: 4 }} />

      {/* Content tabs */}
      <div style={{ display: 'flex', gap: 0 }}>
        {TABS.map(tab => {
          const active = activeTab === tab && view === 'generator' && generated;
          const clickable = generated && view === 'generator';
          return (
            <div
              key={tab}
              onClick={() => { if (clickable) onTabChange(tab); if (view !== 'generator') onViewChange('generator'); }}
              style={{
                padding: '0 12px', height: 56, display: 'flex', alignItems: 'center',
                fontSize: 12, fontWeight: 500, letterSpacing: '.01em', fontFamily: C.sans,
                cursor: generated ? 'pointer' : 'default',
                color: active ? C.t1 : generated ? C.t3 : C.t5,
                borderBottom: active ? `2px solid ${C.accent}` : '2px solid transparent',
                transition: 'color .15s, border-color .15s',
                marginBottom: -1, userSelect: 'none',
              }}
            >
              {tab}
            </div>
          );
        })}
      </div>

      {/* Right side */}
      <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
        {aiStatus && (
          <div style={{ fontSize: 10, color: '#10B981', fontFamily: C.mono, letterSpacing: '.02em', animation: 'fadeIn .3s ease', maxWidth: 220, textAlign: 'right', lineHeight: 1.4 }}>
            {aiStatus}
          </div>
        )}

        {/* Dashboard button */}
        <button
          onClick={() => onViewChange(view === 'dashboard' ? 'generator' : 'dashboard')}
          style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '5px 10px', height: 30,
            background: view === 'dashboard' ? C.accent : 'transparent',
            border: `1px solid ${view === 'dashboard' ? C.accent : C.b3}`,
            borderRadius: 4, fontSize: 11, fontWeight: 500, fontFamily: C.sans,
            color: view === 'dashboard' ? '#fff' : C.t3, transition: 'all .15s',
          }}
        >
          <LayoutGrid size={11} />
          Dashboard
        </button>

        <span style={{ fontFamily: C.mono, fontSize: 10, color: C.t5 }}>v1.0</span>
      </div>
    </header>
  );
}
