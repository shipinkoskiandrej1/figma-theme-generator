import { GROUPS } from "../utils/constants";

export default function SwatchStrip({ theme, onEdit }) {
  const colorVars = GROUPS.flatMap(g => g.vars).filter(v => v.type === "color" && theme[v.key]);

  return (
    <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 flex h-11">
      {colorVars.map(v => (
        <label
          key={v.key}
          className="relative flex-1 cursor-pointer group"
          style={{ background: theme[v.key] }}
          title={`${v.key}: ${theme[v.key]} — click to edit`}
        >
          <input
            type="color"
            value={theme[v.key]}
            onChange={e => onEdit(v.key, e.target.value)}
            className="sr-only"
          />
          {/* hover overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors flex items-center justify-center">
            <svg
              className="opacity-0 group-hover:opacity-100 transition-opacity"
              width="12" height="12" viewBox="0 0 24 24"
              fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
            >
              <path d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
            </svg>
          </div>
        </label>
      ))}
    </div>
  );
}
