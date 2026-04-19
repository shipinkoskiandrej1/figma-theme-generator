import { useEffect, useState, useCallback } from "react";
import { Trash2, RefreshCw } from "lucide-react";
import { supabase } from "../lib/supabase";

function formatDate(iso) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function ClientCard({ client, onLoad, onDelete }) {
  const [deleting, setDeleting] = useState(false);
  const colors = Object.entries(client.theme)
    .filter(([k]) => k.startsWith("color/") && client.theme[k].startsWith("#"))
    .slice(0, 8)
    .map(([, v]) => v);

  const handleDelete = async e => {
    e.stopPropagation();
    setDeleting(true);
    await onDelete(client.id);
  };

  return (
    <div
      onClick={() => onLoad(client)}
      className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 flex items-center gap-4 cursor-pointer hover:border-gray-300 dark:hover:border-gray-700 transition-colors group"
    >
      {/* Swatch strip */}
      <div className="flex rounded-lg overflow-hidden flex-shrink-0 h-8 w-24 border border-gray-100 dark:border-gray-800">
        {colors.map((c, i) => (
          <div key={i} className="flex-1" style={{ background: c }} />
        ))}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-gray-900 dark:text-gray-50 truncate">
          {client.client_name}
        </div>
        <div className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
          {formatDate(client.created_at)}
        </div>
      </div>

      <span className="text-[10px] text-gray-300 dark:text-gray-600 group-hover:text-gray-400 dark:group-hover:text-gray-500 transition-colors mr-1">
        Click to load
      </span>

      {/* Delete */}
      <button
        onClick={handleDelete}
        disabled={deleting}
        className="h-8 w-8 flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-500 hover:border-red-300 dark:hover:border-red-700 hover:text-red-500 dark:hover:text-red-400 transition-colors flex-shrink-0 disabled:opacity-40"
      >
        {deleting
          ? <RefreshCw size={12} className="animate-spin" />
          : <Trash2 size={12} />
        }
      </button>
    </div>
  );
}

export default function Dashboard({ onLoadTheme }) {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchClients = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from("clients")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) setError(error.message);
    else setClients(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchClients(); }, [fetchClients]);

  const handleDelete = async id => {
    const { error } = await supabase.from("clients").delete().eq("id", id);
    if (!error) setClients(c => c.filter(cl => cl.id !== id));
  };

  return (
    <div className="pt-12 max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">
          Saved Clients
        </p>
        <button
          onClick={fetchClients}
          className="h-7 w-7 flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          title="Refresh"
        >
          <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3">
          {error}
        </div>
      ) : clients.length === 0 ? (
        <div className="text-center py-20 text-sm text-gray-400 dark:text-gray-500">
          No saved clients yet.<br />
          <span className="text-xs">Generate a theme and hit "Save to Dashboard".</span>
        </div>
      ) : (
        <div className="space-y-2">
          {clients.map(client => (
            <ClientCard
              key={client.id}
              client={client}
              onLoad={onLoadTheme}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
