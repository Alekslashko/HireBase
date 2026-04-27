import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { Link, useNavigate } from "react-router-dom";
import { auth } from "../services/firebase";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const nav = useNavigate();

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      nav("/");
    } catch (e2) {
      setErr(e2?.message || "Login failed");
    }
  }

  return (
    <div style={{ maxWidth: 440, margin: "70px auto", padding: 18 }}>
      <div className="card pad">
        <div className="h1">HireBase</div>
        <div className="muted" style={{ marginTop: 6 }}>Sign in to your account</div>
        <hr className="sep" />
        <form onSubmit={onSubmit} className="grid">
          <div className="grid">
            <div className="small">Email</div>
            <input value={email} onChange={e => setEmail(e.target.value)} placeholder="you@domain.com" />
          </div>
          <div className="grid">
            <div className="small">Password</div>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
          </div>
          {err ? <div className="small" style={{ color: "var(--danger)" }}>{err}</div> : null}
          <button className="btn primary" type="submit">Sign In</button>
          <div className="small" style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
  <span>No account? <Link to="/register" style={{ color: "var(--brand)" }}>Create one</Link></span>
  <span><Link to="/forgot-password" style={{ color: "var(--brand)" }}>Forgot password?</Link></span>
</div>
        </form>
      </div>
    </div>
  );
}
