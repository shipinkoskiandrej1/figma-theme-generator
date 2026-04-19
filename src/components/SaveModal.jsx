import { useState } from "react";
import { RefreshCw } from "lucide-react";

export default function SaveModal({ onSave, onCancel, saving }) {
  const [name, setName] = useState("");

  const submit = () => {
    if (name.trim()) onSave(name.trim());
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={e => e.target === e.currentTarget && onCancel()}
    >
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 w-80 shadow-2xl">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-50 mb-1">
          Save to Dashboard
        </h3>
        <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">
          Give this client a name to find the theme later.
        </p>

        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === "Enter" && submit()}
          placeholder="Client name"
          autoFocus
          className="w-full h-9 px-3 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 outline-none focus:border-gray-400 dark:focus:border-gray-500 transition-colors mb-4"
        />

        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 h-9 text-xs font-medium rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={!name.trim() || saving}
            className="flex-1 h-9 flex items-center justify-center gap-1.5 text-xs font-medium rounded-lg bg-gray-900 dark:bg-gray-50 text-white dark:text-gray-900 disabled:opacity-40 transition-opacity"
          >
            {saving ? <><RefreshCw size={12} className="animate-spin" /> Saving…</> : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
