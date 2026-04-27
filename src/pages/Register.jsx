import React, { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { Link, useNavigate } from "react-router-dom";
import { auth } from "../services/firebase";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const nav = useNavigate();

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    try {
      await createUserWithEmailAndPassword(auth, email.trim(), password);
      nav("/");
    } catch (e2) {
      setErr(e2?.message || "Registration failed");
    }
  }

  return (
    <div style={{ maxWidth: 440, margin: "70px auto", padding: 18 }}>
      <div className="card pad">
        <div className="h1">Create account</div>
        <div className="muted" style={{ marginTop: 6 }}>Email and password registration</div>
        <hr className="sep" />
        <form onSubmit={onSubmit} className="grid">
          <div className="grid">
            <div className="small">Email</div>
            <input value={email} onChange={e => setEmail(e.target.value)} placeholder="you@domain.com" />
          </div>
          <div className="grid">
            <div className="small">Password</div>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="At least 6 characters" />
          </div>
          {err ? <div className="small" style={{ color: "var(--danger)" }}>{err}</div> : null}
          <button className="btn primary" type="submit">Create Account</button>
          <div className="small">Already have one? <Link to="/login" style={{ color: "var(--brand)" }}>Sign in</Link></div>
        </form>
      </div>
    </div>
  );
}
