import { useEffect, useState, useCallback } from "react";
import { Trash2, RefreshCw } from "lucide-react";
import { supabase } from "../lib/supabase";
import { C } from "../utils/theme";

function formatDate(iso) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function Skeleton() {
  return (
    <div style={{
      height: 88, borderRadius: 10, background: C.bg3,
      animation: 'pulse 1.4s ease-in-out infinite',
    }} />
  );
}

function ClientCard({ client, onLoad, onDelete, isMobile }) {
  const [deleting, setDeleting] = useState(false);
  const [hovered, setHovered] = useState(false);

  const colors = Object.entries(client.theme)
    .filter(([k]) => k.startsWith("color/") && String(client.theme[k]).startsWith("#"))
    .slice(0, 10)
    .map(([, v]) => v);

  const handleDelete = async e => {
    e.stopPropagation();
    setDeleting(true);
    await onDelete(client.id);
  };

  return (
    <div
      onClick={() => onLoad(client)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 20,
        padding: '20px 28px',
        background: hovered ? C.bg2 : C.bg1,
        border: `1px solid ${hovered ? C.b3 : C.b2}`,
        borderRadius: 10, cursor: 'pointer', transition: 'all .15s',
        boxShadow: hovered ? '0 4px 16px rgba(0,0,0,0.09)' : '0 1px 4px rgba(0,0,0,0.05)',
      }}
    >
      {/* Swatch strip */}
      <div style={{
        width: 120, height: 44, borderRadius: 8, overflow: 'hidden',
        border: `1px solid ${C.b2}`, display: 'flex', flexShrink: 0,
      }}>
        {colors.map((c, i) => (
          <div key={i} style={{ flex: 1, background: c }} />
        ))}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: C.t1, fontFamily: C.sans, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {client.client_name}
        </div>
        <div style={{ fontSize: 11, color: C.t4, fontFamily: C.sans, marginTop: 4 }}>
          {formatDate(client.created_at)}
        </div>
      </div>

      {!isMobile && (
        <span style={{ fontSize: 11, color: C.t5, fontFamily: C.sans, marginRight: 6, flexShrink: 0 }}>
          Click to load
        </span>
      )}

      {/* Delete */}
      <button
        onClick={handleDelete}
        disabled={deleting}
        style={{
          width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'none', border: `1px solid ${C.b3}`, borderRadius: 7,
          color: C.t4, cursor: deleting ? 'not-allowed' : 'pointer',
          opacity: deleting ? 0.4 : 1, transition: 'all .15s', flexShrink: 0,
        }}
        onMouseEnter={e => { if (!deleting) { e.currentTarget.style.borderColor = '#EF4444'; e.currentTarget.style.color = '#EF4444'; } }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = C.b3; e.currentTarget.style.color = C.t4; }}
      >
        {deleting
          ? <RefreshCw size={11} style={{ animation: 'spin 1s linear infinite' }} />
          : <Trash2 size={11} />}
      </button>
    </div>
  );
}

export default function Dashboard({ onLoadTheme, isMobile }) {
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
    <div style={{ padding: isMobile ? '24px 16px 80px' : '36px 48px 80px', display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.t3, letterSpacing: '.08em', textTransform: 'uppercase', fontFamily: C.sans }}>
            Saved Clients
          </div>
          <div style={{ fontSize: 12, color: C.t4, fontFamily: C.sans, marginTop: 4 }}>
            {!loading && !error && `${clients.length} theme${clients.length !== 1 ? 's' : ''} saved`}
          </div>
        </div>
        <button
          onClick={fetchClients}
          style={{
            width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'transparent', border: `1px solid ${C.b3}`, borderRadius: 6,
            color: C.t4, cursor: 'pointer', transition: 'border-color .15s',
          }}
          title="Refresh"
          onMouseEnter={e => e.currentTarget.style.borderColor = C.b4}
          onMouseLeave={e => e.currentTarget.style.borderColor = C.b3}
        >
          <RefreshCw size={11} style={loading ? { animation: 'spin 1s linear infinite' } : {}} />
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[1, 2, 3].map(i => <Skeleton key={i} />)}
        </div>
      ) : error ? (
        <div style={{
          padding: '12px 16px', background: '#FEF2F2', border: '1px solid #FCA5A5',
          borderRadius: 8, fontSize: 11, color: '#DC2626', fontFamily: C.sans,
        }}>
          {error}
        </div>
      ) : clients.length === 0 ? (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          padding: '60px 24px', border: `1px dashed ${C.b3}`, borderRadius: 8, textAlign: 'center',
        }}>
          <div style={{ fontSize: 12, fontWeight: 500, color: C.t4, fontFamily: C.sans, marginBottom: 4 }}>
            No saved clients yet
          </div>
          <div style={{ fontSize: 11, color: C.t5, fontFamily: C.sans }}>
            Generate a theme and click "Save to Dashboard"
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {clients.map(client => (
            <ClientCard
              key={client.id}
              client={client}
              onLoad={onLoadTheme}
              onDelete={handleDelete}
              isMobile={isMobile}
            />
          ))}
        </div>
      )}
    </div>
  );
}
