import { useState, useRef } from "react";
import { C } from "../utils/theme";
import { GROUPS } from "../utils/constants";

function copyToClipboard(text, cb) {
  if (navigator.clipboard?.writeText) navigator.clipboard.writeText(text).then(cb).catch(() => fallback(text, cb));
  else fallback(text, cb);
}
function fallback(text, cb) {
  const ta = Object.assign(document.createElement("textarea"), { value: text, style: "position:fixed;top:-9999px;opacity:0" });
  document.body.appendChild(ta); ta.focus(); ta.select();
  try { document.execCommand("copy"); cb?.(); } catch {}
  document.body.removeChild(ta);
}

export default function VariableTable({ theme, onEdit }) {
  const [editing, setEditing] = useState(null);
  const [editVal, setEditVal] = useState('');
  const [copied, setCopied] = useState(null);
  const colorRefs = useRef({});

  const startEdit = (key, val) => { setEditing(key); setEditVal(val); };
  const commitEdit = (key) => {
    if (/^#[0-9A-Fa-f]{6}$/.test(editVal)) onEdit(key, editVal);
    setEditing(null);
  };

  const copyVal = (key, val) => {
    copyToClipboard(val, () => { setCopied(key); setTimeout(() => setCopied(null), 1500); });
  };

  const colorVars = GROUPS.flatMap(g => g.vars).filter(v => v.type === 'color' && theme[v.key]);
  const rowCount = colorVars.length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', borderRadius: 3, overflow: 'hidden', border: `1px solid ${C.b2}` }}>
      {GROUPS.map((group) => {
        const rows = group.vars.filter(v => theme[v.key]);
        if (!rows.length) return null;
        return (
          <div key={group.name}>
            {/* Group header */}
            <div style={{
              padding: '9px 14px', fontSize: 9, fontWeight: 600, color: C.t5,
              letterSpacing: '.12em', textTransform: 'uppercase', background: C.bg3,
              borderBottom: `1px solid ${C.b2}`, fontFamily: C.sans,
            }}>
              {group.name}
            </div>

            {rows.map((v, i) => {
              const val = theme[v.key];
              const isEditing = editing === v.key;
              return (
                <div
                  key={v.key}
                  onMouseEnter={e => e.currentTarget.style.background = C.bg3}
                  onMouseLeave={e => e.currentTarget.style.background = i % 2 ? C.bg2 : C.bg1}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10, padding: '7px 12px',
                    background: i % 2 ? C.bg2 : C.bg1,
                    borderBottom: `1px solid ${C.b1}`, transition: 'background .1s',
                  }}
                >
                  {/* Swatch */}
                  {v.type === 'color' && (
                    <div
                      style={{ width: 16, height: 16, borderRadius: 3, background: val, border: '1px solid rgba(0,0,0,.1)', flexShrink: 0, cursor: 'pointer' }}
                      onClick={() => colorRefs.current[v.key]?.click()}
                    >
                      <input type="color" ref={el => colorRefs.current[v.key] = el} value={val}
                        onChange={e => onEdit(v.key, e.target.value)}
                        style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }} />
                    </div>
                  )}

                  {/* Token name */}
                  <span style={{ flex: 1, fontFamily: C.mono, fontSize: 10.5, color: C.t3, letterSpacing: '.01em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {v.key}
                  </span>

                  {/* Value / edit input */}
                  {isEditing ? (
                    <input
                      value={editVal}
                      onChange={e => setEditVal(e.target.value)}
                      onBlur={() => commitEdit(v.key)}
                      onKeyDown={e => e.key === 'Enter' && commitEdit(v.key)}
                      autoFocus
                      style={{
                        width: 80, background: C.bg4, border: `1px solid ${C.accent}`, borderRadius: 3,
                        padding: '2px 6px', fontFamily: C.mono, fontSize: 10.5, color: C.t1, letterSpacing: '.04em',
                      }}
                    />
                  ) : (
                    <span style={{ fontFamily: C.mono, fontSize: 10.5, color: C.t1, letterSpacing: '.04em', textTransform: 'uppercase' }}>
                      {v.type === 'color' ? val : <em style={{ fontFamily: C.sans, fontStyle: 'italic', fontSize: 11, color: C.t2 }}>{val}</em>}
                    </span>
                  )}

                  {/* Edit button */}
                  {v.type === 'color' && (
                    <button
                      onClick={() => isEditing ? commitEdit(v.key) : startEdit(v.key, val)}
                      style={{
                        background: 'none', border: 'none', color: isEditing ? C.accent : C.t5,
                        fontSize: 12, padding: '0 2px', lineHeight: 1, transition: 'color .12s', flexShrink: 0,
                      }}
                    >
                      {isEditing ? '✓' : '✎'}
                    </button>
                  )}

                  {/* Copy button */}
                  <button
                    onClick={() => copyVal(v.key, val)}
                    style={{
                      background: 'none', border: 'none', color: copied === v.key ? '#10B981' : C.t5,
                      fontSize: 10, padding: '0 2px', lineHeight: 1, transition: 'color .12s', flexShrink: 0,
                    }}
                    title="Copy value"
                  >
                    {copied === v.key ? '✓' : '⎘'}
                  </button>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
