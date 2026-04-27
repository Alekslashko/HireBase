import React, { useState } from "react";
import { addDoc, collection } from "firebase/firestore";
import { db, nowTs } from "../services/firebase";
import { useAuth } from "../state/AuthContext";

export default function Feedback() {
  const { user } = useAuth();
  const [text, setText] = useState("");
  const [sent, setSent] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setSent(false);
    await addDoc(collection(db, "feedback"), {
      uid: user?.uid || null,
      email: user?.email || null,
      text: text.trim(),
      createdAt: nowTs()
    });
    setText("");
    setSent(true);
  }

  return (
    <div style={{ maxWidth: 820 }}>
      <div className="topbar">
        <div>
          <div className="h1">Site feedback</div>
          <div className="small">Send feedback to the site admins.</div>
        </div>
      </div>

      <form onSubmit={submit} className="card pad grid" style={{ gap: 12 }}>
        <div className="grid">
          <div className="small">Message</div>
          <textarea value={text} onChange={e => setText(e.target.value)} rows={6} placeholder="Describe the issue or suggestion…" />
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, alignItems: "center" }}>
          {sent ? <div className="small" style={{ color: "var(--ok)" }}>Sent.</div> : null}
          <button className="btn primary" type="submit" disabled={!text.trim()}>Send</button>
        </div>
      </form>
    </div>
  );
}
