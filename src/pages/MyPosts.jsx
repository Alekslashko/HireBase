import React, { useEffect, useMemo, useState } from "react";
import { addDoc, collection, deleteDoc, doc, getDocs, limit, query, updateDoc, where } from "firebase/firestore";
import { db, nowTs } from "../services/firebase";
import { useAuth } from "../state/AuthContext";
import PostEditor from "../components/PostEditor";
import { PostCard } from "../components/PostCard";
import { logAudit } from "../services/audit";

function tsToMillis(t) {
  if (!t) return 0;
  if (typeof t.toMillis === "function") return t.toMillis();
  if (typeof t.seconds === "number") return t.seconds * 1000;
  return 0;
}

export default function MyPosts({ globalSearch }) {
  const { user, profile } = useAuth();
  const [posts, setPosts] = useState([]);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  async function load() {
    if (!user) return;
    setErr("");
    setLoading(true);
    try {
      // Avoid composite index requirements by sorting client-side.
      const q = query(collection(db, "posts"), where("ownerUid", "==", user.uid), limit(200));
      const snap = await getDocs(q);
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      list.sort((a, b) => tsToMillis(b.createdAt) - tsToMillis(a.createdAt));
      setPosts(list);
    } catch (e) {
      setErr(e?.message || "Failed to load posts");
      console.error(e);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [user?.uid]);

  const filtered = useMemo(() => {
    const s = (globalSearch || "").trim().toLowerCase();
    if (!s) return posts;
    return posts.filter(p => (`${p.title||""} ${p.description||""} ${p.category||""}`.toLowerCase().includes(s)));
  }, [posts, globalSearch]);

  async function createOrUpdate(payload) {
    if (!user) return;
    setErr("");
    try {
      if (editing && editing.id) {
        await updateDoc(doc(db, "posts", editing.id), {
          ...payload,
          budget: payload.budget === null ? null : payload.budget,
          updatedAt: nowTs(),
        });
        await logAudit({
          actorUid: user.uid,
          actorEmail: user.email,
          actorRole: profile?.role,
          action: "post_update_self",
          targetType: "post",
          targetId: editing.id,
        });
      } else {
        const docRef = await addDoc(collection(db, "posts"), {
          ...payload,
          budget: payload.budget === null ? null : payload.budget,
          ownerUid: user.uid,
          ownerEmail: user.email || "",
          createdAt: nowTs(),
          updatedAt: nowTs(),
        });
        await logAudit({
          actorUid: user.uid,
          actorEmail: user.email,
          actorRole: profile?.role,
          action: "post_create",
          targetType: "post",
          targetId: docRef.id,
        });
      }
      setEditing(null);
      await load();
    } catch (e) {
      setErr(e?.message || "Save failed");
      console.error(e);
    }
  }

  async function remove(post) {
    if (!post?.id) return;
    setErr("");
    try {
      await deleteDoc(doc(db, "posts", post.id));
      await logAudit({
        actorUid: user.uid,
        actorEmail: user.email,
        actorRole: profile?.role,
        action: "post_delete_self",
        targetType: "post",
        targetId: post.id,
      });
      await load();
    } catch (e) {
      setErr(e?.message || "Delete failed");
      console.error(e);
    }
  }

  return (
    <div className="grid" style={{ gap: 14 }}>
      <div className="topbar">
        <div>
          <div className="h1">My posts</div>
          <div className="small">Create and manage your posts.</div>
        </div>
        <button className="btn primary" onClick={() => setEditing({})}>New post</button>
      </div>

      {err ? <div className="card pad" style={{ borderColor: "rgba(255,92,122,0.35)" }}>{err}</div> : null}

      {editing !== null ? (
        <PostEditor
          initial={editing?.id ? editing : null}
          uid={user?.uid}
          onCancel={() => setEditing(null)}
          onSave={createOrUpdate}
        />
      ) : null}

      {loading ? <div className="card pad">Loading…</div> : null}
      {!loading && filtered.length === 0 ? <div className="card pad">No posts.</div> : null}
      {filtered.map(p => (
        <PostCard
          key={p.id}
          post={p}
          canManage={true}
          onEdit={(pp) => setEditing(pp)}
          onDelete={(pp) => remove(pp)}
        />
      ))}
    </div>
  );
}
