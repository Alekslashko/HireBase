import React, { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { Link } from "react-router-dom";
import { auth } from "../services/firebase";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");
  const [err, setErr] = useState("");

  async function submit(e) {
    e.preventDefault();
    setErr("");
    setStatus("");
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setStatus("Password reset email sent.");
    } catch (e2) {
      setErr(e2?.message || "Failed to send reset email");
    }
  }

  return (
    <div style={{ maxWidth: 440, margin: "70px auto", padding: 18 }}>
      <div className="card pad">
        <div className="h1">Reset password</div>
        <div className="muted" style={{ marginTop: 6 }}>Send a password reset email</div>
        <hr className="sep" />
        <form onSubmit={submit} className="grid">
          <div className="grid">
            <div className="small">Email</div>
            <input value={email} onChange={e => setEmail(e.target.value)} placeholder="you@domain.com" />
          </div>
          {status ? <div className="small" style={{ color: "var(--ok)" }}>{status}</div> : null}
          {err ? <div className="small" style={{ color: "var(--danger)" }}>{err}</div> : null}
          <button className="btn primary" type="submit" disabled={!email.trim()}>Send reset email</button>
          <div className="small"><Link to="/login" style={{ color: "var(--brand)" }}>Back to sign in</Link></div>
        </form>
      </div>
    </div>
  );
}
