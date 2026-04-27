import React from "react";
import { useUI } from "../state/UIContext";

export default function Settings() {
  const { theme, toggleTheme } = useUI();
  return (
    <div style={{ maxWidth: 820 }}>
      <div className="topbar">
        <div>
          <div className="h1">Settings</div>
          <div className="small">UI preferences.</div>
        </div>
      </div>

      <div className="card pad grid" style={{ gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <div>
            <div style={{ fontWeight: 800 }}>Theme</div>
            <div className="small">Current: {theme}</div>
          </div>
          <button className="btn" onClick={toggleTheme}>Toggle theme</button>
        </div>
      </div>
    </div>
  );
}
