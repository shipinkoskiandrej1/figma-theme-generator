import { useState, useRef } from "react";
import { Copy, Check } from "lucide-react";
import { GROUPS } from "../utils/constants";

function copyToClipboard(text, cb) {
  if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(text).then(cb).catch(() => fallback(text, cb));
  } else {
    fallback(text, cb);
  }
}

function fallback(text, cb) {
  const ta = Object.assign(document.createElement("textarea"), {
    value: text,
    style: "position:fixed;top:-9999px;opacity:0",
  });
  document.body.appendChild(ta);
  ta.focus();
  ta.select();
  try { document.execCommand("copy"); cb?.(); } catch {}
  document.body.removeChild(ta);
}

export default function VariableTable({ theme, onEdit }) {
  const [copied, setCopied] = useState(null);
  const colorRefs = useRef({});

  const copyVal = (key, val) => {
    copyToClipboard(val, () => {
      setCopied(key);
      setTimeout(() => setCopied(null), 1500);
    });
  };

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
      {GROUPS.map((group, gi) => (
        <div key={gi}>
          <div
            className={`px-4 py-2 text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-900/50 ${
              gi > 0 ? "border-t border-gray-200 dark:border-gray-800" : ""
            }`}
          >
            {group.name}
          </div>

          {group.vars.map((v, vi) => {
            const val = theme[v.key];
            if (!val) return null;
            return (
              <div
                key={vi}
                className="flex items-center gap-3 px-4 py-2.5 border-t border-gray-100 dark:border-gray-800"
              >
                {/* Token name + desc */}
                <div className="flex-1 min-w-0">
                  <div className="font-mono text-xs text-gray-800 dark:text-gray-200 truncate">
                    {v.key}
                  </div>
                  <div className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">{v.desc}</div>
                </div>

                {/* Value */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {v.type === "color" ? (
                    <>
                      {/* Clickable swatch opens native color picker */}
                      <div
                        className="w-6 h-6 rounded-md border border-gray-200 dark:border-gray-700 cursor-pointer hover:scale-110 transition-transform flex-shrink-0"
                        style={{ background: val }}
                        title="Click to edit"
                        onClick={() => colorRefs.current[v.key]?.click()}
                      />
                      <input
                        type="color"
                        ref={el => (colorRefs.current[v.key] = el)}
                        value={val}
                        onChange={e => onEdit(v.key, e.target.value)}
                        className="sr-only"
                      />
                      <span className="font-mono text-xs text-gray-600 dark:text-gray-400 w-[58px]">
                        {val}
                      </span>
                    </>
                  ) : (
                    <span className="text-xs italic text-gray-600 dark:text-gray-400">{val}</span>
                  )}
                </div>

                {/* Copy button */}
                <button
                  onClick={() => copyVal(v.key, val)}
                  className={`w-7 h-7 flex items-center justify-center rounded-lg border transition-colors flex-shrink-0 ${
                    copied === v.key
                      ? "border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-950/30"
                      : "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 hover:border-gray-300 dark:hover:border-gray-600"
                  }`}
                >
                  {copied === v.key ? (
                    <Check size={11} className="text-green-600 dark:text-green-400" />
                  ) : (
                    <Copy size={11} className="text-gray-400 dark:text-gray-500" />
                  )}
                </button>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
