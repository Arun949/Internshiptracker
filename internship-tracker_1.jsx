import { useState, useRef, useEffect, useCallback } from "react";

/* ─── GLOBAL STYLES ─── */
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    background: #f0f2ff;
    font-family: 'Plus Jakarta Sans', sans-serif;
    color: #1e1b4b;
    min-height: 100vh;
  }

  ::-webkit-scrollbar { width: 5px; height: 5px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: #c7d2fe; border-radius: 99px; }

  /* ── animated gradient bg ── */
  .app-bg {
    min-height: 100vh;
    background:
      radial-gradient(ellipse 80% 50% at 10% -10%, rgba(167,139,250,0.18) 0%, transparent 60%),
      radial-gradient(ellipse 60% 40% at 90% 0%,   rgba(99,200,255,0.14) 0%, transparent 55%),
      radial-gradient(ellipse 50% 60% at 50% 100%, rgba(251,191,36,0.10) 0%, transparent 60%),
      #f0f2ff;
  }

  /* ── cards ── */
  .card {
    background: #ffffff;
    border-radius: 18px;
    padding: 16px;
    margin-bottom: 10px;
    cursor: grab;
    transition: transform 0.22s cubic-bezier(0.34,1.56,0.64,1),
                box-shadow 0.22s ease;
    position: relative;
    overflow: hidden;
    user-select: none;
    box-shadow: 0 2px 8px rgba(99,91,255,0.07), 0 0 0 1px rgba(99,91,255,0.06);
  }
  .card:active { cursor: grabbing; }
  .card:hover {
    transform: translateY(-4px) scale(1.015);
    box-shadow: 0 16px 40px rgba(99,91,255,0.14), 0 0 0 1.5px rgba(99,91,255,0.15);
  }
  .card.dragging { opacity: 0.35; transform: scale(0.96) rotate(-1deg); }

  /* top-right decorative blob */
  .card::after {
    content: '';
    position: absolute;
    top: -18px; right: -18px;
    width: 64px; height: 64px;
    border-radius: 50%;
    opacity: 0.08;
    pointer-events: none;
  }

  /* ── modal ── */
  .modal-overlay {
    position: fixed; inset: 0;
    background: rgba(30,27,75,0.35);
    backdrop-filter: blur(10px);
    z-index: 1000;
    display: flex; align-items: center; justify-content: center;
    animation: fadeIn 0.15s ease;
  }
  .modal-box {
    background: #ffffff;
    border-radius: 24px;
    padding: 30px;
    width: 100%; max-width: 500px;
    max-height: 92vh; overflow-y: auto;
    box-shadow: 0 30px 80px rgba(99,91,255,0.2), 0 0 0 1px rgba(99,91,255,0.08);
    animation: slideUp 0.22s cubic-bezier(0.34,1.3,0.64,1);
  }

  .delete-overlay {
    position: fixed; inset: 0;
    background: rgba(30,27,75,0.35);
    backdrop-filter: blur(10px);
    z-index: 1100;
    display: flex; align-items: center; justify-content: center;
    animation: fadeIn 0.15s ease;
  }
  .delete-box {
    background: #fff;
    border-radius: 22px; padding: 30px;
    width: 100%; max-width: 360px; text-align: center;
    box-shadow: 0 30px 80px rgba(239,68,68,0.15), 0 0 0 1px rgba(239,68,68,0.1);
    animation: slideUp 0.18s cubic-bezier(0.34,1.3,0.64,1);
  }

  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes slideUp { from { transform: translateY(24px) scale(0.96); opacity: 0; } to { transform: none; opacity: 1; } }

  /* ── inputs ── */
  .input-field {
    width: 100%;
    background: #f8f7ff;
    border: 1.5px solid #e0e7ff;
    border-radius: 11px;
    padding: 9px 13px;
    font-size: 13px;
    font-family: 'Plus Jakarta Sans', sans-serif;
    color: #1e1b4b;
    outline: none;
    transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
  }
  .input-field::placeholder { color: #a5b4fc; }
  .input-field:focus {
    border-color: #818cf8;
    background: #fff;
    box-shadow: 0 0 0 3px rgba(129,140,248,0.15);
  }

  /* ── tags ── */
  .tag {
    display: inline-flex; align-items: center; gap: 3px;
    font-size: 11px; font-weight: 600;
    border-radius: 7px; padding: 2px 8px;
    white-space: nowrap;
  }

  /* ── buttons ── */
  .add-btn {
    background: linear-gradient(135deg, #635bff 0%, #818cf8 100%);
    color: #fff; border: none; border-radius: 12px;
    padding: 10px 22px; font-weight: 700; cursor: pointer;
    font-family: 'Syne', sans-serif; font-size: 14px;
    white-space: nowrap;
    box-shadow: 0 4px 16px rgba(99,91,255,0.35);
    transition: transform 0.2s, box-shadow 0.2s;
  }
  .add-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(99,91,255,0.45); }
  .add-btn:active { transform: scale(0.97); }

  .btn-icon {
    background: #f3f4f6;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    width: 28px; height: 28px;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; font-size: 12px;
    transition: background 0.15s, transform 0.15s;
    flex-shrink: 0;
  }
  .btn-icon:hover { background: #e0e7ff; transform: scale(1.1); }

  .save-btn {
    flex: 2; padding: 11px;
    border-radius: 12px; border: none;
    background: linear-gradient(135deg, #635bff, #818cf8);
    color: #fff; cursor: pointer;
    font-weight: 700; font-size: 14px;
    font-family: 'Syne', sans-serif;
    box-shadow: 0 4px 14px rgba(99,91,255,0.3);
    transition: opacity 0.2s, transform 0.15s;
  }
  .save-btn:hover { opacity: 0.9; transform: translateY(-1px); }
  .cancel-btn {
    flex: 1; padding: 11px;
    border-radius: 12px;
    border: 1.5px solid #e0e7ff;
    background: #f8f7ff;
    color: #6366f1; cursor: pointer;
    font-weight: 600; font-size: 14px;
    font-family: 'Plus Jakarta Sans', sans-serif;
    transition: background 0.15s, border-color 0.15s;
  }
  .cancel-btn:hover { background: #e0e7ff; border-color: #818cf8; }

  /* quick-add col btn */
  .quick-add-btn {
    width: 100%; margin-top: 8px;
    background: transparent;
    border-radius: 11px; padding: 8px;
    color: #a5b4fc; font-size: 12px; font-weight: 600;
    cursor: pointer; font-family: 'Plus Jakarta Sans', sans-serif;
    transition: all 0.2s;
    border: 1.5px dashed #c7d2fe;
  }
  .quick-add-btn:hover { background: #ede9fe; border-color: #818cf8; color: #635bff; }

  .stat-pill {
    display: flex; align-items: center; gap: 8px;
    background: rgba(255,255,255,0.8);
    border: 1.5px solid rgba(99,91,255,0.1);
    border-radius: 14px; padding: 9px 16px;
    backdrop-filter: blur(4px);
    transition: transform 0.2s, box-shadow 0.2s;
    cursor: default;
    box-shadow: 0 2px 8px rgba(99,91,255,0.05);
  }
  .stat-pill:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(99,91,255,0.1); }

  .label {
    font-size: 11px; font-weight: 700;
    color: #6366f1; display: block;
    margin-bottom: 5px; letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  .search-input {
    background: rgba(255,255,255,0.75);
    border: 1.5px solid rgba(99,91,255,0.15);
    border-radius: 12px;
    padding: 9px 16px;
    color: #1e1b4b; font-size: 13px;
    font-family: 'Plus Jakarta Sans', sans-serif;
    outline: none; width: 240px;
    backdrop-filter: blur(4px);
    box-shadow: 0 2px 8px rgba(99,91,255,0.05);
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  .search-input::placeholder { color: #a5b4fc; }
  .search-input:focus {
    border-color: #818cf8;
    box-shadow: 0 0 0 3px rgba(129,140,248,0.15);
    background: #fff;
  }

  .empty-drop {
    border: 2px dashed;
    border-radius: 14px;
    min-height: 80px;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    gap: 5px; font-size: 12px; font-weight: 500;
    transition: all 0.2s;
    color: #c7d2fe;
  }

  /* floating decorative orbs in header */
  .orb {
    position: absolute;
    border-radius: 50%;
    filter: blur(50px);
    pointer-events: none;
    opacity: 0.55;
  }
`;

/* ─── COLUMNS ─── */
const COLUMNS = [
  { id: "saved", label: "Saved", emoji: "🔖", color: "#8B5CF6", pastel: "#ede9fe", text: "#7c3aed", border: "#ddd6fe" },
  { id: "applied", label: "Applied", emoji: "📤", color: "#3B82F6", pastel: "#dbeafe", text: "#1d4ed8", border: "#bfdbfe" },
  { id: "interview", label: "Interview", emoji: "🎯", color: "#F59E0B", pastel: "#fef3c7", text: "#b45309", border: "#fde68a" },
  { id: "offer", label: "Offer", emoji: "🎉", color: "#10B981", pastel: "#d1fae5", text: "#065f46", border: "#a7f3d0" },
  { id: "rejected", label: "Rejected", emoji: "✖", color: "#F43F5E", pastel: "#ffe4e6", text: "#9f1239", border: "#fecdd3" },
];

const INITIAL_CARDS = [
  { id: 1, company: "Airbus", role: "Data Engineer Intern", location: "Toulouse, France", deadline: "2025-05-20", salary: "1200€/mo", notes: "Apply via careers portal. French preferred.", status: "applied", logo: "A" },
  { id: 2, company: "Capgemini", role: "ML Research Intern", location: "Paris, France", deadline: "2025-05-28", salary: "1000€/mo", notes: "Reached out to recruiter on LinkedIn.", status: "interview", logo: "C" },
  { id: 3, company: "Spotify", role: "Backend Intern", location: "Stockholm, Sweden", deadline: "2025-06-10", salary: "1500€/mo", notes: "Fully in English. Requires Kotlin or Scala.", status: "saved", logo: "S" },
  { id: 4, company: "N26", role: "Data Science Intern", location: "Berlin, Germany", deadline: "2025-04-15", salary: "1100€/mo", notes: "Banking fintech. Python + SQL required.", status: "rejected", logo: "N" },
  { id: 5, company: "Mistral AI", role: "AI Safety Intern", location: "Paris, France", deadline: "2025-06-01", salary: "1800€/mo", notes: "Top priority. Cutting-edge research.", status: "saved", logo: "M" },
  { id: 6, company: "Zalando", role: "SWE Intern – Platform", location: "Berlin, Germany", deadline: "2025-05-15", salary: "1300€/mo", notes: "Strong distributed systems experience.", status: "offer", logo: "Z" },
];

const EMPTY_FORM = { company: "", role: "", location: "", deadline: "", salary: "", notes: "", status: "saved" };

/* ── logo color map ── */
const LOGO_PALETTE = ["#635bff", "#3b82f6", "#f59e0b", "#10b981", "#f43f5e", "#ec4899", "#06b6d4", "#84cc16", "#f97316"];
const logoColor = (name) => LOGO_PALETTE[(name?.charCodeAt(0) || 65) % LOGO_PALETTE.length];

/* ─── UTILS ─── */
function formatDate(d) {
  if (!d) return "—";
  return new Date(d + "T12:00:00").toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}
function daysLeft(deadline) {
  if (!deadline) return null;
  const now = new Date(); now.setHours(0, 0, 0, 0);
  return Math.ceil((new Date(deadline + "T00:00:00") - now) / 86400000);
}

/* ─── SUBCOMPONENTS ─── */

function StyleInjector() {
  useEffect(() => {
    const el = document.createElement("style");
    el.textContent = GLOBAL_CSS;
    document.head.appendChild(el);
    return () => el.remove();
  }, []);
  return null;
}

function LogoBadge({ letter, name, size = 42 }) {
  const bg = logoColor(name || letter);
  return (
    <div style={{
      width: size, height: size,
      borderRadius: Math.round(size * 0.32),
      background: `linear-gradient(135deg, ${bg}22 0%, ${bg}11 100%)`,
      border: `2px solid ${bg}33`,
      color: bg,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'Syne', sans-serif", fontWeight: 800,
      fontSize: Math.round(size * 0.42),
      flexShrink: 0,
    }}>
      {(letter || "?").toUpperCase()}
    </div>
  );
}

function DeadlineBadge({ deadline }) {
  const days = daysLeft(deadline);
  if (days === null) return null;
  let bg, color, text;
  if (days < 0) { bg = "#fff1f2"; color = "#f43f5e"; text = "Expired"; }
  else if (days === 0) { bg = "#fff1f2"; color = "#f43f5e"; text = "Due today!"; }
  else if (days <= 3) { bg = "#fff7ed"; color = "#ea580c"; text = `${days}d left`; }
  else if (days <= 7) { bg = "#fefce8"; color = "#ca8a04"; text = `${days}d left`; }
  else { bg = "#f0fdf4"; color = "#16a34a"; text = `${days}d`; }
  return (
    <span className="tag" style={{ background: bg, color, border: `1px solid ${color}22` }}>
      ⏰ {text}
    </span>
  );
}

function Card({ card, col, onEdit, onDelete, onDragStart, dragging }) {
  return (
    <div
      className={`card${dragging ? " dragging" : ""}`}
      draggable
      onDragStart={() => onDragStart(card.id)}
      style={{
        borderTop: `3px solid ${col.color}`,
      }}
    >
      {/* decorative blob with column colour */}
      <div style={{
        position: "absolute", top: -20, right: -20,
        width: 64, height: 64, borderRadius: "50%",
        background: col.color, opacity: 0.07, pointerEvents: "none"
      }} />

      {/* Header row */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 10 }}>
        <LogoBadge letter={card.logo || card.company?.[0]} name={card.company} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 14, color: "#1e1b4b", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {card.company}
          </div>
          <div style={{ fontSize: 12, color: "#6366f1", marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", fontWeight: 500 }}>
            {card.role}
          </div>
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          <button className="btn-icon" onClick={(e) => { e.stopPropagation(); onEdit(card); }} title="Edit">✏️</button>
          <button className="btn-icon" onClick={(e) => { e.stopPropagation(); onDelete(card.id); }} title="Delete">🗑</button>
        </div>
      </div>

      {/* Tags */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 6 }}>
        {card.location && (
          <span className="tag" style={{ background: "#f0f2ff", color: "#4f46e5", border: "1px solid #e0e7ff" }}>
            📍 {card.location}
          </span>
        )}
        {card.salary && (
          <span className="tag" style={{ background: "#f0fdf4", color: "#16a34a", border: "1px solid #bbf7d0" }}>
            💰 {card.salary}
          </span>
        )}
        {card.deadline && <DeadlineBadge deadline={card.deadline} />}
      </div>

      {/* Date */}
      {card.deadline && (
        <div style={{ fontSize: 10, color: "#a5b4fc", fontWeight: 600, marginBottom: 5, letterSpacing: "0.03em" }}>
          📅 {formatDate(card.deadline)}
        </div>
      )}

      {/* Notes */}
      {card.notes && (
        <div style={{
          fontSize: 11.5, color: "#6b7280",
          borderTop: "1px solid #f3f4f6",
          paddingTop: 7, marginTop: 3,
          lineHeight: 1.6, fontStyle: "italic"
        }}>
          {card.notes.length > 90 ? card.notes.slice(0, 90) + "…" : card.notes}
        </div>
      )}
    </div>
  );
}

function FormField({ label, value, onChange, placeholder, type = "text", isTextarea }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label className="label">{label}</label>
      {isTextarea
        ? <textarea className="input-field" value={value} onChange={onChange} placeholder={placeholder} rows={3} style={{ resize: "vertical" }} />
        : <input className="input-field" type={type} value={value} onChange={onChange} placeholder={placeholder} />
      }
    </div>
  );
}

function Modal({ form, setForm, onSave, onClose, isEdit }) {
  const f = (key) => (e) => setForm(p => ({ ...p, [key]: e.target.value }));
  const col = COLUMNS.find(c => c.id === form.status) || COLUMNS[0];

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 22 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: col.pastel, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>
                {isEdit ? "✏️" : col.emoji}
              </div>
              <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 20, color: "#1e1b4b" }}>
                {isEdit ? "Edit Application" : "New Application"}
              </span>
            </div>
            <div style={{ fontSize: 12, color: "#a5b4fc", marginLeft: 46 }}>
              {isEdit ? "Update the details below" : "Track your next opportunity"}
            </div>
          </div>
          <button onClick={onClose} className="btn-icon" style={{ width: 32, height: 32, fontSize: 15 }}>✕</button>
        </div>

        {/* Form grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 14px" }}>
          <div style={{ gridColumn: "1 / -1" }}>
            <FormField label="Company *" value={form.company} onChange={f("company")} placeholder="e.g. Airbus" />
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <FormField label="Role *" value={form.role} onChange={f("role")} placeholder="e.g. Data Engineer Intern" />
          </div>
          <FormField label="Location" value={form.location} onChange={f("location")} placeholder="Paris, France" />
          <FormField label="Salary / Stipend" value={form.salary} onChange={f("salary")} placeholder="1200€/mo" />
          <FormField label="Deadline" value={form.deadline} onChange={f("deadline")} type="date" />
          <div style={{ marginBottom: 14 }}>
            <label className="label">Status</label>
            <select className="input-field" value={form.status} onChange={f("status")} style={{ appearance: "auto", cursor: "pointer" }}>
              {COLUMNS.map(c => <option key={c.id} value={c.id}>{c.emoji} {c.label}</option>)}
            </select>
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <FormField label="Notes" value={form.notes} onChange={f("notes")} placeholder="Any extra details about this application…" isTextarea />
          </div>
        </div>

        {/* Buttons */}
        <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
          <button className="cancel-btn" onClick={onClose}>Cancel</button>
          <button className="save-btn" onClick={onSave} style={{ opacity: (!form.company || !form.role) ? 0.5 : 1 }}
            disabled={!form.company || !form.role}>
            {isEdit ? "Save Changes" : "Add Application"}
          </button>
        </div>
      </div>
    </div>
  );
}

function DeleteConfirm({ card, onConfirm, onCancel }) {
  return (
    <div className="delete-overlay">
      <div className="delete-box">
        <div style={{ fontSize: 38, marginBottom: 12 }}>🗑️</div>
        <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 19, color: "#1e1b4b", marginBottom: 8 }}>
          Remove Application?
        </div>
        <div style={{ fontSize: 13, color: "#9ca3af", marginBottom: 22, lineHeight: 1.6 }}>
          Permanently remove <strong style={{ color: "#6366f1" }}>{card?.company}</strong> — {card?.role}? This can't be undone.
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="cancel-btn" style={{ flex: 1 }} onClick={onCancel}>Keep It</button>
          <button onClick={onConfirm} style={{
            flex: 1, padding: "11px", borderRadius: 12, border: "none",
            background: "linear-gradient(135deg, #f43f5e, #e11d48)",
            color: "#fff", cursor: "pointer", fontWeight: 700, fontSize: 14,
            fontFamily: "'Syne', sans-serif",
            boxShadow: "0 4px 14px rgba(244,63,94,0.3)",
          }}>Delete</button>
        </div>
      </div>
    </div>
  );
}

/* ─── MAIN APP ─── */
export default function App() {
  const [cards, setCards] = useState(INITIAL_CARDS);
  const [showModal, setShowModal] = useState(false);
  const [editCard, setEditCard] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [dragId, setDragId] = useState(null);
  const [dragOver, setDragOver] = useState(null);
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const nextId = useRef(200);

  const filtered = cards.filter(c =>
    !search ||
    c.company.toLowerCase().includes(search.toLowerCase()) ||
    c.role.toLowerCase().includes(search.toLowerCase()) ||
    (c.location || "").toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = useCallback(() => { setForm(EMPTY_FORM); setEditCard(null); setShowModal(true); }, []);
  const openEdit = useCallback((card) => { setForm({ ...card }); setEditCard(card.id); setShowModal(true); }, []);

  const handleSave = () => {
    if (!form.company.trim() || !form.role.trim()) return;
    const logo = form.company[0].toUpperCase();
    if (editCard !== null) {
      setCards(cs => cs.map(c => c.id === editCard ? { ...form, id: editCard, logo } : c));
    } else {
      setCards(cs => [...cs, { ...form, id: nextId.current++, logo }]);
    }
    setShowModal(false);
  };

  const handleDrop = (colId) => {
    if (dragId === null) return;
    setCards(cs => cs.map(c => c.id === dragId ? { ...c, status: colId } : c));
    setDragId(null); setDragOver(null);
  };

  const total = cards.length;
  const responseRate = total
    ? Math.round((cards.filter(c => ["interview", "offer"].includes(c.status)).length / total) * 100)
    : 0;
  const statMap = Object.fromEntries(COLUMNS.map(col => [col.id, cards.filter(c => c.status === col.id).length]));

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") { setShowModal(false); setDeleteTarget(null); } };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <StyleInjector />
      <div className="app-bg">

        {/* ══ HEADER ══ */}
        <header style={{
          background: "rgba(255,255,255,0.72)",
          backdropFilter: "blur(16px)",
          borderBottom: "1px solid rgba(99,91,255,0.08)",
          padding: "22px 32px 18px",
          position: "sticky", top: 0, zIndex: 100,
          boxShadow: "0 4px 24px rgba(99,91,255,0.07)",
        }}>
          <div style={{ maxWidth: 1400, margin: "0 auto" }}>

            {/* Top bar */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 14, marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                {/* Logo mark */}
                <div style={{
                  width: 44, height: 44, borderRadius: 14,
                  background: "linear-gradient(135deg, #635bff 0%, #818cf8 100%)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 22, boxShadow: "0 4px 14px rgba(99,91,255,0.3)"
                }}>🎓</div>
                <div>
                  <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 24, color: "#1e1b4b", letterSpacing: "-0.5px" }}>
                    InternTrack
                  </div>
                  <div style={{ fontSize: 12, color: "#a5b4fc", marginTop: 1, fontWeight: 500 }}>
                    Your Internship Command Center
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <input
                  className="search-input"
                  placeholder="🔍  Search company, role or city…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
                <button className="add-btn" onClick={openAdd}>+ Add Application</button>
              </div>
            </div>

            {/* Stats pills */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
              {COLUMNS.map(col => (
                <div key={col.id} className="stat-pill" style={{ borderColor: `${col.color}20` }}>
                  <span style={{
                    width: 24, height: 24, borderRadius: 8,
                    background: col.pastel, display: "flex",
                    alignItems: "center", justifyContent: "center", fontSize: 13
                  }}>{col.emoji}</span>
                  <span style={{ fontSize: 12, color: "#6b7280", fontWeight: 500 }}>{col.label}</span>
                  <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 20, color: col.color }}>
                    {statMap[col.id]}
                  </span>
                </div>
              ))}

              <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
                <div className="stat-pill" style={{ borderColor: "rgba(16,185,129,0.2)", background: "rgba(16,185,129,0.06)" }}>
                  <span style={{ fontSize: 16 }}>📊</span>
                  <span style={{ fontSize: 12, color: "#6b7280", fontWeight: 500 }}>Response Rate</span>
                  <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 20, color: "#10B981" }}>
                    {responseRate}%
                  </span>
                </div>
                <div className="stat-pill" style={{ borderColor: "rgba(99,91,255,0.15)", background: "rgba(99,91,255,0.05)" }}>
                  <span style={{ fontSize: 16 }}>📋</span>
                  <span style={{ fontSize: 12, color: "#6b7280", fontWeight: 500 }}>Total</span>
                  <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 20, color: "#635bff" }}>
                    {total}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* ══ BOARD ══ */}
        <main style={{ maxWidth: 1400, margin: "0 auto", padding: "28px 24px 48px", overflowX: "auto" }}>
          <div style={{ display: "flex", gap: 14, minWidth: 980 }}>
            {COLUMNS.map(col => {
              const colCards = filtered.filter(c => c.status === col.id);
              const isOver = dragOver === col.id;
              return (
                <div
                  key={col.id}
                  onDragOver={e => { e.preventDefault(); setDragOver(col.id); }}
                  onDragLeave={() => setDragOver(null)}
                  onDrop={() => handleDrop(col.id)}
                  style={{
                    flex: 1, minWidth: 205,
                    background: isOver ? col.pastel : "rgba(255,255,255,0.4)",
                    border: `1.5px solid ${isOver ? col.color + "50" : "rgba(99,91,255,0.07)"}`,
                    borderRadius: 20,
                    padding: "12px 10px",
                    backdropFilter: "blur(6px)",
                    transition: "background 0.2s, border-color 0.2s",
                    boxShadow: isOver
                      ? `0 0 0 3px ${col.color}22, 0 8px 30px ${col.color}14`
                      : "0 2px 12px rgba(99,91,255,0.04)",
                  }}
                >
                  {/* Column header */}
                  <div style={{
                    background: col.pastel,
                    border: `1.5px solid ${col.border}`,
                    borderRadius: 13, padding: "9px 12px",
                    marginBottom: 11, display: "flex", alignItems: "center", gap: 8,
                  }}>
                    <span style={{ fontSize: 16 }}>{col.emoji}</span>
                    <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 13, color: col.text }}>
                      {col.label}
                    </span>
                    <span style={{
                      marginLeft: "auto",
                      background: col.color, color: "#fff",
                      borderRadius: 99, minWidth: 22, height: 22,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 11, fontWeight: 800, padding: "0 6px",
                      boxShadow: `0 2px 8px ${col.color}44`
                    }}>
                      {colCards.length}
                    </span>
                  </div>

                  {/* Cards */}
                  <div style={{ minHeight: 80 }}>
                    {colCards.map(card => (
                      <Card
                        key={card.id} card={card} col={col}
                        onEdit={openEdit}
                        onDelete={(id) => setDeleteTarget(cards.find(c => c.id === id))}
                        onDragStart={setDragId}
                        dragging={dragId === card.id}
                      />
                    ))}
                    {colCards.length === 0 && (
                      <div className="empty-drop" style={{
                        borderColor: isOver ? col.color : col.border,
                        color: isOver ? col.text : "#c7d2fe",
                        background: isOver ? `${col.color}08` : "transparent",
                      }}>
                        <span style={{ fontSize: 20, opacity: 0.5 }}>{col.emoji}</span>
                        <span>{isOver ? "Drop here!" : "No applications yet"}</span>
                      </div>
                    )}
                  </div>

                  {/* Quick add */}
                  <button
                    className="quick-add-btn"
                    onClick={() => { setForm({ ...EMPTY_FORM, status: col.id }); setEditCard(null); setShowModal(true); }}
                    style={{ borderColor: col.border }}
                    onMouseEnter={e => { e.currentTarget.style.background = col.pastel; e.currentTarget.style.color = col.text; e.currentTarget.style.borderColor = col.color + "60"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#a5b4fc"; e.currentTarget.style.borderColor = "#c7d2fe"; }}
                  >
                    + Add to {col.label}
                  </button>
                </div>
              );
            })}
          </div>
        </main>

        {/* ══ FOOTER ══ */}
        <footer style={{ textAlign: "center", paddingBottom: 32, color: "#c7d2fe", fontSize: 12, fontWeight: 500 }}>
          💡 Drag & drop cards between columns · Click <strong style={{ color: "#818cf8" }}>+</strong> in any column to add directly · Press <kbd style={{ background: "#e0e7ff", color: "#635bff", borderRadius: 5, padding: "1px 6px", fontSize: 11 }}>Esc</kbd> to close modals
        </footer>
      </div>

      {/* ══ MODALS ══ */}
      {showModal && (
        <Modal form={form} setForm={setForm} onSave={handleSave} onClose={() => setShowModal(false)} isEdit={editCard !== null} />
      )}
      {deleteTarget && (
        <DeleteConfirm card={deleteTarget} onConfirm={() => { setCards(cs => cs.filter(c => c.id !== deleteTarget.id)); setDeleteTarget(null); }} onCancel={() => setDeleteTarget(null)} />
      )}
    </>
  );
}
