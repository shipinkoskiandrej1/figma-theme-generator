import { contrastRatio, wcagLevel } from "../utils/colorUtils";
import { WCAG_PAIRS } from "../utils/constants";

function Badge({ level, required }) {
  const passes =
    level === "AAA" ||
    (required === "AA" && (level === "AA" || level === "AAA"));

  return (
    <span
      className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
        passes
          ? "bg-green-100 dark:bg-green-950/50 text-green-700 dark:text-green-400"
          : "bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-400"
      }`}
    >
      {level}
    </span>
  );
}

export default function WcagChecker({ theme }) {
  const pairs = WCAG_PAIRS.filter(p => theme[p.fg] && theme[p.bg]);

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
      <div className="px-4 py-2.5 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">
          WCAG Contrast
        </p>
      </div>

      <div className="divide-y divide-gray-100 dark:divide-gray-800">
        {pairs.map(pair => {
          const ratio = contrastRatio(theme[pair.fg], theme[pair.bg]);
          const level = wcagLevel(ratio);

          return (
            <div key={pair.label} className="flex items-center justify-between px-4 py-2.5">
              <div className="flex items-center gap-3">
                {/* Overlapping color circles */}
                <div className="flex -space-x-1.5">
                  <div
                    className="w-5 h-5 rounded-full ring-2 ring-white dark:ring-gray-900"
                    style={{ background: theme[pair.fg] }}
                  />
                  <div
                    className="w-5 h-5 rounded-full ring-2 ring-white dark:ring-gray-900"
                    style={{ background: theme[pair.bg] }}
                  />
                </div>
                <span className="text-xs text-gray-600 dark:text-gray-400">{pair.label}</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-gray-400 dark:text-gray-500 tabular-nums">
                  {ratio.toFixed(2)}:1
                </span>
                <Badge level={level} required={pair.required} />
                <span className="text-[10px] text-gray-300 dark:text-gray-600">
                  need {pair.required}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
