import React, { useState } from "react";
import { sendEmailVerification } from "firebase/auth";
import { auth } from "../services/firebase";
import { useAuth } from "../state/AuthContext";

export default function VerifyEmailBanner() {
  const { user } = useAuth();
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState("");

  if (!user) return null;
  if (!user.email) return null;
  if (user.emailVerified) return null;

  async function resend() {
    setErr("");
    setSent(false);
    try {
      await sendEmailVerification(auth.currentUser);
      setSent(true);
    } catch (e) {
      setErr(e?.message || "Failed to send verification email");
    }
  }

  return (
    <div className="card pad" style={{ marginBottom: 14, borderColor: "rgba(106,228,255,0.25)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
        <div>
          <div style={{ fontWeight: 900 }}>Email not verified</div>
          <div className="small">Verify your email to improve account recovery and trust.</div>
          {sent ? <div className="small" style={{ color: "var(--ok)", marginTop: 6 }}>Verification email sent.</div> : null}
          {err ? <div className="small" style={{ color: "var(--danger)", marginTop: 6 }}>{err}</div> : null}
        </div>
        <button className="btn" onClick={resend}>Resend verification</button>
      </div>
    </div>
  );
}
