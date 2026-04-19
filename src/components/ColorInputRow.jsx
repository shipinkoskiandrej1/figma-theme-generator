import { isValidHex } from "../utils/colorUtils";

export default function ColorInputRow({ label, sublabel, color, input, onColorChange, onInputChange }) {
  const invalid = input.length > 1 && !isValidHex(input);

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-xs font-medium text-gray-700 dark:text-gray-300">{label}</label>
        {sublabel && (
          <span className="text-[10px] text-gray-400 dark:text-gray-500">{sublabel}</span>
        )}
      </div>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={color}
          onChange={e => onColorChange(e.target.value)}
          className="h-9 w-9 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer p-0.5 bg-transparent flex-shrink-0"
        />
        <input
          type="text"
          value={input}
          onChange={e => {
            const raw = e.target.value;
            const normalized = raw.startsWith("#") ? raw : raw ? "#" + raw : raw;
            onInputChange(normalized);
          }}
          placeholder="#000000"
          spellCheck={false}
          className={`flex-1 h-9 px-3 text-sm font-mono rounded-lg border bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 outline-none transition-colors ${
            invalid
              ? "border-red-300 dark:border-red-700 focus:border-red-400"
              : "border-gray-200 dark:border-gray-700 focus:border-gray-400 dark:focus:border-gray-500"
          }`}
        />
      </div>
    </div>
  );
}
