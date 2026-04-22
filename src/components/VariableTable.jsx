import { useState, useRef } from "react";
import {
  Pencil, Check, Copy,
  Lock, Palette, CircleDashed,
  LayoutTemplate, Type, SquareDashed, MousePointerClick, Link2, Sparkles,
  Layers, Cpu,
} from "lucide-react";
import { C } from "../utils/theme";
import { PRIMITIVE_GROUPS, SEMANTIC_GROUPS } from "../utils/constants";

// Map group names → lucide icon component
const GROUP_ICONS = {
  "Fixed Colors":       Lock,
  "Brand Primitives":   Palette,
  "Neutral Scale":      CircleDashed,
  "Background":         LayoutTemplate,
  "Text":               Type,
  "Border":             SquareDashed,
  "Action / Primary":   MousePointerClick,
  "Action / Secondary": MousePointerClick,
  "Link":               Link2,
  "Typography":         Sparkles,
};

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

function GroupSection({ group, theme, editing, editVal, onStartEdit, onCommitEdit, onEditValChange, copied, onCopy, colorRefs, isMobile }) {
  const Icon = GROUP_ICONS[group.name] || Palette;

  return (
    <div>
      {/* Group sub-header */}
      <div style={{
        padding: '10px 22px',
        background: C.bg3,
        borderBottom: `1px solid ${C.b2}`,
        display: 'flex', alignItems: 'center', gap: 7,
      }}>
        <Icon size={11} strokeWidth={2} color={C.t4} style={{ flexShrink: 0 }} />
        <span style={{
          fontSize: 9, fontWeight: 700, color: C.t4,
          letterSpacing: '.12em', textTransform: 'uppercase', fontFamily: C.sans,
        }}>
          {group.name}
        </span>
      </div>

      {group.vars.filter(v => theme[v.key]).map((v, i) => {
        const val = theme[v.key];
        const isEditing = editing === v.key;
        const isFixed = v.key.startsWith('color/palette/fixed/');
        const isFont = v.type === 'font';

        return (
          <div
            key={v.key}
            onMouseEnter={e => { if (!isFixed) e.currentTarget.style.background = C.bg3; }}
            onMouseLeave={e => e.currentTarget.style.background = i % 2 ? C.bg2 : C.bg1}
            style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: isMobile ? '11px 14px' : '12px 22px',
              background: i % 2 ? C.bg2 : C.bg1,
              borderBottom: `1px solid ${C.b1}`, transition: 'background .1s',
              opacity: isFixed ? 0.65 : 1,
            }}
          >
            {/* Color swatch or font badge */}
            {v.type === 'color' ? (
              <div
                style={{
                  width: 22, height: 22, borderRadius: 5,
                  background: val, border: '1px solid rgba(0,0,0,.12)',
                  flexShrink: 0, cursor: isFixed ? 'default' : 'pointer',
                  position: 'relative',
                  boxShadow: '0 1px 3px rgba(0,0,0,.1)',
                }}
                onClick={() => !isFixed && colorRefs.current[v.key]?.click()}
              >
                {!isFixed && (
                  <input type="color" ref={el => colorRefs.current[v.key] = el} value={val}
                    onChange={e => onStartEdit(v.key, e.target.value, true)}
                    style={{ position: 'absolute', opacity: 0, width: 0, height: 0, pointerEvents: 'none' }} />
                )}
              </div>
            ) : (
              /* Font type badge */
              <div style={{
                width: 22, height: 22, borderRadius: 5,
                background: C.bg4, border: `1px solid ${C.b3}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <Type size={11} strokeWidth={2} color={C.t3} />
              </div>
            )}

            {/* Token name */}
            <span style={{
              flex: 1, fontFamily: C.mono, fontSize: isMobile ? 10 : 11, color: C.t3,
              letterSpacing: '.01em', whiteSpace: 'nowrap',
              overflow: 'hidden', textOverflow: 'ellipsis',
            }}>
              {v.key}
            </span>

            {/* Value / edit input */}
            {isEditing ? (
              <input
                value={editVal}
                onChange={e => onEditValChange(e.target.value)}
                onBlur={() => onCommitEdit(v.key)}
                onKeyDown={e => {
                  if (e.key === 'Enter') onCommitEdit(v.key);
                  if (e.key === 'Escape') { onCommitEdit.__skip = true; onCommitEdit(v.key); }
                }}
                autoFocus
                style={{
                  width: isFont ? 160 : 90,
                  background: C.bg4, border: `1px solid ${C.b3}`, borderRadius: 4,
                  padding: '3px 8px',
                  fontFamily: isFont ? C.sans : C.mono,
                  fontSize: 11, color: C.t1,
                  letterSpacing: isFont ? 'normal' : '.04em',
                }}
              />
            ) : (
              <span style={{
                fontFamily: v.type === 'color' ? C.mono : C.sans,
                fontSize: 11, color: C.t1,
                letterSpacing: v.type === 'color' ? '.04em' : 'normal',
                textTransform: v.type === 'color' ? 'uppercase' : 'none',
                fontStyle: isFont ? 'italic' : 'normal',
              }}>
                {val}
              </span>
            )}

            {/* Fixed badge */}
            {isFixed && (
              <span style={{
                fontSize: 8.5, color: C.t5, fontFamily: C.sans,
                letterSpacing: '.08em', textTransform: 'uppercase',
                background: C.bg3, border: `1px solid ${C.b2}`,
                padding: '2px 6px', borderRadius: 3,
              }}>
                fixed
              </span>
            )}

            {/* Edit button */}
            {((v.type === 'color' && !isFixed) || isFont) && (
              <button
                onClick={() => isEditing ? onCommitEdit(v.key) : onStartEdit(v.key, val)}
                title={isEditing ? 'Confirm' : 'Edit'}
                style={{
                  width: 24, height: 24,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'none', border: 'none',
                  color: isEditing ? C.t1 : C.t5,
                  borderRadius: 4, cursor: 'pointer',
                  transition: 'color .12s, background .12s',
                  flexShrink: 0,
                }}
                onMouseEnter={e => { e.currentTarget.style.background = C.bg3; e.currentTarget.style.color = C.t2; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = isEditing ? C.t1 : C.t5; }}
              >
                {isEditing
                  ? <Check size={12} strokeWidth={2.5} />
                  : <Pencil size={11} strokeWidth={1.75} />
                }
              </button>
            )}

            {/* Copy button */}
            <button
              onClick={() => onCopy(v.key, val)}
              title="Copy value"
              style={{
                width: 24, height: 24,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'none', border: 'none',
                color: copied === v.key ? '#10B981' : C.t5,
                borderRadius: 4, cursor: 'pointer',
                transition: 'color .12s, background .12s',
                flexShrink: 0,
              }}
              onMouseEnter={e => { e.currentTarget.style.background = C.bg3; if (copied !== v.key) e.currentTarget.style.color = C.t2; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = copied === v.key ? '#10B981' : C.t5; }}
            >
              {copied === v.key
                ? <Check size={12} strokeWidth={2.5} />
                : <Copy size={11} strokeWidth={1.75} />
              }
            </button>
          </div>
        );
      })}
    </div>
  );
}

export default function VariableTable({ theme, activeMode, onEdit, isMobile }) {
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
    const isFont = key.startsWith('font/');
    if (isFont ? editVal.trim() : /^#[0-9A-Fa-f]{6}$/.test(editVal)) {
      onEdit(key, isFont ? editVal.trim() : editVal);
    }
    setEditing(null);
  };

  const copyVal = (key, val) => {
    copyToClipboard(val, () => { setCopied(key); setTimeout(() => setCopied(null), 1500); });
  };

  const sharedProps = { editing, editVal, onStartEdit: startEdit, onCommitEdit: commitEdit, onEditValChange: setEditVal, copied, onCopy: copyVal, colorRefs, isMobile };

  return (
    <div style={{ borderRadius: 8, overflow: 'hidden', border: `1px solid ${C.b2}`, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>

      {/* ── PRIMITIVE section header ── */}
      <div style={{
        padding: '15px 22px', background: C.bg1, borderBottom: `1px solid ${C.b2}`,
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <Layers size={13} strokeWidth={1.75} color={C.t1} />
        <span style={{ fontSize: 10, fontWeight: 700, color: C.t2, letterSpacing: '.1em', textTransform: 'uppercase', fontFamily: C.sans }}>
          Primitive Tokens
        </span>
      </div>

      {PRIMITIVE_GROUPS.map(group => (
        <GroupSection key={group.name} group={group} theme={theme} {...sharedProps} />
      ))}

      {/* ── SEMANTIC section header ── */}
      <div style={{
        padding: '15px 22px', background: C.bg1, borderBottom: `1px solid ${C.b2}`,
        borderTop: `2px solid ${C.b2}`,
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <Cpu size={13} strokeWidth={1.75} color={C.t2} />
        <span style={{ fontSize: 10, fontWeight: 700, color: C.t2, letterSpacing: '.1em', textTransform: 'uppercase', fontFamily: C.sans }}>
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
