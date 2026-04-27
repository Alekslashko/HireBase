import React, { useEffect, useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db, nowTs } from "../services/firebase";
import { useAuth } from "../state/AuthContext";
import { logAudit } from "../services/audit";

export default function Profile() {
  const { user, profile } = useAuth();
  const [name, setName] = useState(profile?.name || "");
  const [bio, setBio] = useState(profile?.bio || "");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    setName(profile?.name || "");
    setBio(profile?.bio || "");
  }, [profile?.uid]);

  async function save(e) {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setMsg("");
    setErr("");
    try {
      await updateDoc(doc(db, "users", user.uid), { name: name.trim(), bio: bio.trim(), updatedAt: nowTs() });
      await logAudit({
        actorUid: user.uid,
        actorEmail: user.email,
        actorRole: profile?.role,
        action: "profile_update",
        targetType: "user",
        targetId: user.uid,
      });
      setMsg("Saved.");
    } catch (e2) {
      setErr(e2?.message || "Save failed");
      console.error(e2);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ maxWidth: 820 }}>
      <div className="topbar">
        <div>
          <div className="h1">Edit account</div>
          <div className="small">Update your public profile.</div>
        </div>
      </div>

      <form onSubmit={save} className="card pad grid" style={{ gap: 12 }}>
        <div className="grid">
          <div className="small">Name</div>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Your display name" />
        </div>
        <div className="grid">
          <div className="small">Bio</div>
          <textarea value={bio} onChange={e => setBio(e.target.value)} rows={6} placeholder="What do you do?" />
        </div>

        {err ? <div className="small" style={{ color: "var(--danger)" }}>{err}</div> : null}

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", alignItems: "center" }}>
          {msg ? <div className="small">{msg}</div> : null}
          <button className="btn primary" disabled={saving} type="submit">{saving ? "Saving…" : "Save changes"}</button>
        </div>
      </form>
    </div>
  );
}
