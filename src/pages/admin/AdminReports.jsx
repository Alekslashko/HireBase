import React, { useEffect, useMemo, useState } from "react";
import { collection, getDocs, limit, orderBy, query, updateDoc, doc } from "firebase/firestore";
import { db, nowTs } from "../../services/firebase";
import { useAuth } from "../../state/AuthContext";
import { logAudit } from "../../services/audit";

export default function AdminReports({ globalSearch }) {
  const { user, profile, isAdmin } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const q = query(collection(db, "reports"), orderBy("createdAt", "desc"), limit(300));
    const snap = await getDocs(q);
    setReports(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const s = (globalSearch || "").trim().toLowerCase();
    if (!s) return reports;
    return reports.filter(r => (`${r.type||""} ${r.postId||""} ${r.reporterEmail||""} ${r.status||""} ${r.reason||""}`.toLowerCase().includes(s)));
  }, [reports, globalSearch]);

  if (!isAdmin) return <div className="card pad">Access denied.</div>;

  async function setStatus(id, status) {
    await updateDoc(doc(db, "reports", id), { status, updatedAt: nowTs() });
    await logAudit({
      actorUid: user.uid,
      actorEmail: user.email,
      actorRole: profile?.role,
      action: "report_status_change",
      targetType: "report",
      targetId: id,
      meta: { status }
    });
    await load();
  }

  return (
    <div className="grid" style={{ gap: 14 }}>
      <div className="topbar">
        <div>
          <div className="h1">Reports</div>
          <div className="small">User-submitted reports for posts.</div>
        </div>
        <button className="btn" onClick={load}>Refresh</button>
      </div>

      {loading ? <div className="card pad">Loading…</div> : null}
      {!loading && filtered.length === 0 ? <div className="card pad">No reports.</div> : null}

      <div className="grid">
        {filtered.map(r => (
          <div key={r.id} className="card pad">
            <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
              <div style={{ fontWeight: 900 }}>Post report</div>
              <span className="pill">{r.status || "open"}</span>
            </div>
            <div className="small" style={{ marginTop: 6 }}>
              Post: {r.postId} · Reporter: {r.reporterEmail || ""} · OwnerUid: {r.postOwnerUid || ""}
            </div>
            {r.reason ? <div style={{ whiteSpace: "pre-wrap", marginTop: 10 }}>{r.reason}</div> : <div className="small muted" style={{ marginTop: 10 }}>No reason provided.</div>}
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 12, flexWrap: "wrap" }}>
              <button className="btn" onClick={() => setStatus(r.id, "open")}>Mark open</button>
              <button className="btn" onClick={() => setStatus(r.id, "resolved")}>Mark resolved</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
