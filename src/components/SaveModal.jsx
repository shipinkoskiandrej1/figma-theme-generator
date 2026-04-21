import { useState } from "react";
import { C } from "../utils/theme";

export default function SaveModal({ onSave, onCancel, saving }) {
  const [name, setName] = useState("");

  const submit = () => {
    if (name.trim()) onSave(name.trim());
  };

  return (
    <div
      onClick={e => e.target === e.currentTarget && onCancel()}
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(12,18,33,.45)', backdropFilter: 'blur(3px)',
      }}
    >
      <div style={{
        background: C.bg1, border: `1px solid ${C.b2}`, borderRadius: 6,
        padding: 24, width: 320, boxShadow: '0 8px 32px rgba(12,18,33,.12)',
        display: 'flex', flexDirection: 'column', gap: 16,
      }}>
        {/* Title */}
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: C.t1, marginBottom: 3, fontFamily: C.sans }}>
            Save to Dashboard
          </div>
          <div style={{ fontSize: 11, color: C.t4, lineHeight: 1.5, fontFamily: C.sans }}>
            Give this client a name to find the theme later.
          </div>
        </div>

        {/* Input */}
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && submit()}
          placeholder="Client name"
          autoFocus
          style={{
            height: 34, padding: '0 10px', background: C.bg3,
            border: `1px solid ${C.b3}`, borderRadius: 4,
            color: C.t1, fontSize: 12, fontFamily: C.sans, outline: 'none',
            transition: 'border-color .15s',
          }}
          onFocus={e => e.target.style.borderColor = C.accent}
          onBlur={e => e.target.style.borderColor = C.b3}
        />

        {/* Actions */}
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1, height: 32, background: 'transparent',
              border: `1px solid ${C.b3}`, borderRadius: 4,
              color: C.t3, fontSize: 11, fontWeight: 500, fontFamily: C.sans,
              cursor: 'pointer', transition: 'border-color .15s',
            }}
            onMouseEnter={e => e.target.style.borderColor = C.b4}
            onMouseLeave={e => e.target.style.borderColor = C.b3}
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={!name.trim() || saving}
            style={{
              flex: 1, height: 32,
              background: !name.trim() || saving ? C.b3 : C.accent,
              border: 'none', borderRadius: 4,
              color: '#fff', fontSize: 11, fontWeight: 600, fontFamily: C.sans,
              cursor: !name.trim() || saving ? 'not-allowed' : 'pointer',
              transition: 'background .15s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}
          >
            {saving
              ? <><span style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>⟳</span> Saving…</>
              : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}
