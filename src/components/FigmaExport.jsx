import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { C } from "../utils/theme";
import { buildFigmaScript, buildTokenStudioJSON } from "../utils/exportUtils";

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

export default function FigmaExport({ theme, collectionName, onCollectionNameChange }) {
  const [copied, setCopied] = useState(null);
  const [showInstructions, setShowInstructions] = useState(false);

  const script = buildFigmaScript(theme, collectionName);
  const json   = buildTokenStudioJSON(theme);

  const copy = (key, text) => {
    copyToClipboard(text, () => { setCopied(key); setTimeout(() => setCopied(null), 2200); });
  };

  const inputStyle = {
    padding: '8px 12px', background: C.bg3, border: `1px solid ${C.b3}`,
    borderRadius: 4, color: C.t1, fontSize: 12, fontFamily: C.sans, width: '100%',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Collection name */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ fontSize: 10, fontWeight: 600, color: C.t4, letterSpacing: '.08em', textTransform: 'uppercase', fontFamily: C.sans }}>Semantic Collection Name</div>
        <input value={collectionName} onChange={e => onCollectionNameChange(e.target.value)} style={inputStyle} />
        <div style={{ fontSize: 10, color: C.t5, fontFamily: C.sans, lineHeight: 1.5 }}>
          This is the name for the semantic token collection in Figma. Primitives are always saved to a "Primitives" collection.
        </div>
      </div>

      {/* Export cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        {[
          ['Figma Console Script', script, 'Plugins → Development → Open Console — creates "Primitives" + semantic collections with Light / Dark modes'],
          ['Token Studio JSON', json, 'Token Studio → New token set → Load from JSON — includes global, light, and dark sets'],
        ].map(([title, code, hint]) => (
          <div key={title} style={{ padding: 22, background: C.bg1, border: `1px solid ${C.b2}`, borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: C.t2, marginBottom: 4, fontFamily: C.sans }}>{title}</div>
              <div style={{ fontSize: 10, color: C.t4, lineHeight: 1.6, fontFamily: C.sans }}>{hint}</div>
            </div>
            <pre style={{
              fontFamily: C.mono, fontSize: 9.5, color: C.t3, background: C.bg3,
              padding: 12, borderRadius: 4, lineHeight: 1.75, overflowX: 'auto',
              whiteSpace: 'pre', maxHeight: 150, overflowY: 'auto', margin: 0,
            }}>
              {code.slice(0, 600)}{code.length > 600 ? '\n  …' : ''}
            </pre>
            <button
              onClick={() => copy(title, code)}
              style={{
                padding: '9px', fontWeight: 500, fontFamily: C.sans,
                border: 'none', borderRadius: 6, cursor: 'pointer', transition: 'all .2s',
                background: copied === title ? '#F0FDF4' : C.t1,
                color: copied === title ? '#10B981' : '#fff',
                fontSize: 12,
              }}
            >
              {copied === title ? '✓ Copied!' : 'Copy'}
            </button>
          </div>
        ))}
      </div>

      {/* Instructions toggle */}
      <button
        onClick={() => setShowInstructions(v => !v)}
        style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontSize: 11, color: C.t3, fontFamily: C.sans }}
      >
        {showInstructions ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
        How to use these exports
      </button>

      {showInstructions && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[
            {
              label: 'Figma Console Script',
              steps: [
                'In Figma, go to Plugins → Development → Open Console',
                'Paste the full script and press Enter',
                'Creates a "Primitives" collection with your brand + neutral palette',
                'Creates a "' + collectionName + '" collection with Light and Dark modes',
                'Semantic tokens get values for both modes simultaneously',
              ]
            },
            {
              label: 'Token Studio JSON',
              steps: [
                'Install Token Studio from the Figma Community',
                'Open Token Studio → New token set',
                'Click "…" menu → Load from JSON and paste',
                'You\'ll get "global" (primitives), "light", and "dark" token sets',
                'Enable sets and apply to sync as Figma Variables',
              ]
            },
          ].map((block, i) => (
            <div key={i} style={{ background: C.bg3, borderRadius: 8, padding: '12px 16px' }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: C.t2, marginBottom: 8, fontFamily: C.sans }}>{block.label}</div>
              {block.steps.map((s, j) => (
                <div key={j} style={{ display: 'flex', gap: 8, marginBottom: 5 }}>
                  <span style={{ fontSize: 10, color: C.t4, minWidth: 14, paddingTop: 1, fontFamily: C.sans }}>{j+1}.</span>
                  <span style={{ fontSize: 11, color: C.t3, lineHeight: 1.6, fontFamily: C.sans }}>{s}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
