import React from "react";
import { useUI } from "../state/UIContext";

export default function CookieBanner() {
  const { cookieConsent, acceptCookies, rejectCookies } = useUI();
  if (cookieConsent === "yes" || cookieConsent === "no") return null;

  return (
    <div style={{
      position: "fixed",
      left: 14, right: 14, bottom: 14,
      display: "flex",
      justifyContent: "center",
      zIndex: 1000
    }}>
      <div className="card pad" style={{ maxWidth: 920, width: "100%", display: "flex", gap: 12, alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontWeight: 800 }}>Cookies</div>
          <div className="small">Used to store theme preference and basic session UX settings.</div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn" onClick={rejectCookies}>Reject</button>
          <button className="btn primary" onClick={acceptCookies}>Accept</button>
        </div>
      </div>
    </div>
  );
}
