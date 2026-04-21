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
    padding: '7px 10px', background: C.bg3, border: `1px solid ${C.b3}`,
    borderRadius: 4, color: C.t1, fontSize: 12, fontFamily: C.sans, width: '100%',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Collection name */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        <div style={{ fontSize: 10, fontWeight: 600, color: C.t4, letterSpacing: '.08em', textTransform: 'uppercase', fontFamily: C.sans }}>Collection Name</div>
        <input value={collectionName} onChange={e => onCollectionNameChange(e.target.value)} style={inputStyle} />
      </div>

      {/* Export options */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {[
          ['Console Script', script, 'Paste in Figma → Plugins → Development → Console'],
          ['Token Studio JSON', json, 'Load via Token Studio plugin → New token set → Load from JSON'],
        ].map(([title, code, hint]) => (
          <div key={title} style={{ padding: 14, background: C.bg2, border: `1px solid ${C.b2}`, borderRadius: 4, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: C.t2, marginBottom: 3, fontFamily: C.sans }}>{title}</div>
              <div style={{ fontSize: 10, color: C.t4, lineHeight: 1.5, fontFamily: C.sans }}>{hint}</div>
            </div>
            <pre style={{
              fontFamily: C.mono, fontSize: 9.5, color: C.t3, background: C.bg3,
              padding: 10, borderRadius: 3, lineHeight: 1.75, overflowX: 'auto',
              whiteSpace: 'pre', maxHeight: 140, overflowY: 'auto', margin: 0,
            }}>
              {code.slice(0, 500)}{code.length > 500 ? '\n  …' : ''}
            </pre>
            <button
              onClick={() => copy(title, code)}
              style={{
                padding: '7px', background: 'transparent', fontWeight: 500, fontFamily: C.sans,
                border: `1px solid ${copied === title ? '#10B98160' : C.b3}`, borderRadius: 3,
                color: copied === title ? '#10B981' : C.t2, fontSize: 11, transition: 'all .2s', cursor: 'pointer',
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
        style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontSize: 11, color: C.t4, fontFamily: C.sans }}
      >
        {showInstructions ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
        How to use these exports
      </button>

      {showInstructions && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            { label: 'Console script', steps: ['In Figma, go to Plugins → Development → Open console', 'Paste the script and press Enter', 'Variables appear instantly in your Local Variables panel'] },
            { label: 'Token Studio JSON', steps: ['Install Token Studio from the Figma Community', 'Open Token Studio → New token set', 'Click "…" menu → Load from JSON and paste', 'Apply tokens to sync as Figma Variables'] },
          ].map((block, i) => (
            <div key={i} style={{ background: C.bg3, borderRadius: 4, padding: '10px 12px' }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: C.t2, marginBottom: 6, fontFamily: C.sans }}>{block.label}</div>
              {block.steps.map((s, j) => (
                <div key={j} style={{ display: 'flex', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 10, color: C.t4, minWidth: 14, paddingTop: 1, fontFamily: C.sans }}>{j+1}.</span>
                  <span style={{ fontSize: 11, color: C.t3, lineHeight: 1.5, fontFamily: C.sans }}>{s}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
