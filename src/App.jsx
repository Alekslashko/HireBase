import React, { useEffect, useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "./services/firebase";
import RequireAuth from "./components/RequireAuth";
import Sidebar from "./components/Sidebar";
import CookieBanner from "./components/CookieBanner";
import VerifyEmailBanner from "./components/VerifyEmailBanner";

import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import Dashboard from "./pages/Dashboard";
import MyPosts from "./pages/MyPosts";
import Accounts from "./pages/Accounts";
import Profile from "./pages/Profile";
import Feedback from "./pages/Feedback";
import Settings from "./pages/Settings";
import AdminPosts from "./pages/admin/AdminPosts";
import AdminReports from "./pages/admin/AdminReports";

export default function App() {
  const nav = useNavigate();
  const [search, setSearch] = useState("");

  useEffect(() => {
    function onKey(e) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        const el = document.querySelector('input[aria-label="Search"]');
        if (el) el.focus();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  async function onSignOut() {
    await signOut(auth);
    nav("/login");
  }

  return (
    <>
      <CookieBanner />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        <Route path="/*" element={
          <RequireAuth>
            <div className="layout">
              <Sidebar search={search} setSearch={setSearch} onSignOut={onSignOut} />
              <div className="main">
                <VerifyEmailBanner />
                <Routes>
                  <Route path="/" element={<Dashboard globalSearch={search} />} />
                  <Route path="/my-posts" element={<MyPosts globalSearch={search} />} />
                  <Route path="/accounts" element={<Accounts globalSearch={search} />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/feedback" element={<Feedback />} />
                  <Route path="/settings" element={<Settings />} />

                  <Route path="/admin/posts" element={<AdminPosts globalSearch={search} />} />                  <Route path="/admin/reports" element={<AdminReports globalSearch={search} />} />

                  <Route path="*" element={<div className="card pad">Not found.</div>} />
                </Routes>
              </div>
            </div>
          </RequireAuth>
        } />
      </Routes>
    </>
  );
}
