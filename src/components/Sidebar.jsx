import React from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../state/AuthContext";
import { useUI } from "../state/UIContext";

export default function Sidebar({ search, setSearch, onSignOut }) {
  const { profile, isAdmin } = useAuth();
  const { theme, toggleTheme } = useUI();

  return (
    <div className="sidebar">
      <div className="card pad" style={{ height: "calc(100vh - 32px)", display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
          <div>
            <div className="h1">HireBase</div>
            <div className="small">{profile?.email || "Guest"}</div>
          </div>
          <button className="btn" onClick={toggleTheme} title="Toggle theme">
            {theme === "dark" ? "Dark" : "Light"}
          </button>
        </div>

        <div style={{ marginTop: 14 }}>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search posts / accounts…"
            aria-label="Search"
          />
          <div className="small" style={{ marginTop: 8 }}>
            Tip: <span className="kbd">Ctrl</span> + <span className="kbd">K</span>
          </div>
        </div>

        <div style={{ marginTop: 14, display: "grid", gap: 6 }}>
          <NavLink className={({isActive}) => "navitem" + (isActive ? " active" : "")} to="/">Dashboard</NavLink>
          <NavLink className={({isActive}) => "navitem" + (isActive ? " active" : "")} to="/my-posts">My posts</NavLink>
          <NavLink className={({isActive}) => "navitem" + (isActive ? " active" : "")} to="/accounts">Accounts</NavLink>
          <NavLink className={({isActive}) => "navitem" + (isActive ? " active" : "")} to="/profile">Edit account</NavLink>
          <NavLink className={({isActive}) => "navitem" + (isActive ? " active" : "")} to="/feedback">Site feedback</NavLink>
          <NavLink className={({isActive}) => "navitem" + (isActive ? " active" : "")} to="/settings">Settings</NavLink>
        </div>

        {isAdmin ? (
          <>
            <hr className="sep" />
            <div className="small">Admin</div>
            <div style={{ display: "grid", gap: 6, marginTop: 8 }}>
              <NavLink className={({isActive}) => "navitem" + (isActive ? " active" : "")} to="/admin/posts">Manage posts</NavLink>
              <NavLink className={({isActive}) => "navitem" + (isActive ? " active" : "")} to="/admin/reports">Manage reports</NavLink>
            </div>
          </>
        ) : null}

        <div style={{ marginTop: "auto", display: "grid", gap: 8 }}>
          <button className="btn danger" onClick={onSignOut}>Sign out</button>
          <div className="small muted">Role: {profile?.role || "user"}</div>
        </div>
      </div>
    </div>
  );
}
