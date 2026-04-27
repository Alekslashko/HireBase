import React, { useEffect, useMemo, useState } from "react";
import { collection, getDocs, limit, orderBy, query } from "firebase/firestore";
import { db } from "../services/firebase";

export default function Accounts({ globalSearch }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const q = query(collection(db, "users"), orderBy("createdAt", "desc"), limit(200));
    const snap = await getDocs(q);
    setUsers(snap.docs.map(d => ({ uid: d.id, ...d.data() })));
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const s = (globalSearch || "").trim().toLowerCase();
    if (!s) return users;
    return users.filter(u => (`${u.email||""} ${u.name||""} ${u.bio||""} ${u.role||""}`.toLowerCase().includes(s)));
  }, [users, globalSearch]);

  return (
    <div className="grid" style={{ gap: 14 }}>
      <div className="topbar">
        <div>
          <div className="h1">Accounts</div>
          <div className="small">Search users (email, name, bio).</div>
        </div>
      </div>

      {loading ? <div className="card pad">Loading…</div> : null}
      {!loading && filtered.length === 0 ? <div className="card pad">No accounts found.</div> : null}

      <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))" }}>
        {filtered.map(u => (
          <div key={u.uid} className="card pad">
            <div style={{ fontWeight: 800 }}>{u.name || "(No name)"}</div>
            <div className="small">{u.email || ""}</div>
            <div className="pill" style={{ marginTop: 10 }}>{u.role || "user"}</div>
            {u.bio ? <div style={{ marginTop: 10, whiteSpace: "pre-wrap" }}>{u.bio}</div> : <div className="small muted" style={{ marginTop: 10 }}>No bio</div>}
          </div>
        ))}
      </div>
    </div>
  );
}
