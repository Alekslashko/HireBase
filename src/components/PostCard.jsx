import React, { useState } from "react";
import { useAuth } from "../state/AuthContext";
import { reportPost } from "../services/reports";

export function PostCard({ post, onEdit, onDelete, canManage }) {
  const { user } = useAuth();
  const [reporting, setReporting] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportStatus, setReportStatus] = useState("");
  const [reportErr, setReportErr] = useState("");

  const badge = post?.type === "offer" ? "Offer" : post?.type === "request" ? "Request" : "Post";
  const variant = post?.variant || "custom";
  const isOwner = user?.uid && post?.ownerUid && user.uid === post.ownerUid;

  async function submitReport() {
    setReportErr("");
    setReportStatus("");
    try {
      await reportPost({
        postId: post.id,
        postOwnerUid: post.ownerUid,
        reporterUid: user?.uid || "",
        reporterEmail: user?.email || "",
        reason: reportReason
      });
      setReportStatus("Reported.");
      setReporting(false);
      setReportReason("");
    } catch (e) {
      setReportErr(e?.message || "Report failed");
    }
  }

  return (
    <div className="card pad">
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
            <span className="pill">{badge}</span>
            <span className="pill">{variant}</span>
            {post?.category ? <span className="pill">{post.category}</span> : null}
            {typeof post?.budget === "number" ? <span className="pill">${post.budget}</span> : null}
          </div>
          <div className="h2" style={{ margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {post.title || "(Untitled)"}
          </div>
          <div className="small" style={{ marginTop: 4 }}>
            By {post.ownerEmail || "Unknown"}
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {canManage ? (
            <>
              <button className="btn" onClick={() => onEdit?.(post)}>Edit</button>
              <button className="btn danger" onClick={() => onDelete?.(post)}>Delete</button>
            </>
          ) : null}

          {user && !isOwner ? (
            <button className="btn" onClick={() => setReporting(v => !v)}>Report</button>
          ) : null}
        </div>
      </div>

      {post?.variant === "simple" ? null : (
        <>
          <hr className="sep" />
          <div style={{ whiteSpace: "pre-wrap" }}>{post.description || ""}</div>
        </>
      )}

      {post?.contactInfo ? (
        <>
          <hr className="sep" />
          <div className="small" style={{ fontWeight: 800, marginBottom: 6 }}>Contact</div>
          <div style={{ whiteSpace: "pre-wrap" }}>{post.contactInfo}</div>
        </>
      ) : null}

      {Array.isArray(post?.images) && post.images.length ? (
        <>
          <hr className="sep" />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 10 }}>
            {post.images.map((url, i) => (
              <a key={i} href={url} target="_blank" rel="noreferrer">
                <img alt={`post-${i}`} src={url} style={{ width: "100%", height: 120, objectFit: "cover", borderRadius: 12, border: "1px solid var(--border)" }} />
              </a>
            ))}
          </div>
        </>
      ) : null}

      {reportStatus ? (
        <>
          <hr className="sep" />
          <div className="small" style={{ color: "var(--ok)" }}>{reportStatus}</div>
        </>
      ) : null}

      {reporting ? (
        <>
          <hr className="sep" />
          <div className="grid" style={{ gap: 10 }}>
            <div className="small">Reason (optional)</div>
            <textarea rows={3} value={reportReason} onChange={(e) => setReportReason(e.target.value)} placeholder="Describe why you are reporting this post…" />
            {reportErr ? <div className="small" style={{ color: "var(--danger)" }}>{reportErr}</div> : null}
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button className="btn" type="button" onClick={() => setReporting(false)}>Cancel</button>
              <button className="btn primary" type="button" onClick={submitReport}>Submit report</button>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
