import { useState } from "react";
import { LayoutGrid, Copy, Check, ChevronDown, ChevronUp } from "lucide-react";
import { buildFigmaScript, buildTokenStudioJSON } from "../utils/exportUtils";

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

const INSTRUCTIONS = [
  {
    label: "Console script",
    steps: [
      "In Figma, go to Plugins → Development → Open console",
      "Paste the script and press Enter",
      "Variables appear instantly in your Local Variables panel",
    ],
  },
  {
    label: "Token Studio JSON",
    steps: [
      "Install Token Studio from the Figma Community",
      "Open Token Studio → New token set",
      'Click "…" menu → Load from JSON and paste',
      "Apply tokens to sync as Figma Variables",
    ],
  },
];

export default function FigmaExport({ theme, collectionName }) {
  const [copiedScript, setCopiedScript] = useState(false);
  const [copiedTokens, setCopiedTokens] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  const btnCls = copied =>
    `mt-auto flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
      copied
        ? "bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400"
        : "bg-gray-900 dark:bg-gray-50 text-white dark:text-gray-900 hover:bg-gray-700 dark:hover:bg-gray-200"
    }`;

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
      <div className="px-4 py-2.5 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-800 flex items-center gap-2">
        <LayoutGrid size={13} className="text-gray-400 dark:text-gray-500" />
        <p className="text-xs font-medium text-gray-700 dark:text-gray-300">Export to Figma Variables</p>
      </div>

      <div className="p-4 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          {/* Console script */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-3 flex flex-col gap-2">
            <div className="text-xs font-semibold text-gray-800 dark:text-gray-200">Console script</div>
            <div className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">
              Run in Figma's developer console to import all variables instantly.
            </div>
            <button
              onClick={() =>
                copyToClipboard(buildFigmaScript(theme, collectionName), () => {
                  setCopiedScript(true);
                  setTimeout(() => setCopiedScript(false), 2000);
                })
              }
              className={btnCls(copiedScript)}
            >
              {copiedScript ? <><Check size={11} /> Copied!</> : <><Copy size={11} /> Copy script</>}
            </button>
          </div>

          {/* Token Studio JSON */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-3 flex flex-col gap-2">
            <div className="text-xs font-semibold text-gray-800 dark:text-gray-200">Token Studio JSON</div>
            <div className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">
              Paste into Token Studio plugin to sync as Figma Variables.
            </div>
            <button
              onClick={() =>
                copyToClipboard(buildTokenStudioJSON(theme), () => {
                  setCopiedTokens(true);
                  setTimeout(() => setCopiedTokens(false), 2000);
                })
              }
              className={btnCls(copiedTokens)}
            >
              {copiedTokens ? <><Check size={11} /> Copied!</> : <><Copy size={11} /> Copy JSON</>}
            </button>
          </div>
        </div>

        <button
          onClick={() => setShowInstructions(v => !v)}
          className="flex items-center gap-1.5 text-[11px] text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          {showInstructions ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
          How to use these exports
        </button>

        {showInstructions && (
          <div className="space-y-2.5">
            {INSTRUCTIONS.map((block, i) => (
              <div key={i} className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3">
                <div className="text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  {block.label}
                </div>
                {block.steps.map((s, j) => (
                  <div key={j} className="flex gap-2 mb-1">
                    <span className="text-[10px] text-gray-400 min-w-[14px] pt-0.5">{j + 1}.</span>
                    <span className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">{s}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
