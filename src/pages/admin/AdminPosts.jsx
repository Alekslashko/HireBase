import React, { useEffect, useMemo, useState } from "react";
import { collection, deleteDoc, doc, getDocs, limit, orderBy, query, updateDoc } from "firebase/firestore";
import { db, nowTs } from "../../services/firebase";
import { useAuth } from "../../state/AuthContext";
import { PostCard } from "../../components/PostCard";
import PostEditor from "../../components/PostEditor";
import { logAudit } from "../../services/audit";

export default function AdminPosts({ globalSearch }) {
  const { user, profile, isAdmin } = useAuth();
  const [posts, setPosts] = useState([]);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"), limit(300));
    const snap = await getDocs(q);
    setPosts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const s = (globalSearch || "").trim().toLowerCase();
    if (!s) return posts;
    return posts.filter(p => (`${p.title||""} ${p.description||""} ${p.category||""} ${p.ownerEmail||""}`.toLowerCase().includes(s)));
  }, [posts, globalSearch]);

  if (!isAdmin) return <div className="card pad">Access denied.</div>;

  async function save(payload) {
    if (!editing?.id) return;
    await updateDoc(doc(db, "posts", editing.id), { ...payload, updatedAt: nowTs() });
    await logAudit({
      actorUid: user.uid,
      actorEmail: user.email,
      actorRole: profile?.role,
      action: "post_update_admin",
      targetType: "post",
      targetId: editing.id,
      meta: { ownerUid: editing.ownerUid || "" }
    });
    setEditing(null);
    await load();
  }

  async function remove(p) {
    await deleteDoc(doc(db, "posts", p.id));
    await logAudit({
      actorUid: user.uid,
      actorEmail: user.email,
      actorRole: profile?.role,
      action: "post_delete_admin",
      targetType: "post",
      targetId: p.id,
      meta: { ownerUid: p.ownerUid || "" }
    });
    await load();
  }

  return (
    <div className="grid" style={{ gap: 14 }}>
      <div className="topbar">
        <div>
          <div className="h1">Manage posts</div>
          <div className="small">Admins can edit/delete posts.</div>
        </div>
      </div>

      {editing ? (
        <PostEditor
          initial={editing}
          uid={user?.uid}
          onCancel={() => setEditing(null)}
          onSave={save}
        />
      ) : null}

      {loading ? <div className="card pad">Loading…</div> : null}
      {!loading && filtered.length === 0 ? <div className="card pad">No posts found.</div> : null}
      {filtered.map(p => (
        <PostCard
          key={p.id}
          post={p}
          canManage={true}
          onEdit={() => setEditing(p)}
          onDelete={() => remove(p)}
        />
      ))}
    </div>
  );
}
