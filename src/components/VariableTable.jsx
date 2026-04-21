import { useState, useRef } from "react";
import { C } from "../utils/theme";
import { PRIMITIVE_GROUPS, SEMANTIC_GROUPS } from "../utils/constants";

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

function GroupSection({ group, theme, editing, editVal, onStartEdit, onCommitEdit, onEditValChange, copied, onCopy, colorRefs }) {
  return (
    <div>
      <div style={{
        padding: '10px 18px', fontSize: 9, fontWeight: 700, color: C.t5,
        letterSpacing: '.12em', textTransform: 'uppercase', background: C.bg3,
        borderBottom: `1px solid ${C.b2}`, fontFamily: C.sans,
      }}>
        {group.name}
      </div>
      {group.vars.filter(v => theme[v.key]).map((v, i) => {
        const val = theme[v.key];
        const isEditing = editing === v.key;
        return (
          <div
            key={v.key}
            onMouseEnter={e => e.currentTarget.style.background = C.bg3}
            onMouseLeave={e => e.currentTarget.style.background = i % 2 ? C.bg2 : C.bg1}
            style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '10px 18px',
              background: i % 2 ? C.bg2 : C.bg1,
              borderBottom: `1px solid ${C.b1}`, transition: 'background .1s',
            }}
          >
            {/* Swatch */}
            {v.type === 'color' && (
              <div
                style={{ width: 20, height: 20, borderRadius: 4, background: val, border: '1px solid rgba(0,0,0,.1)', flexShrink: 0, cursor: 'pointer', position: 'relative' }}
                onClick={() => colorRefs.current[v.key]?.click()}
              >
                <input type="color" ref={el => colorRefs.current[v.key] = el} value={val}
                  onChange={e => onStartEdit(v.key, e.target.value, true)}
                  style={{ position: 'absolute', opacity: 0, width: 0, height: 0, pointerEvents: 'none' }} />
              </div>
            )}

            {/* Token name */}
            <span style={{ flex: 1, fontFamily: C.mono, fontSize: 11, color: C.t3, letterSpacing: '.01em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {v.key}
            </span>

            {/* Value / edit */}
            {isEditing ? (
              <input
                value={editVal}
                onChange={e => onEditValChange(e.target.value)}
                onBlur={() => onCommitEdit(v.key)}
                onKeyDown={e => e.key === 'Enter' && onCommitEdit(v.key)}
                autoFocus
                style={{
                  width: 86, background: C.bg4, border: `1px solid ${C.accent}`, borderRadius: 3,
                  padding: '3px 8px', fontFamily: C.mono, fontSize: 11, color: C.t1, letterSpacing: '.04em',
                }}
              />
            ) : (
              <span style={{ fontFamily: v.type === 'color' ? C.mono : C.sans, fontSize: 11, color: C.t1, letterSpacing: '.04em', textTransform: v.type === 'color' ? 'uppercase' : 'none', fontStyle: v.type === 'font' ? 'italic' : 'normal' }}>
                {val}
              </span>
            )}

            {/* Edit button */}
            {v.type === 'color' && (
              <button
                onClick={() => isEditing ? onCommitEdit(v.key) : onStartEdit(v.key, val)}
                style={{ background: 'none', border: 'none', color: isEditing ? C.accent : C.t5, fontSize: 13, padding: '0 2px', lineHeight: 1, transition: 'color .12s', flexShrink: 0, cursor: 'pointer' }}
              >
                {isEditing ? '✓' : '✎'}
              </button>
            )}

            {/* Copy */}
            <button
              onClick={() => onCopy(v.key, val)}
              style={{ background: 'none', border: 'none', color: copied === v.key ? '#10B981' : C.t5, fontSize: 11, padding: '0 2px', lineHeight: 1, transition: 'color .12s', flexShrink: 0, cursor: 'pointer' }}
              title="Copy value"
            >
              {copied === v.key ? '✓' : '⎘'}
            </button>
          </div>
        );
      })}
    </div>
  );
}

export default function VariableTable({ theme, activeMode, onEdit }) {
  const [editing, setEditing]   = useState(null);
  const [editVal, setEditVal]   = useState('');
  const [copied, setCopied]     = useState(null);
  const colorRefs               = useRef({});

  const startEdit = (key, val, fromPicker = false) => {
    if (fromPicker) {
      onEdit(key, val);
    } else {
      setEditing(key);
      setEditVal(val);
    }
  };

  const commitEdit = (key) => {
    if (/^#[0-9A-Fa-f]{6}$/.test(editVal)) onEdit(key, editVal);
    setEditing(null);
  };

  const copyVal = (key, val) => {
    copyToClipboard(val, () => { setCopied(key); setTimeout(() => setCopied(null), 1500); });
  };

  const sharedProps = { editing, editVal, onStartEdit: startEdit, onCommitEdit: commitEdit, onEditValChange: setEditVal, copied, onCopy: copyVal, colorRefs };

  return (
    <div style={{ borderRadius: 4, overflow: 'hidden', border: `1px solid ${C.b2}` }}>

      {/* ── PRIMITIVE section header ── */}
      <div style={{
        padding: '11px 18px', background: C.bg0, borderBottom: `1px solid ${C.b2}`,
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <div style={{ width: 3, height: 12, background: '#7C3AED', borderRadius: 2 }} />
        <span style={{ fontSize: 10, fontWeight: 700, color: '#7C3AED', letterSpacing: '.1em', textTransform: 'uppercase', fontFamily: C.sans }}>
          Primitive Tokens
        </span>
      </div>

      {PRIMITIVE_GROUPS.map(group => (
        <GroupSection key={group.name} group={group} theme={theme} {...sharedProps} />
      ))}

      {/* ── SEMANTIC section header ── */}
      <div style={{
        padding: '11px 18px', background: C.bg0, borderBottom: `1px solid ${C.b2}`,
        borderTop: `2px solid ${C.b2}`,
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <div style={{ width: 3, height: 12, background: C.accent, borderRadius: 2 }} />
        <span style={{ fontSize: 10, fontWeight: 700, color: C.accent, letterSpacing: '.1em', textTransform: 'uppercase', fontFamily: C.sans }}>
          Semantic Tokens
        </span>
        <span style={{ fontSize: 10, color: C.t4, fontFamily: C.sans, marginLeft: 4 }}>
          — {activeMode === 'light' ? 'Light' : 'Dark'} Mode
        </span>
      </div>

      {SEMANTIC_GROUPS.map(group => (
        <GroupSection key={group.name} group={group} theme={theme} {...sharedProps} />
      ))}
    </div>
  );
}
